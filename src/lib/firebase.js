import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId']

export const missingFirebaseConfig = requiredConfig.filter(
  (key) => !firebaseConfig[key]?.trim()
)

export let firebaseInitializationError = null
export let auth = null

if (missingFirebaseConfig.length === 0) {
  try {
    const app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  } catch (error) {
    firebaseInitializationError = error
  }
}
