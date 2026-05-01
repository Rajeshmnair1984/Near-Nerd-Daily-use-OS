import { FormEvent, memo, useMemo, useState } from "react";
import {
  Building2,
  Mail,
  Plus,
  Search,
  Trash2,
  Edit,
  Globe,
  Users,
  Star,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CreateVendorInput, Vendor } from "@/types/vendor";
import { Modal } from "./ui/Modal";
import { ErrorBanner } from "./ui/ErrorBanner";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import VendorEditForm from "./VendorEditForm";

interface VendorManagerProps {
  vendors: Vendor[];
  onAddVendor: (vendor: CreateVendorInput) => Promise<void>;
  onUpdateVendor?: (id: string, updates: CreateVendorInput) => Promise<void>;
  onDeleteVendor: (id: string) => Promise<void>;
  loading?: boolean;
}

const emptyVendor: CreateVendorInput = {
  name: "",
  category: "Supplier",
  contact_name: "",
  email: "",
  phone: "",
  website: "",
  notes: "",
  status: "Active",
};

function VendorManager({
  vendors,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
  loading,
}: VendorManagerProps) {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendor, setVendor] = useState<CreateVendorInput>(emptyVendor);
  const [isSaving, setIsSaving] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredVendors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return vendors;

    return vendors.filter((item) =>
      [
        item.name,
        item.category,
        item.contact_name,
        item.email,
        item.phone,
        item.website,
        item.notes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [query, vendors]);

  const activeCount = vendors.filter((item) => item.status === "Active").length;
  const categoryCount = new Set(vendors.map((item) => item.category)).size;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onAddVendor({
        ...vendor,
        name: vendor.name.trim(),
        category: vendor.category.trim(),
        contact_name: vendor.contact_name?.trim(),
        email: vendor.email?.trim(),
        phone: vendor.phone?.trim(),
        website: vendor.website?.trim(),
        notes: vendor.notes?.trim(),
      });
      setVendor(emptyVendor);
      setIsModalOpen(false);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add vendor";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditVendor = async (updates: CreateVendorInput) => {
    if (!editingVendor || !onUpdateVendor) return;
    setEditLoading(true);
    setError(null);
    try {
      await onUpdateVendor(editingVendor.id, updates);
      setEditingVendor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update vendor");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    setDeleteLoading(id);
    setError(null);
    try {
      await onDeleteVendor(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vendor");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="page-shell vendor-matrix-page">
      <style>{`
        .vendor-matrix-page .page-hero {
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-soft) 100%);
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          margin-bottom: 2.5rem;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 2rem;
        }

        .vendor-matrix-page .hero-content h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          background: linear-gradient(to right, var(--text-primary), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .vendor-matrix-page .metric-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .vendor-matrix-page .metric-card {
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
        }

        .vendor-matrix-page .vendor-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .vendor-matrix-page .premium-vendor-card {
          background: var(--bg-card);
          border-radius: 24px;
          border: 1px solid var(--border);
          padding: 1.75rem;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
        }

        .vendor-matrix-page .premium-vendor-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .vendor-matrix-page .vendor-identity {
          display: flex;
          gap: 1.25rem;
          align-items: center;
        }

        .vendor-matrix-page .vendor-logo {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          background: var(--surface-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .vendor-matrix-page .premium-button {
          padding: 0.75rem 1.5rem;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: var(--transition);
        }

        .vendor-matrix-page .metric-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vendor-matrix-page .metric-icon-blue { background: rgba(0, 113, 227, 0.08); color: var(--primary); }
        .vendor-matrix-page .metric-icon-green { background: rgba(52, 168, 83, 0.08); color: var(--green-bright); }
        .vendor-matrix-page .metric-icon-orange { background: rgba(255, 149, 0, 0.08); color: var(--orange-bright); }

        .vendor-matrix-page .metric-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .vendor-matrix-page .metric-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 900;
        }

        .vendor-matrix-page .search-section {
          margin-bottom: 2rem;
        }

        .vendor-matrix-page .search-field-premium {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 0.8rem 1.5rem;
        }

        .vendor-matrix-page .search-input-premium {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 0.95rem;
        }

        .vendor-matrix-page .empty-state-padding {
          padding: 5rem 0;
        }

        .vendor-matrix-page .empty-icon {
          opacity: 0.1;
          margin-bottom: 1.5rem;
        }

        .vendor-matrix-page .empty-title {
          font-weight: 800;
        }

        .vendor-matrix-page .empty-sub {
          color: var(--text-secondary);
        }

        .vendor-matrix-page .vendor-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .vendor-matrix-page .vendor-name {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--text-primary);
        }

        .vendor-matrix-page .vendor-cat {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary);
          text-transform: uppercase;
        }

        .vendor-matrix-page .vendor-status-badge {
          font-weight: 800;
          font-size: 0.65rem;
        }

        .vendor-matrix-page .vendor-info-strip {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
          padding: 1.25rem;
          background: var(--surface-soft);
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .vendor-matrix-page .info-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
        }

        .vendor-matrix-page .info-name {
          font-weight: 700;
        }

        .vendor-matrix-page .info-link-primary {
          color: var(--primary);
          font-weight: 600;
        }

        .vendor-matrix-page .info-link-text {
          color: var(--text-primary);
          font-weight: 600;
        }

        .vendor-matrix-page .info-link-secondary {
          color: var(--text-secondary);
        }

        .vendor-matrix-page .vendor-notes {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .vendor-matrix-page .vendor-actions {
          margin-top: auto;
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .vendor-matrix-page .orchestrate-btn {
          flex: 1;
          padding: 0.6rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }

        .vendor-matrix-page .delete-btn {
          border-radius: 10px;
        }

        /* Modal specific styles */
        .vendor-modal-padding {
          padding: 2.5rem;
        }

        .vendor-modal-header-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .vendor-modal-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(0, 113, 227, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vendor-modal-title {
          font-size: 1.5rem;
          font-weight: 900;
        }

        .vendor-modal-sub {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .vendor-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .vendor-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .vendor-form-footer {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .vendor-cancel-btn {
          flex: 1;
        }

        .vendor-commit-btn {
          flex: 2;
          font-weight: 900;
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">Supply Chain Intelligence</p>
          <h1>Vendor Matrix</h1>
          <p>
            Orchestrate your global network of suppliers, service partners, and
            operational business contacts.
          </p>
        </div>
        <button
          type="button"
          className="premium-button button-primary"
          onClick={() => setIsModalOpen(true)}
          title="Initialize a new vendor partner"
        >
          <Plus size={20} aria-hidden="true" />
          <span>INITIALIZE VENDOR</span>
        </button>
      </header>

      <div className="metric-strip" role="list">
        <div className="metric-card" role="listitem">
          <div className="metric-icon-wrap metric-icon-blue">
            <Users size={22} aria-hidden="true" />
          </div>
          <div>
            <span className="metric-label">Network Scale</span>
            <strong className="metric-value">{vendors.length} Partners</strong>
          </div>
        </div>
        <div className="metric-card" role="listitem">
          <div className="metric-icon-wrap metric-icon-green">
            <Star size={22} aria-hidden="true" />
          </div>
          <div>
            <span className="metric-label">Active Orchestration</span>
            <strong className="metric-value">{activeCount} Operational</strong>
          </div>
        </div>
        <div className="metric-card" role="listitem">
          <div className="metric-icon-wrap metric-icon-orange">
            <Building2 size={22} aria-hidden="true" />
          </div>
          <div>
            <span className="metric-label">Category Matrix</span>
            <strong className="metric-value">{categoryCount} Types</strong>
          </div>
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <section
        className="search-section"
        aria-label="Search and filter vendors"
      >
        <div className="search-field-premium">
          <Search size={19} className="text-secondary" aria-hidden="true" />
          <label htmlFor="vendor-search" className="sr-only">
            Search vendors
          </label>
          <input
            id="vendor-search"
            type="text"
            placeholder="Search vendor identities, contact entities, or categories..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-input-premium"
          />
        </div>
      </section>

      {loading ? (
        <div className="empty-state" aria-busy="true">
          Synchronizing Vendor Network...
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="empty-state empty-state-padding">
          <Building2 size={64} className="empty-icon" aria-hidden="true" />
          <h3 className="empty-title">No Vendor Identities Found</h3>
          <p className="empty-sub">
            Adjust your search or initialize a new partner record.
          </p>
        </div>
      ) : (
        <div
          className="vendor-grid-premium"
          role="list"
          aria-label="Vendor partner cards"
        >
          {filteredVendors.map((item) => (
            <motion.article
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-vendor-card"
              key={item.id}
              role="listitem"
              aria-labelledby={`vendor-name-${item.id}`}
            >
              <div className="vendor-card-top">
                <div className="vendor-identity">
                  <div className="vendor-logo" aria-hidden="true">
                    <Building2 size={28} />
                  </div>
                  <div>
                    <h2 className="vendor-name" id={`vendor-name-${item.id}`}>
                      {item.name}
                    </h2>
                    <p className="vendor-cat">{item.category}</p>
                  </div>
                </div>
                <span
                  className={`status-badge status-${item.status.toLowerCase()} vendor-status-badge`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              <div className="vendor-info-strip">
                {item.contact_name && (
                  <div className="info-row">
                    <Users
                      size={16}
                      className="text-secondary"
                      aria-hidden="true"
                    />
                    <span
                      className="info-name"
                      aria-label={`Contact person: ${item.contact_name}`}
                    >
                      {item.contact_name}
                    </span>
                  </div>
                )}
                {item.email && (
                  <a
                    href={`mailto:${item.email}`}
                    className="info-row info-link-primary"
                    aria-label={`Email ${item.name} at ${item.email}`}
                  >
                    <Mail size={16} aria-hidden="true" />
                    {item.email}
                  </a>
                )}
                {item.phone && (
                  <a
                    href={`tel:${item.phone}`}
                    className="info-row info-link-text"
                    aria-label={`Call ${item.name} at ${item.phone}`}
                  >
                    <Phone size={16} aria-hidden="true" />
                    {item.phone}
                  </a>
                )}
                {item.website && (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noreferrer"
                    className="info-row info-link-secondary"
                    aria-label={`Visit ${item.name} website`}
                  >
                    <Globe size={16} aria-hidden="true" />
                    {item.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>

              {item.notes && <p className="vendor-notes">{item.notes}</p>}

              <div className="vendor-actions">
                <button
                  type="button"
                  className="button-primary orchestrate-btn"
                  onClick={() => setEditingVendor(item)}
                  title={`Orchestrate matrix for ${item.name}`}
                  aria-label={`Edit ${item.name}`}
                >
                  <Edit size={14} aria-hidden="true" /> ORCHESTRATE
                </button>
                <button
                  type="button"
                  className="icon-button danger delete-btn"
                  disabled={deleteLoading === item.id}
                  onClick={() => setConfirmDelete(item.id)}
                  title={`Sever partner link for ${item.name}`}
                  aria-label={`Archive ${item.name}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="700px"
      >
        <div className="vendor-modal-padding">
          <div className="vendor-modal-header-wrap">
            <div className="vendor-modal-icon" aria-hidden="true">
              <Plus size={24} />
            </div>
            <div>
              <h2 className="vendor-modal-title">Initialize Partner</h2>
              <p className="vendor-modal-sub">
                Securely add a new vendor or service partner to the network.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="vendor-form">
            <div className="form-group">
              <label className="form-label" htmlFor="new-vendor-name">
                VENDOR IDENTITY / NAME
              </label>
              <input
                id="new-vendor-name"
                className="form-input"
                required
                aria-required="true"
                placeholder="e.g., Global Logistics Corp"
                value={vendor.name}
                onChange={(event) =>
                  setVendor({ ...vendor, name: event.target.value })
                }
              />
            </div>

            <div className="vendor-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="new-vendor-cat">
                  CATEGORY MATRIX
                </label>
                <input
                  id="new-vendor-cat"
                  className="form-input"
                  required
                  aria-required="true"
                  placeholder="Supplier, Service, Maintenance..."
                  value={vendor.category}
                  onChange={(event) =>
                    setVendor({ ...vendor, category: event.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-vendor-status">
                  OPERATIONAL STATUS
                </label>
                <select
                  id="new-vendor-status"
                  className="form-select"
                  value={vendor.status}
                  onChange={(event) =>
                    setVendor({
                      ...vendor,
                      status: event.target.value as Vendor["status"],
                    })
                  }
                >
                  <option value="Active">Active / Verified</option>
                  <option value="Paused">Paused / Under Review</option>
                </select>
              </div>
            </div>

            <div className="vendor-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="new-vendor-contact">
                  PRIMARY CONTACT ENTITY
                </label>
                <input
                  id="new-vendor-contact"
                  className="form-input"
                  placeholder="Contact Name"
                  value={vendor.contact_name}
                  onChange={(event) =>
                    setVendor({ ...vendor, contact_name: event.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-vendor-email">
                  COMMUNICATION EMAIL
                </label>
                <input
                  id="new-vendor-email"
                  className="form-input"
                  type="email"
                  placeholder="contact@vendor.com"
                  value={vendor.email}
                  onChange={(event) =>
                    setVendor({ ...vendor, email: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="vendor-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="new-vendor-phone">
                  TELEPHONIC COORDINATE
                </label>
                <input
                  id="new-vendor-phone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={vendor.phone}
                  onChange={(event) =>
                    setVendor({ ...vendor, phone: event.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-vendor-web">
                  DIGITAL DOMAIN (WEBSITE)
                </label>
                <input
                  id="new-vendor-web"
                  className="form-input"
                  placeholder="https://vendor.com"
                  value={vendor.website}
                  onChange={(event) =>
                    setVendor({ ...vendor, website: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-vendor-notes">
                ORCHESTRATION NOTES
              </label>
              <textarea
                id="new-vendor-notes"
                className="form-textarea"
                rows={3}
                placeholder="Internal references, terms, or historical context..."
                value={vendor.notes}
                onChange={(event) =>
                  setVendor({ ...vendor, notes: event.target.value })
                }
              />
            </div>

            <div className="vendor-form-footer">
              <button
                type="button"
                className="button-secondary vendor-cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                DISCARD
              </button>
              <button
                type="submit"
                className="button-primary vendor-commit-btn"
                disabled={isSaving}
              >
                {isSaving ? "INITIALIZING..." : "COMMIT TO NETWORK"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <AnimatePresence>
        {editingVendor && (
          <VendorEditForm
            vendor={editingVendor}
            onSave={handleEditVendor}
            onCancel={() => setEditingVendor(null)}
            loading={editLoading}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmDelete !== null}
        title="Sever Partner Link"
        message="Are you sure you want to sever this vendor link from the network? This orchestration is permanent."
        confirmLabel="Sever Link"
        cancelLabel="Maintain Link"
        isDangerous
        isLoading={deleteLoading !== null}
        onConfirm={() => {
          if (confirmDelete) {
            handleDeleteVendor(confirmDelete);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default memo(VendorManager);
