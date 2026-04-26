import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = '500px' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1400,
            padding: '1rem',
            backdropFilter: 'blur(12px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: maxWidth,
              maxHeight: '95vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              zIndex: 1410,
              boxShadow: '0 30px 100px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-strong)',
              borderRadius: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section - always show close button, title is optional */}
            <div
              style={{
                display: 'flex',
                justifyContent: title ? 'space-between' : 'flex-end',
                alignItems: 'center',
                padding: title ? '1.5rem 2rem' : '1rem',
                borderBottom: title ? '1px solid var(--border)' : 'none',
                background: title ? 'var(--surface-soft)' : 'transparent',
                position: title ? 'relative' : 'absolute',
                top: 0,
                right: 0,
                left: 0,
                zIndex: 10,
              }}
            >
              {title && <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{title}</h2>}
              <button
                onClick={onClose}
                className="icon-button"
                style={{
                  borderRadius: '50%',
                  background: title ? 'var(--surface)' : 'rgba(0,0,0,0.05)',
                  padding: '0.4rem',
                  backdropFilter: title ? 'none' : 'blur(8px)',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingTop: title ? 0 : '1rem' }}>
              {children}
            </div>

            {footer && (
              <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', background: 'var(--surface-soft)', display: 'flex', gap: '1rem' }}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
