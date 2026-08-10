import './AuthLoadingScreen.css'

export default function AuthLoadingScreen() {
  return (
    <main className="auth-loading" aria-live="polite" aria-busy="true">
      <div className="auth-loading__mark" aria-hidden="true" />
      <p>Getting your account ready…</p>
    </main>
  )
}
