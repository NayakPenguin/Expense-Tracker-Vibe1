import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

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
export let db = null

const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY?.trim()

/** True once App Check is attesting requests; false means the project is unprotected. */
export let appCheckEnabled = false

if (missingFirebaseConfig.length === 0) {
  try {
    const app = initializeApp(firebaseConfig)

    // App Check proves requests come from this app rather than someone
    // replaying the public config. It is opt-in via env var so local
    // development and CI keep working without a reCAPTCHA key; without it the
    // project is reachable by anyone holding the client config.
    if (appCheckSiteKey) {
      if (import.meta.env.DEV) {
        // Lets localhost obtain a debug token instead of failing attestation.
        // The token must be registered in the console; see README.
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
      }
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      })
      appCheckEnabled = true
    }

    auth = getAuth(app)
    // Persistent local cache keeps the app usable offline and makes reloads
    // instant — reads come from disk first, then reconcile with the server.
    // The multi-tab manager keeps two open tabs from fighting over that cache.
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  } catch (error) {
    firebaseInitializationError = error
  }
}
