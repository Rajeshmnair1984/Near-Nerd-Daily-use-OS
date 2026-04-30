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
      style={{
        background: "#fee2e2",
        border: "1px solid #fca5a5",
        color: "#991b1b",
        padding: "0.75rem 1rem",
        borderRadius: "6px",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span>{error}</span>
      <button
        onClick={onDismiss}
        type="button"
        style={{
          background: "transparent",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontSize: "1.25rem",
          fontWeight: "bold",
        }}
      >
        ×
      </button>
    </motion.div>
  );
}
