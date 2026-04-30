import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const iconMap = {
  success: <CheckCircle2 size={20} aria-hidden="true" />,
  error: <AlertCircle size={20} aria-hidden="true" />,
  warning: <AlertTriangle size={20} aria-hidden="true" />,
  info: <Info size={20} aria-hidden="true" />,
};

export function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container-premium" aria-live="polite" aria-atomic="true">
      <style>{`
        .toast-container-premium {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 1500;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .toast-item-premium {
          background: rgba(30, 41, 59, 0.98);
          border-radius: 1rem;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border);
        }

        .toast-item-success { border-color: rgba(16, 185, 129, 0.4); color: #10b981; }
        .toast-item-error { border-color: rgba(239, 68, 68, 0.4); color: #ef4444; }
        .toast-item-warning { border-color: rgba(245, 158, 11, 0.4); color: #f59e0b; }
        .toast-item-info { border-color: rgba(59, 130, 246, 0.4); color: #3b82f6; }

        .toast-message-text {
          flex: 1;
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .toast-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          padding: 0.4rem;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .toast-close-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`toast-item-premium toast-item-${toast.type}`}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          >
            <div className="toast-icon-wrap" aria-hidden="true">
              {iconMap[toast.type]}
            </div>
            <span className="toast-message-text">
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
              aria-label="Dismiss notification"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
