import { Component } from 'react'
import './ErrorBoundary.css'

/**
 * Last line of defence against a white screen.
 *
 * The common case in production is not a logic bug but a failed lazy chunk:
 * every route here is `lazy()`, and a redeploy replaces the hashed chunk files
 * that an already-open tab still points at. That failure is fully recoverable
 * by reloading, so it gets its own message and a reload button rather than a
 * generic apology.
 */
function isChunkLoadError(error) {
  const message = `${error?.name ?? ''} ${error?.message ?? ''}`
  return /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed/i.test(
    message
  )
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // No error reporting service wired up yet; the console is what a developer
    // has to work with, so make sure the component stack survives.
    console.error('Unhandled error in React tree:', error, info?.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const staleBuild = isChunkLoadError(error)

    return (
      <main className="error-boundary" role="alert">
        <div className="error-boundary__card">
          <h1 className="error-boundary__title">
            {staleBuild ? 'A new version is available' : 'Something went wrong'}
          </h1>
          <p className="error-boundary__body">
            {staleBuild
              ? 'This tab is running an older version of the app. Reload to get the current one.'
              : 'The app hit an unexpected error. Reloading usually clears it — your data is safe.'}
          </p>
          <button
            type="button"
            className="error-boundary__retry"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </main>
    )
  }
}
