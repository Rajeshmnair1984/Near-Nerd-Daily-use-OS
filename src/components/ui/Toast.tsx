import { useEffect } from 'react';
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
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 'var(--z-tooltip)',
        maxWidth: '400px',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            style={{
              background: 'rgba(30, 41, 59, 0.95)',
              border: `1px solid rgba(${toast.type === 'success' ? '16, 185, 129' : toast.type === 'error' ? '239, 68, 68' : toast.type === 'warning' ? '245, 158, 11' : '59, 130, 246'}, 0.3)`,
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: colorMap[toast.type],
              backdropFilter: 'blur(10px)',
            }}
          >
            {iconMap[toast.type]}
            <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '0.25rem',
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
