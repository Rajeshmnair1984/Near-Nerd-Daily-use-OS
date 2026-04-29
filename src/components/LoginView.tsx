import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Building2, User, Eye, EyeOff } from 'lucide-react'
import AuthService from '@services/AuthService'
import { passwordSchema } from '@/schemas/validation'
import { useUser } from '@/context/UserContext'

interface LoginViewProps {
  onLoginSuccess?: () => void
}

type AuthMode = 'login' | 'signup'

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useUser()

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [orgName, setOrgName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Use the context login to ensure state updates globally
      await login(loginEmail, loginPassword)
      onLoginSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await passwordSchema.validate(signupPassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid password')
      return
    }

    setLoading(true)

    try {
      await AuthService.signUp({
        email: signupEmail,
        password: signupPassword,
        fullName,
        organizationName: orgName,
      })
      
      // After signup, we log in automatically
      await login(signupEmail, signupPassword)
      onLoginSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-premium">
      <style>{`
        .login-page-premium {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: clamp(1rem, 4vh, 2rem) 1rem;
          overflow-y: auto;
        }

        .login-card-premium {
          background: white;
          border-radius: 16px;
          padding: clamp(1.25rem, 3vw, 2rem);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          width: 100%;
          max-width: 420px;
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
        }

        .login-header-premium {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header-signup {
          margin-bottom: 1.25rem;
        }

        .login-title-premium {
          font-size: 1.75rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .login-subtitle-premium {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .login-error-premium {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .login-form-group {
          margin-bottom: 1rem;
        }

        .login-form-group-last {
          margin-bottom: 1.5rem;
        }

        .login-label-premium {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .login-input-wrapper {
          position: relative;
        }

        .login-input-premium {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          box-sizing: border-box;
          color: #374151;
          transition: border-color 0.2s;
        }

        .login-input-premium:focus {
          outline: none;
          border-color: #667eea;
        }

        .login-input-password {
          padding: 10px 40px;
        }

        .login-field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .login-password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-submit-btn {
          width: 100%;
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          transition: transform 0.1s, opacity 0.2s;
        }

        .login-submit-btn-active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
        }

        .login-submit-btn-active:active {
          transform: scale(0.98);
        }

        .login-submit-btn-loading {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .login-footer-premium {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .login-mode-btn {
          color: #667eea;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: inherit;
        }

        .login-mode-btn:hover {
          text-decoration: underline;
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card-premium"
      >
        <header className={`login-header-premium ${mode === 'signup' ? 'login-header-signup' : ''}`}>
          <h1 className="login-title-premium">Near Nerd</h1>
          <p className="login-subtitle-premium">Operations Portal</p>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="login-error-premium"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="login-form-group">
              <label className="login-label-premium" htmlFor="login-email">
                Email
              </label>
              <div className="login-input-wrapper">
                <Mail size={18} className="login-field-icon" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="login-input-premium"
                  required
                />
              </div>
            </div>

            <div className="login-form-group-last">
              <label className="login-label-premium" htmlFor="login-password">
                Password
              </label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-field-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input-premium login-input-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`login-submit-btn ${loading ? 'login-submit-btn-loading' : 'login-submit-btn-active'}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="login-footer-premium">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="login-mode-btn"
              >
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="login-form-group">
              <label className="login-label-premium" htmlFor="signup-fullname">
                Full Name
              </label>
              <div className="login-input-wrapper">
                <User size={18} className="login-field-icon" aria-hidden="true" />
                <input
                  id="signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="login-input-premium"
                  required
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-label-premium" htmlFor="signup-orgname">
                Organization Name
              </label>
              <div className="login-input-wrapper">
                <Building2 size={18} className="login-field-icon" aria-hidden="true" />
                <input
                  id="signup-orgname"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Your Company"
                  className="login-input-premium"
                  required
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-label-premium" htmlFor="signup-email">
                Email
              </label>
              <div className="login-input-wrapper">
                <Mail size={18} className="login-field-icon" aria-hidden="true" />
                <input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="login-input-premium"
                  required
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-label-premium" htmlFor="signup-password">
                Password
              </label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-field-icon" aria-hidden="true" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input-premium login-input-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="login-form-group-last">
              <label className="login-label-premium" htmlFor="signup-confirm-password">
                Confirm Password
              </label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-field-icon" aria-hidden="true" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input-premium login-input-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`login-submit-btn ${loading ? 'login-submit-btn-loading' : 'login-submit-btn-active'}`}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <p className="login-footer-premium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="login-mode-btn"
              >
                Login
              </button>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  )
}
