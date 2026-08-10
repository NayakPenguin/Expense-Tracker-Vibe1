# Pace Expense Tracker

A mobile-first React expense tracker with Firebase Google Authentication. Financial data currently uses local fixture-backed React state and resets whenever the page reloads.

## Local setup

1. Install dependencies with `npm ci`.
2. Create a Firebase project and register a Web app.
3. In **Firebase Console → Authentication → Sign-in method**, enable Google and select a support email.
4. In **Authentication → Settings → Authorized domains**, add `localhost` and each deployed hostname.
5. Copy `.env.example` to `.env.local` and fill in the values from **Project settings → Your apps → SDK setup and configuration**.
6. Start the app with `npm run dev`.

Required variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
```

`VITE_FIREBASE_STORAGE_BUCKET` and `VITE_FIREBASE_MESSAGING_SENDER_ID` are included for parity with the Firebase web configuration but are not used by the current auth-only integration.

Do not commit `.env.local`. Vite exposes `VITE_*` values to the browser, so they must never contain server secrets.

## Commands

- `npm run dev` — start the Vite development server
- `npm test` — run the Vitest suite once
- `npm run test:watch` — run tests in watch mode
- `npm run build` — create the production bundle
- `npm run preview` — serve the production bundle locally

## Current backend scope

Firebase is used only for Google Authentication. Transactions, categories, budgets, and theme preferences are not stored in Firestore and remain local, non-persistent prototype data.
