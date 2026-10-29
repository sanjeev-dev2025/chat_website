/**
 * LoginPage.jsx — Authentication screen (Sign In & Registration)
 */
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill="rgba(255,255,255,0.9)"
      />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
}

export default function LoginPage() {
  const { login, register } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'register'

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword]     = useState('')

  // Register form state
  const [regUsername, setRegUsername]               = useState('')
  const [regEmail, setRegEmail]                     = useState('')
  const [regPassword1, setRegPassword1]             = useState('')
  const [regPassword2, setRegPassword2]             = useState('')

  // Status & feedback
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [fieldErrs, setFieldErrs] = useState({})

  function switchMode(newMode) {
    setMode(newMode)
    setError('')
    setSuccess('')
    setFieldErrs({})
  }

  function validateLogin() {
    const errs = {}
    if (!loginIdentifier.trim()) errs.loginIdentifier = 'Username or email is required.'
    if (!loginPassword)          errs.loginPassword   = 'Password is required.'
    return errs
  }

  function validateRegister() {
    const errs = {}
    if (!regUsername.trim()) {
      errs.username = 'Username is required.'
    } else if (regUsername.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters.'
    }

    if (!regEmail.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      errs.email = 'Please enter a valid email address.'
    }

    if (!regPassword1) {
      errs.password = 'Password is required.'
    } else if (regPassword1.length < 6) {
      errs.password = 'Password should be at least 6 characters.'
    }

    if (!regPassword2) {
      errs.confirmPassword = 'Confirm your password.'
    } else if (regPassword1 !== regPassword2) {
      errs.confirmPassword = 'Passwords do not match.'
    }

    return errs
  }

  async function handleLoginSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const errs = validateLogin()
    if (Object.keys(errs).length) {
      setFieldErrs(errs)
      return
    }
    setFieldErrs({})
    setLoading(true)

    try {
      await login(loginIdentifier.trim(), loginPassword)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const errs = validateRegister()
    if (Object.keys(errs).length) {
      setFieldErrs(errs)
      return
    }
    setFieldErrs({})
    setLoading(true)

    try {
      const res = await register(
        regUsername.trim(),
        regEmail.trim(),
        regPassword1,
        regPassword2
      )

      if (res?.detail) {
        setSuccess(res.detail)
        switchMode('login')
      }
    } catch (err) {
      setError(err.message)
      if (err.fieldErrors) {
        setFieldErrs(err.fieldErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" role="main">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo" aria-label="ChatRoom logo">
          <div className="auth-logo-icon" aria-hidden="true">
            <ChatIcon />
          </div>
          <span className="auth-logo-text">
            Chat<span>Room</span>
          </span>
        </div>

        {/* Heading */}
        <h1 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to join the conversation'
            : 'Join ChatRoom and start messaging instantly'}
        </p>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => switchMode('login')}
            disabled={loading}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => switchMode('register')}
            disabled={loading}
          >
            Register
          </button>
        </div>

        {/* Success banner */}
        {success && (
          <div className="auth-success-banner" role="status" aria-live="polite">
            <CheckIcon />
            <span>{success}</span>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="auth-error-banner" role="alert" aria-live="assertive">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} noValidate aria-label="Login form">
            <div className="field-group">
              <label htmlFor="login-username" className="field-label">
                Username or Email
              </label>
              <input
                id="login-username"
                type="text"
                className={`field-input${fieldErrs.loginIdentifier ? ' error' : ''}`}
                placeholder="Username or email address"
                value={loginIdentifier}
                autoComplete="username email"
                autoFocus
                disabled={loading}
                onChange={e => {
                  setLoginIdentifier(e.target.value)
                  setFieldErrs(p => ({ ...p, loginIdentifier: '' }))
                }}
                aria-required="true"
                aria-invalid={!!fieldErrs.loginIdentifier}
                aria-describedby={fieldErrs.loginIdentifier ? 'err-login-id' : undefined}
              />
              {fieldErrs.loginIdentifier && (
                <div id="err-login-id" className="field-error" role="alert">
                  <AlertIcon />
                  {fieldErrs.loginIdentifier}
                </div>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="login-password" className="field-label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className={`field-input${fieldErrs.loginPassword ? ' error' : ''}`}
                placeholder="••••••••"
                value={loginPassword}
                autoComplete="current-password"
                disabled={loading}
                onChange={e => {
                  setLoginPassword(e.target.value)
                  setFieldErrs(p => ({ ...p, loginPassword: '' }))
                }}
                aria-required="true"
                aria-invalid={!!fieldErrs.loginPassword}
                aria-describedby={fieldErrs.loginPassword ? 'err-login-pw' : undefined}
              />
              {fieldErrs.loginPassword && (
                <div id="err-login-pw" className="field-error" role="alert">
                  <AlertIcon />
                  {fieldErrs.loginPassword}
                </div>
              )}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              aria-busy={loading}
            >
              {loading && <span className="spinner" aria-hidden="true" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="auth-switch">
              Don&apos;t have an account?
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => switchMode('register')}
                disabled={loading}
              >
                Create an account
              </button>
            </p>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} noValidate aria-label="Registration form">
            <div className="field-group">
              <label htmlFor="reg-username" className="field-label">
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                className={`field-input${fieldErrs.username ? ' error' : ''}`}
                placeholder="Choose a username"
                value={regUsername}
                autoComplete="username"
                autoFocus
                disabled={loading}
                onChange={e => {
                  setRegUsername(e.target.value)
                  setFieldErrs(p => ({ ...p, username: '' }))
                }}
                aria-required="true"
                aria-invalid={!!fieldErrs.username}
                aria-describedby={fieldErrs.username ? 'err-reg-username' : undefined}
              />
              {fieldErrs.username && (
                <div id="err-reg-username" className="field-error" role="alert">
                  <AlertIcon />
                  {fieldErrs.username}
                </div>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="reg-email" className="field-label">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                className={`field-input${fieldErrs.email ? ' error' : ''}`}
                placeholder="you@example.com"
                value={regEmail}
                autoComplete="email"
                disabled={loading}
                onChange={e => {
                  setRegEmail(e.target.value)
                  setFieldErrs(p => ({ ...p, email: '' }))
                }}
                aria-required="true"
                aria-invalid={!!fieldErrs.email}
                aria-describedby={fieldErrs.email ? 'err-reg-email' : undefined}
              />
              {fieldErrs.email && (
                <div id="err-reg-email" className="field-error" role="alert">
                  <AlertIcon />
                  {fieldErrs.email}
                </div>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="reg-password" className="field-label">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                className={`field-input${fieldErrs.password ? ' error' : ''}`}
                placeholder="••••••••"
                value={regPassword1}
                autoComplete="new-password"
                disabled={loading}
                onChange={e => {
                  setRegPassword1(e.target.value)
                  setFieldErrs(p => ({ ...p, password: '' }))
                }}
                aria-required="true"
                aria-invalid={!!fieldErrs.password}
                aria-describedby={fieldErrs.password ? 'err-reg-pw' : undefined}
              />
              {fieldErrs.password && (
                <div id="err-reg-pw" className="field-error" role="alert">
                  <AlertIcon />
                  {fieldErrs.password}
                </div>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="reg-confirm-password" className="field-label">
                Confirm Password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                className={`field-input${fieldErrs.confirmPassword ? ' error' : ''}`}
                placeholder="••••••••"
                value={regPassword2}
                autoComplete="new-password"
                disabled={loading}
                onChange={e => {
                  setRegPassword2(e.target.value)
                  setFieldErrs(p => ({ ...p, confirmPassword: '' }))
                }}
                aria-required="true"
                aria-invalid={!!fieldErrs.confirmPassword}
                aria-describedby={fieldErrs.confirmPassword ? 'err-reg-pw2' : undefined}
              />
              {fieldErrs.confirmPassword && (
                <div id="err-reg-pw2" className="field-error" role="alert">
                  <AlertIcon />
                  {fieldErrs.confirmPassword}
                </div>
              )}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              aria-busy={loading}
            >
              {loading && <span className="spinner" aria-hidden="true" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="auth-switch">
              Already have an account?
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => switchMode('login')}
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
