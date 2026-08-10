import './DataErrorScreen.css'

/**
 * Shown when Firestore refuses or fails a read. `permission-denied` almost
 * always means the security rules were not published, which is a setup problem
 * rather than something the user can retry their way out of — so it gets its
 * own message.
 */
export default function DataErrorScreen({ error }) {
  const isPermissionDenied = error?.code === 'permission-denied'

  return (
    <main className="data-error" role="alert">
      <div className="data-error__card">
        <h1 className="data-error__title">We couldn’t load your data</h1>
        <p className="data-error__body">
          {isPermissionDenied
            ? 'This account is not allowed to read its own data. Check that the Firestore security rules have been published.'
            : 'Check your internet connection, then reload the page.'}
        </p>
        <button
          type="button"
          className="data-error__retry"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    </main>
  )
}
