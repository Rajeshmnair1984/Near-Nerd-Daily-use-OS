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
  const titleId = title ? `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-overlay-premium"
          onClick={onClose}
        >
          <style>{`
            .modal-overlay-premium {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.85);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1400;
              padding: 1rem;
              backdrop-filter: blur(12px);
            }

            .modal-shell-premium {
              width: 100%;
              max-height: 95vh;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              padding: 0;
              z-index: 1410;
              box-shadow: 0 30px 100px rgba(0, 0, 0, 0.5);
              border: 1px solid var(--border-strong);
              border-radius: 24px;
            }

            .modal-header-premium {
              display: flex;
              align-items: center;
              z-index: 10;
            }

            .modal-header-with-title {
              justify-content: space-between;
              padding: 1.5rem 2rem;
              border-bottom: 1px solid var(--border);
              background: var(--surface-soft);
              position: relative;
            }

            .modal-header-no-title {
              justify-content: flex-end;
              padding: 1rem;
              position: absolute;
              top: 0;
              right: 0;
              left: 0;
            }

            .modal-title-text {
              font-size: 1.25rem;
              font-weight: 800;
            }

            .modal-close-btn {
              border-radius: 50%;
              padding: 0.4rem;
              transition: var(--transition);
            }

            .modal-close-btn-with-title {
              background: var(--surface);
            }

            .modal-close-btn-no-title {
              background: rgba(0,0,0,0.05);
              backdrop-filter: blur(8px);
            }

            .modal-content-area {
              flex: 1;
              overflow-y: auto;
            }

            .modal-footer-premium {
              padding: 1.5rem 2rem;
              border-top: 1px solid var(--border);
              background: var(--surface-soft);
              display: flex;
              gap: 1rem;
            }
          `}</style>
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-card modal-shell-premium"
            style={{ maxWidth }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            {/* Header section - always show close button, title is optional */}
            <div className={`modal-header-premium ${title ? 'modal-header-with-title' : 'modal-header-no-title'}`}>
              {title && <h2 id={titleId} className="modal-title-text">{title}</h2>}
              <button
                onClick={onClose}
                className={`icon-button modal-close-btn ${title ? 'modal-close-btn-with-title' : 'modal-close-btn-no-title'}`}
                title="Close modal"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-area" style={{ paddingTop: title ? 0 : '1rem' }}>
              {children}
            </div>

            {footer && (
              <div className="modal-footer-premium">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
