import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Building2,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import AuthService from "@services/AuthService";
import { passwordSchema } from "@/schemas/validation";
import { useUser } from "@/context/UserContext";

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

type AuthMode = "login" | "signup";

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useUser();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      onLoginSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication sequence failed. Verify credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupPassword !== signupConfirmPassword) {
      setError("Neural mismatch: Passwords do not correlate.");
      return;
    }

    try {
      await passwordSchema.validate(signupPassword);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Entropy failure: Password requirements not met.",
      );
      return;
    }

    setLoading(true);

    try {
      await AuthService.signUp({
        email: signupEmail,
        password: signupPassword,
        fullName,
        organizationName: orgName,
      });

      await login(signupEmail, signupPassword);
      onLoginSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Entity initialization failed. Domain conflict detected.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-premium">
      <style>{`
        .login-page-premium {
          min-height: 100vh;
          background: var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .login-page-premium::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 0% 0%, rgba(0, 113, 227, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(0, 113, 227, 0.05) 0%, transparent 50%);
          z-index: 0;
        }

        .login-card-premium {
          background: var(--bg-card);
          border-radius: 40px;
          padding: 3.5rem;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 480px;
          z-index: 1;
          border: 1px solid var(--border-strong);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .login-header-premium {
          text-align: center;
          margin-bottom: 3rem;
        }

        .login-logo-box {
          width: 64px;
          height: 64px;
          background: var(--primary);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1.5rem;
          box-shadow: 0 10px 20px rgba(0, 113, 227, 0.3);
        }

        .login-title-premium {
          font-size: 2.5rem;
          font-weight: 950;
          letter-spacing: -0.05em;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .login-subtitle-premium {
          color: var(--text-secondary);
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .login-error-premium {
          background: rgba(217, 45, 32, 0.1);
          color: var(--error);
          padding: 1rem 1.25rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          font-weight: 700;
          border: 1px solid rgba(217, 45, 32, 0.2);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .login-form-group {
          margin-bottom: 1.5rem;
        }

        .login-label-premium {
          display: block;
          font-size: 0.8rem;
          font-weight: 900;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
        }

        .login-input-wrapper {
          position: relative;
        }

        .login-input-premium {
          width: 100%;
          padding: 1.1rem 1.25rem 1.1rem 3.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          transition: var(--transition);
        }

        .login-input-premium:focus {
          outline: none;
          border-color: var(--primary);
          background: var(--surface-soft);
          box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
        }

        .login-field-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          pointer-events: none;
          transition: var(--transition);
        }

        .login-input-premium:focus + .login-field-icon {
          color: var(--primary);
        }

        .login-password-toggle {
          position: absolute;
          right: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          transition: var(--transition);
        }

        .login-password-toggle:hover {
          background: var(--surface-soft);
          color: var(--primary);
        }

        .login-submit-btn {
          width: 100%;
          padding: 1.25rem;
          border-radius: 100px;
          background: var(--primary);
          color: white;
          border: none;
          font-size: 1.1rem;
          font-weight: 950;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 12px 24px rgba(0, 113, 227, 0.25);
          margin-top: 1rem;
        }

        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(0, 113, 227, 0.35);
          background: var(--primary-hover);
        }

        .login-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .login-footer-premium {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .login-mode-btn {
          color: var(--primary);
          font-weight: 900;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0 0.5rem;
          font-size: inherit;
        }

        .login-mode-btn:hover {
          text-decoration: underline;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="login-card-premium"
        role="main"
        aria-busy={loading}
      >
        <header className="login-header-premium">
          <div className="login-logo-box" aria-hidden="true">
            <ShieldCheck size={36} />
          </div>
          <h1 className="login-title-premium">Near Nerd</h1>
          <p className="login-subtitle-premium">Operational Matrix</p>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="login-error-premium"
            role="alert"
          >
            <Lock size={18} aria-hidden="true" />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              aria-label="Secure login portal"
            >
              <div className="login-form-group">
                <label className="login-label-premium" htmlFor="login-email">
                  System Endpoint (Email)
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="neural@endpoint.com"
                    className="login-input-premium"
                    required
                    autoComplete="username"
                  />
                  <Mail
                    size={20}
                    className="login-field-icon"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div
                className="login-form-group"
                style={{ marginBottom: "2.5rem" }}
              >
                <label className="login-label-premium" htmlFor="login-password">
                  Security Cipher (Password)
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="login-input-premium"
                    required
                    autoComplete="current-password"
                  />
                  <Lock
                    size={20}
                    className="login-field-icon"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-password-toggle"
                    aria-label={
                      showPassword
                        ? "Obfuscate security cipher"
                        : "Reveal security cipher"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={20} aria-hidden="true" />
                    ) : (
                      <Eye size={20} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? "SYNCHRONIZING..." : "INITIALIZE SESSION"}
              </button>

              <p className="login-footer-premium">
                New entity?
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="login-mode-btn"
                >
                  INITIALIZE ACCOUNT
                </button>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSignup}
              aria-label="Entity initialization portal"
            >
              <div className="login-form-group">
                <label
                  className="login-label-premium"
                  htmlFor="signup-fullname"
                >
                  LEGAL ENTITY NAME
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="signup-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="login-input-premium"
                    required
                  />
                  <User
                    size={20}
                    className="login-field-icon"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="login-form-group">
                <label className="login-label-premium" htmlFor="signup-orgname">
                  ORGANIZATION DOMAIN
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="signup-orgname"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enterprise Corp"
                    className="login-input-premium"
                    required
                  />
                  <Building2
                    size={20}
                    className="login-field-icon"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="login-form-group">
                <label className="login-label-premium" htmlFor="signup-email">
                  PRIMARY ENDPOINT
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="admin@domain.com"
                    className="login-input-premium"
                    required
                    autoComplete="email"
                  />
                  <Mail
                    size={20}
                    className="login-field-icon"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="login-form-group">
                <label
                  className="login-label-premium"
                  htmlFor="signup-password"
                >
                  SECURITY CIPHER
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="login-input-premium"
                    required
                    autoComplete="new-password"
                  />
                  <Lock
                    size={20}
                    className="login-field-icon"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-password-toggle"
                    aria-label={
                      showPassword
                        ? "Obfuscate security cipher"
                        : "Reveal security cipher"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={20} aria-hidden="true" />
                    ) : (
                      <Eye size={20} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div
                className="login-form-group"
                style={{ marginBottom: "2.5rem" }}
              >
                <label
                  className="login-label-premium"
                  htmlFor="signup-confirm-password"
                >
                  CONFIRM CIPHER
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="login-input-premium"
                    required
                    autoComplete="new-password"
                  />
                  <Lock
                    size={20}
                    className="login-field-icon"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? "INITIALIZING ENTITY..." : "COMMENCE DEPLOYMENT"}
              </button>

              <p className="login-footer-premium">
                Existing session?
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="login-mode-btn"
                >
                  RESUME ACCESS
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
