import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Mail, Zap } from "lucide-react";
import { Vendor, CreateVendorInput } from "@/types/vendor";

interface VendorEditFormProps {
  vendor: Vendor;
  onSave: (updates: CreateVendorInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

type TabType = "identity" | "contact" | "intelligence";

export default function VendorEditForm({
  vendor,
  onSave,
  onCancel,
  loading,
}: VendorEditFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  const [formData, setFormData] = useState<CreateVendorInput>({
    name: vendor.name,
    category: vendor.category,
    contact_name: vendor.contact_name,
    email: vendor.email,
    phone: vendor.phone,
    website: vendor.website,
    notes: vendor.notes,
    status: vendor.status,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  const handleInputChange = (field: keyof CreateVendorInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.category) {
      setError("Identity & Category coordination required");
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to commit vendor orchestration",
      );
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "identity",
      label: "Identity",
      icon: <Building2 size={18} aria-hidden="true" />,
    },
    {
      id: "contact",
      label: "Contact",
      icon: <Mail size={18} aria-hidden="true" />,
    },
    {
      id: "intelligence",
      label: "Intelligence",
      icon: <Zap size={18} aria-hidden="true" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="vendor-edit-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="vendor-edit-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-edit-title"
      >
        <style>{`
          .vendor-edit-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            backdrop-filter: blur(12px);
          }

          .vendor-edit-container {
            background: var(--bg-card);
            border-radius: 24px;
            width: 100%;
            max-width: 900px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border);
          }

          .vendor-modal-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border);
            background: var(--surface-soft);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .vendor-modal-header-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .vendor-icon-wrap {
            padding: 0.5rem;
            background: rgba(0, 113, 227, 0.1);
            border-radius: 10px;
            color: var(--primary);
            display: flex;
            align-items: center;
          }

          .vendor-modal-header h1 {
            font-size: 1.25rem;
            font-weight: 800;
          }

          .vendor-name-accent {
            color: var(--primary);
          }

          .vendor-modal-close {
            border-radius: 50%;
          }

          .vendor-modal-body {
            display: grid;
            grid-template-columns: 200px 1fr;
            flex: 1;
            overflow: hidden;
          }

          .vendor-modal-sidebar {
            padding: 1.5rem 1rem;
            background: var(--bg-main);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .tab-button {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
            transition: var(--transition);
            text-align: left;
            width: 100%;
            border: none;
            background: none;
            cursor: pointer;
          }

          .tab-button:hover {
            background: var(--surface-soft);
            color: var(--text-primary);
          }

          .tab-button.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
          }

          .vendor-modal-content {
            padding: 2.5rem;
            overflow-y: auto;
          }

          .vendor-error-banner {
            background: rgba(217, 45, 32, 0.1);
            color: var(--error);
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            font-weight: 700;
          }

          .vendor-section-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
          }

          .vendor-section-header h2 {
            font-size: 1.25rem;
            font-weight: 800;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .full-width {
            grid-column: 1 / -1;
          }

          .vendor-notes-area {
            min-height: 200px;
          }

          .vendor-modal-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid var(--border);
            background: var(--surface-soft);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .vendor-submit-btn {
            min-width: 180px;
            font-weight: 900;
          }
        `}</style>

        <div className="vendor-modal-header">
          <div className="vendor-modal-header-left">
            <div className="vendor-icon-wrap" aria-hidden="true">
              <Building2 size={20} />
            </div>
            <h1 id="vendor-edit-title">
              Partner Orchestration:{" "}
              <span className="vendor-name-accent">{vendor.name}</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="icon-button vendor-modal-close"
            aria-label="Close edit form"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="vendor-modal-body">
          <aside
            className="vendor-modal-sidebar"
            role="tablist"
            aria-label="Vendor sections"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`section-${tab.id}`}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </aside>

          <main className="vendor-modal-content">
            {error && (
              <div className="vendor-error-banner" role="alert">
                {error}
              </div>
            )}

            <form id="vendor-edit-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {activeTab === "identity" && (
                  <motion.div
                    key="identity"
                    id="section-identity"
                    role="tabpanel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="vendor-section-header">
                      <h2>Primary Identity</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label
                          className="form-label"
                          htmlFor="vendor-name-edit"
                        >
                          VENDOR IDENTITY / NAME
                        </label>
                        <input
                          id="vendor-name-edit"
                          className="form-input"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          required
                          aria-required="true"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="vendor-cat-edit">
                          CATEGORY MATRIX
                        </label>
                        <input
                          id="vendor-cat-edit"
                          className="form-input"
                          value={formData.category}
                          onChange={(e) =>
                            handleInputChange("category", e.target.value)
                          }
                          required
                          aria-required="true"
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="vendor-status-edit"
                        >
                          OPERATIONAL STATUS
                        </label>
                        <select
                          id="vendor-status-edit"
                          className="form-select"
                          value={formData.status}
                          onChange={(e) =>
                            handleInputChange("status", e.target.value)
                          }
                        >
                          <option value="Active">Active / Verified</option>
                          <option value="Paused">Paused / Restricted</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "contact" && (
                  <motion.div
                    key="contact"
                    id="section-contact"
                    role="tabpanel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="vendor-section-header">
                      <h2>Communication Protocol</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label
                          className="form-label"
                          htmlFor="vendor-contact-edit"
                        >
                          PRIMARY CONTACT ENTITY
                        </label>
                        <input
                          id="vendor-contact-edit"
                          className="form-input"
                          value={formData.contact_name || ""}
                          onChange={(e) =>
                            handleInputChange("contact_name", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="vendor-email-edit"
                        >
                          COMMUNICATION EMAIL
                        </label>
                        <input
                          id="vendor-email-edit"
                          type="email"
                          className="form-input"
                          value={formData.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="vendor-phone-edit"
                        >
                          TELEPHONIC COORDINATE
                        </label>
                        <input
                          id="vendor-phone-edit"
                          className="form-input"
                          value={formData.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="vendor-web-edit">
                          DIGITAL DOMAIN (WEBSITE)
                        </label>
                        <input
                          id="vendor-web-edit"
                          type="url"
                          className="form-input"
                          value={formData.website || ""}
                          onChange={(e) =>
                            handleInputChange("website", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "intelligence" && (
                  <motion.div
                    key="intelligence"
                    id="section-intelligence"
                    role="tabpanel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="vendor-section-header">
                      <h2>Network Intelligence</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label
                          className="form-label"
                          htmlFor="vendor-notes-edit"
                        >
                          OPERATIONAL NOTES & CONTEXT
                        </label>
                        <textarea
                          id="vendor-notes-edit"
                          className="form-textarea vendor-notes-area"
                          value={formData.notes || ""}
                          onChange={(e) =>
                            handleInputChange("notes", e.target.value)
                          }
                          placeholder="Terms, performance logs, or relationship history..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </main>
        </div>

        <div className="vendor-modal-footer">
          <button type="button" onClick={onCancel} className="button-secondary">
            DISCARD
          </button>
          <button
            type="submit"
            form="vendor-edit-form"
            disabled={loading}
            className="button-primary vendor-submit-btn"
          >
            {loading ? "COMMITING..." : "COMMIT CHANGES"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
