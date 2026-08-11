# Pace Expense Tracker

A mobile-first React expense tracker built on Firebase. Sign in with Google or email/password; expenses, categories, and budget are stored per-account in Cloud Firestore and sync across devices.

## Local setup

1. Install dependencies with `npm ci`.
2. Create a Firebase project and register a Web app.
3. In **Firebase Console → Authentication → Sign-in method**, enable Google (selecting a support email) and Email/Password. Leave "Email link (passwordless sign-in)" off — the app uses passwords, not magic links.
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
- `npm run deploy` — build, then deploy to Firebase Hosting
- `npm run deploy:rules` — deploy `firestore.rules` only

## Deploying

Hosted on Firebase Hosting, configured in `firebase.json`; `.firebaserc` pins the project to `expense-tracker-94232`.

One-time, on each machine that deploys:

```bash
npx --yes firebase-tools login
```

Then, from a clean tree:

```bash
npm test && npm run deploy
```

That builds into `dist/` and uploads it. The app is served at `https://expense-tracker-94232.web.app`, which is already in Firebase's authorized-domains list, so Google and email sign-in work without extra setup.

Two things to know about the build:

- **`VITE_*` values are baked in at build time**, read from `.env.local`. Deploying from a machine without a populated `.env.local` produces a bundle that cannot reach Firebase. There is no runtime configuration.
- **`index.html` is served with `no-cache` while `/assets/**` is cached for a year.** The asset filenames are content-hashed, so this is safe — and it is what lets a redeploy reach users immediately instead of leaving them on a stale `index.html` that points at deleted chunks. The app's error boundary handles that case for tabs that are already open.

Rollback is available from the Firebase Console under **Hosting → Release history**, which keeps previous releases and can restore one in a click.

### Deploys are manual

Deploying is a local `npm run deploy` from a machine with a populated `.env.local`. There is no automatic deploy on push.

A GitHub Actions pipeline was tried and removed: publishing from Actions needs repository secrets (a Firebase service account key plus the `VITE_*` build values), and adding those requires **admin** permission on the repository. Anyone with only collaborator access cannot set them up, so the workflow could never authenticate and failed on every push.

If the repository owner wants automatic deploys later, the pieces needed are:

- a service account with the Firebase Hosting Admin role, and a JSON key stored as a repository secret
- the six `VITE_FIREBASE_*` values as repository secrets, since Vite inlines them at build time
- a workflow that runs `npm test` and `npm run build` first, and deploys only the artifact it just verified

`.github/workflows/ci.yml` still runs tests and a build on every pull request and on pushes to `main`; it just does not deploy.

## Data model

Everything a user owns is nested under one document, which is what makes the security rules a single ownership check:

```text
users/{uid}                          displayName, email, monthlyBudget, income,
                                     incomeHidden, hasCompletedSetup, createdAt, updatedAt
users/{uid}/categories/{categoryId}  name, color, icon, isDefault, order
users/{uid}/transactions/{txId}      categoryId, merchant, note, date, amount,
                                     direction, createdAt
```

Transactions and categories are subcollections rather than arrays because transactions grow without bound and a Firestore document is capped at 1 MiB.

The schema and every read/write live in `src/lib/db.js` — no other module imports `firebase/firestore` directly. Offline persistence is enabled, so the app works without a connection and reconciles when it returns. Theme preference is the one thing still in `localStorage`, since it describes the device rather than the account.

### Security rules

`firestore.rules` is the source of truth and is already published. A user can read and write only their own `users/{uid}` tree; everything else is denied. Writes are additionally shape-checked — amounts must be positive numbers, `date` must match `YYYY-MM-DD` (the range queries depend on it), `direction` must be `debit` or `credit`, and strings are length-capped — so a hand-rolled client cannot corrupt or bloat an account. Redeploy after editing:

```bash
npx firebase-tools deploy --only firestore:rules
```

### App Check (not yet enabled)

The Firebase web config ships in the client bundle by design. The security rules stop one user reading another's data, but nothing stops someone extracting the config and creating unlimited accounts and documents against your quota. App Check closes that.

The client code is already wired and activates as soon as a site key exists — it is a no-op while `VITE_FIREBASE_APPCHECK_SITE_KEY` is empty, so local development and CI work without one. To turn it on:

1. Create a **reCAPTCHA v3** key pair at [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) for your deployed domain plus `localhost`.
2. Firebase Console → **App Check → Apps → expense-tracker-web → Register**, choose reCAPTCHA, and paste the **secret** key there.
3. Put the **site** key in `.env.local` as `VITE_FIREBASE_APPCHECK_SITE_KEY`.
4. Run the app locally once — the console logs a debug token. Register it under **App Check → Apps → ⋮ → Manage debug tokens**, or local development will fail attestation.
5. Only then set **App Check → APIs → Cloud Firestore → Enforce**. Enforcing before steps 1–4 will lock the app out of its own database.

### First run

A new account is seeded with the eight default categories and `hasCompletedSetup: false`, which routes it to `/setup` — a two-step flow for setting the monthly budget and customizing categories. Home is unreachable until that completes.
