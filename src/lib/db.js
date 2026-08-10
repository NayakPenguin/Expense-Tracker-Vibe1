/**
 * Firestore schema and data access.
 *
 *   users/{uid}                          document
 *     displayName, email                 identity mirrored from Firebase Auth
 *     monthlyBudget                      budget settings
 *     hasCompletedSetup                   gates the first-run setup flow
 *     createdAt, updatedAt
 *
 *   users/{uid}/categories/{categoryId}  subcollection
 *     name, color, icon, isDefault, order
 *
 *   users/{uid}/transactions/{txId}      subcollection
 *     categoryId, merchant, note, date, amount, direction, createdAt
 *
 * Transactions and categories are subcollections rather than arrays on the
 * user document because transactions grow without bound and a Firestore
 * document is capped at 1 MiB. Every path is nested under users/{uid}, which
 * is what lets the security rules isolate accounts with a single ownership
 * check — see firestore.rules.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import categoriesFixture from '../mock/categories.json'

export const FALLBACK_CATEGORY_ID = 'other'

export const DEFAULT_BUDGET = { monthlyBudget: 30000 }

// Firestore caps a batch at 500 writes; stay under it when reassigning the
// transactions of a deleted category.
const BATCH_LIMIT = 450

/**
 * The live subscription is capped so that app cost and startup latency stay
 * flat as history grows, instead of scaling with every expense ever recorded.
 * Home only needs the current month plus the eight most recent rows, so this
 * is far more than it can use. Anything wider — the Detailed View date ranges
 * — goes through fetchTransactionsInRange instead of this subscription.
 */
const RECENT_TRANSACTION_LIMIT = 200

/** Upper bound on a single range query, so a wide range can't run away either. */
const RANGE_TRANSACTION_LIMIT = 2000

export function userDocRef(uid) {
  return doc(db, 'users', uid)
}

export function categoriesRef(uid) {
  return collection(db, 'users', uid, 'categories')
}

export function transactionsRef(uid) {
  return collection(db, 'users', uid, 'transactions')
}

/**
 * Creates the user document and seeds the default categories the first time an
 * account is seen. Returns whether this was a first run, which is what routes
 * the user into the setup flow.
 */
export async function ensureUserDocument(uid, { displayName, email }) {
  const ref = userDocRef(uid)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    return { isNewUser: false, hasCompletedSetup: snapshot.data().hasCompletedSetup === true }
  }

  const batch = writeBatch(db)

  batch.set(ref, {
    displayName: displayName ?? null,
    email: email ?? null,
    ...DEFAULT_BUDGET,
    hasCompletedSetup: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  categoriesFixture.forEach((category, index) => {
    batch.set(doc(categoriesRef(uid), category.id), {
      name: category.name,
      color: category.color,
      icon: category.icon,
      isDefault: true,
      order: index,
    })
  })

  await batch.commit()
  return { isNewUser: true, hasCompletedSetup: false }
}

/**
 * Live subscription to everything the app renders. Firestore pushes updates as
 * they happen, so a change on another device shows up without a reload.
 * Returns a single unsubscribe that tears down all three listeners.
 */
export function subscribeToUserData(uid, { onSettings, onCategories, onTransactions, onError }) {
  const handleError = (error) => onError?.(error)

  const unsubSettings = onSnapshot(
    userDocRef(uid),
    (snapshot) => onSettings(snapshot.exists() ? snapshot.data() : null),
    handleError
  )

  const unsubCategories = onSnapshot(
    categoriesRef(uid),
    (snapshot) => {
      const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      onCategories(rows)
    },
    handleError
  )

  const unsubTransactions = onSnapshot(
    query(
      transactionsRef(uid),
      orderBy('date', 'desc'),
      limit(RECENT_TRANSACTION_LIMIT)
    ),
    (snapshot) => onTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    handleError
  )

  return () => {
    unsubSettings()
    unsubCategories()
    unsubTransactions()
  }
}

/**
 * One-off read for a date range, used by the Detailed View. Deliberately not a
 * live subscription: the ranges can be wide, and holding a listener open on a
 * year of history is exactly the unbounded cost this design avoids.
 * `date` is a YYYY-MM-DD string, so range filters sort lexicographically and
 * need only the automatic single-field index.
 */
export async function fetchTransactionsInRange(uid, start, end) {
  if (!start || !end) return []

  const snapshot = await getDocs(
    query(
      transactionsRef(uid),
      where('date', '>=', start),
      where('date', '<=', end),
      orderBy('date', 'desc'),
      limit(RANGE_TRANSACTION_LIMIT)
    )
  )

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function updateBudget(uid, monthlyBudget) {
  await updateDoc(userDocRef(uid), { monthlyBudget, updatedAt: serverTimestamp() })
}

export async function completeSetup(uid, { monthlyBudget }) {
  await updateDoc(userDocRef(uid), {
    monthlyBudget,
    hasCompletedSetup: true,
    updatedAt: serverTimestamp(),
  })
}

export async function addTransaction(uid, transaction) {
  const ref = doc(transactionsRef(uid))
  await setDoc(ref, {
    direction: 'debit',
    note: null,
    ...transaction,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * Partial update. Firestore merges into the existing document, and the
 * security rules validate the merged result, so a partial write still has to
 * leave the transaction in a valid shape.
 */
export async function updateTransaction(uid, id, updates) {
  await updateDoc(doc(transactionsRef(uid), id), updates)
}

export async function deleteTransaction(uid, id) {
  await deleteDoc(doc(transactionsRef(uid), id))
}

export async function addCategory(uid, category) {
  const ref = doc(categoriesRef(uid))
  await setDoc(ref, { isDefault: false, order: Date.now(), ...category })
  return ref.id
}

export async function updateCategory(uid, id, updates) {
  await updateDoc(doc(categoriesRef(uid), id), updates)
}

/**
 * Deletes a category and moves its transactions to Other, so no record is left
 * pointing at a category that no longer exists. Other is the reassignment
 * target and so is never deletable.
 */
export async function deleteCategory(uid, id) {
  if (id === FALLBACK_CATEGORY_ID) return

  const affected = await getDocs(query(transactionsRef(uid), where('categoryId', '==', id)))

  for (let i = 0; i < affected.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    affected.docs.slice(i, i + BATCH_LIMIT).forEach((d) => {
      batch.update(d.ref, { categoryId: FALLBACK_CATEGORY_ID })
    })
    await batch.commit()
  }

  await deleteDoc(doc(categoriesRef(uid), id))
}
