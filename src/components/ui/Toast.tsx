import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const iconMap = {
  success: <CheckCircle2 size={20} />,
  error: <AlertCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const colorMap = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
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
          z-index: var(--z-tooltip);
          max-width: 400px;
        }

        .toast-item-premium {
          background: rgba(30, 41, 59, 0.95);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          backdrop-filter: blur(10px);
        }

        .toast-item-success { border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; }
        .toast-item-error { border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; }
        .toast-item-warning { border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; }
        .toast-item-info { border: 1px solid rgba(59, 130, 246, 0.3); color: #3b82f6; }

        .toast-message-text {
          flex: 1;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .toast-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0.25rem;
          transition: var(--transition);
        }

        .toast-close-btn:hover {
          color: var(--text-primary);
        }
      `}</style>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`toast-item-premium toast-item-${toast.type}`}
            role={toast.type === 'error' ? 'alert' : 'status'}
          >
            {iconMap[toast.type]}
            <span className="toast-message-text">
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
              title="Close toast"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
