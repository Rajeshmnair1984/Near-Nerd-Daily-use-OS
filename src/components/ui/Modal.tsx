import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "500px",
}: ModalProps) {
  const titleId = title
    ? `modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`
    : undefined;
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === "Tab" && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTab);

      // Small delay to allow framer-motion to start and ensure focus works
      const focusTimer = setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ) as HTMLElement;
          firstFocusable?.focus();
        }
      }, 50);

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("keydown", handleTab);
        clearTimeout(focusTimer);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-overlay-premium"
          role="presentation"
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
              max-width: var(--modal-width, 500px);
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
              margin: 0;
            }

            .modal-close-btn {
              border-radius: 50%;
              padding: 0.4rem;
              transition: var(--transition);
              display: flex;
              align-items: center;
              justify-content: center;
              border: none;
              cursor: pointer;
            }

            .modal-close-btn-with-title {
              background: var(--surface);
              color: var(--text-primary);
            }

            .modal-close-btn-no-title {
              background: rgba(0,0,0,0.05);
              backdrop-filter: blur(8px);
              color: var(--text-primary);
            }

            .modal-close-btn:hover {
              background: var(--surface-soft);
              color: var(--primary);
            }

            .modal-content-area {
              flex: 1;
              overflow-y: auto;
              padding-top: var(--modal-content-padding, 0);
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
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-card modal-shell-premium"
            style={
              {
                "--modal-width": maxWidth,
                "--modal-content-padding": title ? 0 : "1rem",
              } as React.CSSProperties
            }
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            {/* Header section - always show close button, title is optional */}
            <div
              className={`modal-header-premium ${title ? "modal-header-with-title" : "modal-header-no-title"}`}
            >
              {title && (
                <h2 id={titleId} className="modal-title-text">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                className={`icon-button modal-close-btn ${title ? "modal-close-btn-with-title" : "modal-close-btn-no-title"}`}
                aria-label="Close modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="modal-content-area">{children}</div>

            {footer && <div className="modal-footer-premium">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
