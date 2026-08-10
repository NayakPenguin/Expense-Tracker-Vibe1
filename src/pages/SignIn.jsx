import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './SignIn.css'

export default function SignIn() {
  const navigate = useNavigate()
  const {
    authError,
    clearAuthError,
    isSigningIn,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    sendPasswordReset,
  } = useAuth()

  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const headingRef = useRef(null)

  const isSignUp = mode === 'signup'

  useEffect(() => {
    headingRef.current?.focus()
  }, [mode])

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setFormError('')
    setNotice('')
    clearAuthError()
  }

  const onFieldChange = (setter) => (event) => {
    setter(event.target.value)
    setFormError('')
    setNotice('')
    if (authError) clearAuthError()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSignUp && !name.trim()) {
      setFormError('Enter your name to continue')
      return
    }
    if (!email.trim()) {
      setFormError('Enter your email to continue')
      return
    }
    if (!password) {
      setFormError('Enter your password to continue')
      return
    }
    if (isSignUp && password.length < 6) {
      setFormError('Use at least 6 characters for your password')
      return
    }

    try {
      if (isSignUp) {
        await signUpWithEmail({ name, email: email.trim(), password })
      } else {
        await signInWithEmail({ email: email.trim(), password })
      }
      navigate('/', { replace: true })
    } catch {
      // AuthContext already turned this into a message next to the form.
    }
  }

  const handleReset = async () => {
    if (!email.trim()) {
      setFormError('Enter your email first, then tap Forgot password')
      return
    }

    setFormError('')
    try {
      await sendPasswordReset(email.trim())
      setNotice(`Password reset link sent to ${email.trim()}. Check your inbox.`)
    } catch {
      // AuthContext surfaces the failure below the form.
    }
  }

  const handleGoogle = async () => {
    await signInWithGoogle()
  }

  const message = formError || authError

  return (
    <main className="signin-shell">
      <section className="signin">
        <header className="signin__top">
          <Link className="signin__back" to="/onboarding" aria-label="Back to intro">
            <ArrowLeft size={18} strokeWidth={2.25} aria-hidden="true" />
          </Link>
          <span className="signin__brand">
            <span className="signin__brand-mark" aria-hidden="true">₹</span>
            Pace
          </span>
        </header>

        <div className="signin__copy">
          <h1 id="signin-title" ref={headingRef} tabIndex="-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="signin__subtitle">
            {isSignUp
              ? 'Start tracking your spending in a few seconds.'
              : 'Sign in to pick up where you left off.'}
          </p>
        </div>

        <div className="signin__tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            className={'signin__tab' + (!isSignUp ? ' signin__tab--active' : '')}
            onClick={() => switchMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            className={'signin__tab' + (isSignUp ? ' signin__tab--active' : '')}
            onClick={() => switchMode('signup')}
          >
            Create account
          </button>
        </div>

        <form className="signin__form" onSubmit={handleSubmit} noValidate>
          {isSignUp ? (
            <div className="signin__field">
              <label className="signin__label" htmlFor="signin-name">
                Name
              </label>
              <input
                id="signin-name"
                className="signin__input"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={onFieldChange(setName)}
              />
            </div>
          ) : null}

          <div className="signin__field">
            <label className="signin__label" htmlFor="signin-email">
              Email
            </label>
            <input
              id="signin-email"
              className="signin__input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={onFieldChange(setEmail)}
            />
          </div>

          <div className="signin__field">
            <label className="signin__label" htmlFor="signin-password">
              Password
            </label>
            <div className="signin__password-wrap">
              <input
                id="signin-password"
                className="signin__input signin__input--password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
                value={password}
                onChange={onFieldChange(setPassword)}
              />
              <button
                type="button"
                className="signin__password-toggle"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Eye size={18} strokeWidth={2} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {message ? (
            <p className="signin__error" role="alert">
              {message}
            </p>
          ) : null}

          {notice ? (
            <p className="signin__notice" role="status">
              {notice}
            </p>
          ) : null}

          <button type="submit" className="signin__submit" disabled={isSigningIn}>
            {isSigningIn
              ? 'Just a moment…'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </button>

          {!isSignUp ? (
            <button type="button" className="signin__link-button" onClick={handleReset}>
              Forgot password?
            </button>
          ) : null}
        </form>

        <div className="signin__divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="signin__google"
          onClick={handleGoogle}
          disabled={isSigningIn}
        >
          <span className="signin__google-mark" aria-hidden="true">G</span>
          Continue with Google
        </button>

        <p className="signin__privacy">
          Your expenses are saved to your own account and synced across your devices. Only you
          can read them.
        </p>
      </section>
    </main>
  )
}
