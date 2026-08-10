import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChartPie, Gauge, ReceiptText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Onboarding.css'

const STEPS = [
  {
    eyebrow: 'Everyday clarity',
    title: 'Track every expense',
    description: 'Log spending in seconds and keep your month in one calm view.',
    Icon: ReceiptText,
    accent: 'coral',
  },
  {
    eyebrow: 'Useful patterns',
    title: 'See the patterns',
    description: 'Understand where your money goes with clear category breakdowns.',
    Icon: ChartPie,
    accent: 'indigo',
  },
  {
    eyebrow: 'A calmer month',
    title: 'Stay on budget',
    description: 'Know what’s safe to spend each day.',
    Icon: Gauge,
    accent: 'emerald',
  },
]

export default function Onboarding() {
  const [stepIndex, setStepIndex] = useState(0)
  const headingRef = useRef(null)
  const { authError, isSigningIn, signInWithGoogle } = useAuth()
  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1

  useEffect(() => {
    if (stepIndex > 0) headingRef.current?.focus()
  }, [stepIndex])

  return (
    <main className="onboarding-shell">
      <section className="onboarding" aria-labelledby="onboarding-title">
        <header className="onboarding__brand">
          <span className="onboarding__brand-mark" aria-hidden="true">₹</span>
          <span>Pace</span>
        </header>

        <div className={`onboarding__visual onboarding__visual--${step.accent}`}>
          <span className="onboarding__orbit onboarding__orbit--outer" aria-hidden="true" />
          <span className="onboarding__orbit onboarding__orbit--inner" aria-hidden="true" />
          <div className="onboarding__icon-wrap">
            <step.Icon size={54} strokeWidth={1.6} aria-hidden="true" />
          </div>
        </div>

        <div className="onboarding__copy">
          <p className="onboarding__eyebrow">{step.eyebrow}</p>
          <h1 id="onboarding-title" ref={headingRef} tabIndex="-1">{step.title}</h1>
          <p className="onboarding__description">{step.description}</p>
        </div>

        <div className="onboarding__progress" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={index === stepIndex ? 'onboarding__dot onboarding__dot--active' : 'onboarding__dot'}
              aria-current={index === stepIndex ? 'step' : undefined}
            />
          ))}
        </div>

        {authError && isLastStep ? (
          <p className="onboarding__error" role="alert">{authError}</p>
        ) : null}

        <div className="onboarding__actions">
          {stepIndex > 0 ? (
            <button
              type="button"
              className="onboarding__button onboarding__button--secondary"
              onClick={() => setStepIndex((current) => current - 1)}
            >
              <ArrowLeft size={19} aria-hidden="true" />
              Back
            </button>
          ) : null}

          {isLastStep ? (
            <button
              type="button"
              className="onboarding__button onboarding__button--google"
              onClick={signInWithGoogle}
              disabled={isSigningIn}
            >
              <span className="onboarding__google-mark" aria-hidden="true">G</span>
              {isSigningIn ? 'Connecting to Google…' : 'Continue with Google'}
            </button>
          ) : (
            <button
              type="button"
              className="onboarding__button onboarding__button--primary"
              onClick={() => setStepIndex((current) => current + 1)}
            >
              Next
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          )}
        </div>

        {isLastStep ? (
          <Link className="onboarding__alt-auth" to="/signin">
            Use email instead
          </Link>
        ) : null}

        <p className="onboarding__privacy">
          We only use your account to identify you. Your expenses are private to you and synced
          across your devices.
        </p>
      </section>
    </main>
  )
}
