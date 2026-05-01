import { motion } from "framer-motion";

interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="error-banner-container"
    >
      <style>{`
        .error-banner-container {
          background: rgba(217, 45, 32, 0.08);
          border: 1px solid rgba(217, 45, 32, 0.2);
          color: var(--error);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
        }

        .error-banner-dismiss {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1.25rem;
          font-weight: bold;
          padding: 0.25rem;
          opacity: 0.7;
          transition: var(--transition);
        }

        .error-banner-dismiss:hover {
          opacity: 1;
        }
      `}</style>
      <span>{error}</span>
      <button
        onClick={onDismiss}
        type="button"
        className="error-banner-dismiss"
        aria-label="Dismiss error"
      >
        ×
      </button>
    </motion.div>
  );
}