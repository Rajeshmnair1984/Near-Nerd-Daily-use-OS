import { memo, useMemo, useState } from "react";
import {
  MapPin,
  Plus,
  Search,
  Trash2,
  Building2,
  Edit,
  Calendar,
  Zap,
  Globe,
  Shield,
  Activity,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CreateLocationInput, Location } from "@/types/location";
import { Modal } from "./ui/Modal";
import { ErrorBanner } from "./ui/ErrorBanner";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import LocationEditForm from "./LocationEditForm";
import InfrastructureMatrixForm from "./InfrastructureMatrixForm";

interface LocationManagerProps {
  locations: Location[];
  onAddLocation: (location: CreateLocationInput) => Promise<void>;
  onUpdateLocation?: (
    id: string,
    updates: CreateLocationInput,
  ) => Promise<void>;
  onDeleteLocation: (id: string) => Promise<void>;
  loading?: boolean;
}

function LocationManager({
  locations,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  loading,
}: LocationManagerProps) {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return locations;

    return locations.filter((item) =>
      [item.name, item.address, item.contact, item.store_code, item.brand_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [locations, query]);

  const handleAddLocation = async (data: CreateLocationInput) => {
    setIsSaving(true);
    setError(null);
    try {
      await onAddLocation(data);
      setIsModalOpen(false);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add asset";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditLocation = async (updates: CreateLocationInput) => {
    if (!editingLocation || !onUpdateLocation) return;
    setEditLoading(true);
    setError(null);
    try {
      await onUpdateLocation(editingLocation.id, updates);
      setEditingLocation(null);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update asset";
      setError(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    setDeleteLoading(id);
    setError(null);
    try {
      await onDeleteLocation(id);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete asset";
      setError(errorMsg);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="page-shell matrix-page">
      <style>{`
        .matrix-page .page-hero {
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-soft) 100%);
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .matrix-page .hero-content h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 0.75rem;
          background: linear-gradient(to right, var(--text-primary), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .matrix-page .hero-content p {
          font-size: 1.15rem;
          color: var(--text-secondary);
          max-width: 600px;
          font-weight: 600;
          line-height: 1.4;
        }

        .matrix-page .metric-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3.5rem;
        }

        .matrix-page .metric-card {
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .matrix-page .metric-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }

        .matrix-page .metric-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: rgba(0, 113, 227, 0.08);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .matrix-page .metric-info span {
          display: block;
          font-size: 0.85rem;
          font-weight: 900;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .matrix-page .metric-info strong {
          display: block;
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .matrix-page .asset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2rem;
        }

        .matrix-page .asset-card {
          background: var(--bg-card);
          border-radius: 24px;
          border: 1px solid var(--border);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          transition: var(--transition);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .matrix-page .asset-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }

        .matrix-page .asset-badge {
          padding: 0.5rem 1.25rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }

        .matrix-page .badge-active { background: rgba(47, 179, 68, 0.12); color: var(--success); border: 1px solid rgba(47, 179, 68, 0.2); }
        .matrix-page .badge-construction { background: rgba(183, 121, 31, 0.12); color: var(--warning); border: 1px solid rgba(183, 121, 31, 0.2); }
        .matrix-page .badge-closed { background: rgba(217, 45, 32, 0.12); color: var(--error); border: 1px solid rgba(217, 45, 32, 0.2); }

        .matrix-page .asset-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .matrix-page .asset-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .matrix-page .asset-title h3 {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
          letter-spacing: -0.02em;
        }

        .matrix-page .asset-title p {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--primary);
          opacity: 0.8;
        }

        .matrix-page .asset-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--surface-soft);
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .matrix-page .detail-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .matrix-page .asset-actions {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .matrix-page .bill-toolbar {
          margin-bottom: 3rem;
        }

        .matrix-page .search-field {
          padding: 0.8rem 1.5rem;
          border-radius: 100px;
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .matrix-page .search-field:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
        }

        .matrix-page .loading-ring {
          width: 64px;
          height: 64px;
          border: 4px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .matrix-page .sync-text {
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-top: 1.5rem;
          font-size: 0.8rem;
        }

        .matrix-page .empty-state-wrap {
          padding: 10rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .matrix-page .empty-icon {
          opacity: 0.15;
          margin-bottom: 2rem;
          color: var(--primary);
        }

        .matrix-page .empty-title {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }

        .matrix-page .empty-sub {
          color: var(--text-secondary);
          font-size: 1.25rem;
          max-width: 500px;
          line-height: 1.6;
        }

        .matrix-page .init-button {
          padding: 1rem 2.5rem;
          background: var(--primary);
          color: white;
          border-radius: 100px;
          font-weight: 900;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: var(--transition);
          box-shadow: 0 12px 24px rgba(0, 113, 227, 0.3);
          border: none;
          cursor: pointer;
        }

        .matrix-page .init-button:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 113, 227, 0.4);
          background: var(--primary-hover);
        }

        .matrix-page .manage-btn {
          flex: 1;
          height: 3.5rem;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: var(--transition);
        }

        .matrix-page .delete-btn {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 14px;
          background: rgba(217, 45, 32, 0.05);
          color: var(--error);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          border: 1px solid rgba(217, 45, 32, 0.1);
        }

        .matrix-page .delete-btn:hover:not(:disabled) {
          background: var(--error);
          color: white;
          box-shadow: 0 8px 16px rgba(217, 45, 32, 0.2);
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <span className="eyebrow" aria-hidden="true">
            Strategic Assets
          </span>
          <h1>Infrastructure Matrix</h1>
          <p>
            Global orchestration of core infrastructure, lease commitments, and
            operational telemetry synchronization.
          </p>
        </div>
        <button
          type="button"
          className="init-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Initialize a new infrastructure asset"
        >
          <Zap size={24} fill="currentColor" aria-hidden="true" />
          <span>INITIALIZE NEW ASSET</span>
        </button>
      </header>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <div
        className="metric-strip"
        role="region"
        aria-label="Infrastructure statistics"
      >
        <div className="metric-card">
          <div className="metric-icon" aria-hidden="true">
            <Globe size={32} />
          </div>
          <div className="metric-info">
            <span>Global Assets</span>
            <strong>{locations.length}</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" aria-hidden="true">
            <Shield size={32} />
          </div>
          <div className="metric-info">
            <span>Critical Masters</span>
            <strong>{locations.filter((l) => l.is_store_master).length}</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" aria-hidden="true">
            <Activity size={32} />
          </div>
          <div className="metric-info">
            <span>Risk Monitoring</span>
            <strong>
              {
                locations.filter(
                  (l) => l.operational_status === "Under Construction",
                ).length
              }
            </strong>
          </div>
        </div>
      </div>

      <section className="panel bill-panel" aria-labelledby="matrix-title">
        <div className="bill-toolbar">
          <div className="search-field">
            <Search size={22} className="text-secondary" aria-hidden="true" />
            <label htmlFor="matrix-search" className="sr-only">
              Filter infrastructure assets
            </label>
            <input
              id="matrix-search"
              type="text"
              placeholder="Search by entity name, store code, brand identifier, or geographic coordinates..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state" aria-busy="true">
            <div className="loading-ring" aria-hidden="true"></div>
            <p className="sync-text">SYNCHRONIZING CORE MATRIX...</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="empty-state-wrap" role="status">
            <Building2 size={100} className="empty-icon" aria-hidden="true" />
            <h3 className="empty-title">Zero Assets Identified</h3>
            <p className="empty-sub">
              Your infrastructure matrix is currently vacant. Initialize your
              first strategic asset to begin neural synchronization.
            </p>
            <button
              type="button"
              className="init-button"
              style={{ marginTop: "3rem" }}
              onClick={() => setIsModalOpen(true)}
              aria-label="Add your first infrastructure asset"
            >
              <Plus size={24} aria-hidden="true" /> INITIALIZE FIRST ASSET
            </button>
          </div>
        ) : (
          <div
            className="asset-grid"
            role="list"
            aria-label="Infrastructure Assets List"
          >
            <AnimatePresence>
              {filteredLocations.map((item) => (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="asset-card"
                  key={item.id}
                  role="listitem"
                  aria-labelledby={`asset-name-${item.id}`}
                >
                  <div className="asset-header">
                    <div
                      className={`asset-icon-box ${item.is_store_master ? "master" : "generic"}`}
                      style={{
                        background: item.is_store_master
                          ? "rgba(0, 113, 227, 0.12)"
                          : "var(--surface-soft)",
                        color: item.is_store_master
                          ? "var(--primary)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {item.is_store_master ? (
                        <Zap size={28} fill="currentColor" aria-hidden="true" />
                      ) : (
                        <Building2 size={28} aria-hidden="true" />
                      )}
                    </div>
                    <span
                      className={`asset-badge ${
                        item.operational_status === "Active"
                          ? "badge-active"
                          : item.operational_status === "Under Construction"
                            ? "badge-construction"
                            : "badge-closed"
                      }`}
                    >
                      {(item.operational_status || "Active").toUpperCase()}
                    </span>
                  </div>

                  <div className="asset-title">
                    <h3 id={`asset-name-${item.id}`}>{item.name}</h3>
                    <p>
                      {item.brand_name || "Unbranded Asset"}{" "}
                      {item.store_code && `• SC: ${item.store_code}`}
                    </p>
                  </div>

                  <div className="asset-details">
                    <div className="detail-row">
                      <MapPin
                        size={18}
                        className="text-primary"
                        aria-hidden="true"
                      />
                      <span className="detail-text">
                        {item.address || "GPS COORDINATES NOT INDEXED"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <Calendar
                        size={18}
                        className="text-primary"
                        aria-hidden="true"
                      />
                      <span>INITIALIZED: {item.opening_date || "PENDING"}</span>
                    </div>
                  </div>

                  <div className="asset-actions">
                    <button
                      type="button"
                      className="button-primary manage-btn"
                      onClick={() => setEditingLocation(item)}
                      aria-label={`Manage infrastructure parameters for ${item.name}`}
                    >
                      <Edit size={18} aria-hidden="true" />
                      MANAGE MATRIX
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      aria-label={`Decommission infrastructure asset: ${item.name}`}
                      disabled={deleteLoading === item.id}
                      onClick={() => setConfirmDelete(item.id)}
                    >
                      {deleteLoading === item.id ? (
                        <div
                          className="loading-ring"
                          style={{
                            width: "20px",
                            height: "20px",
                            borderWidth: "2px",
                          }}
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 size={20} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* MODAL COMPONENTS */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="1100px"
        title="Initialize Infrastructure Matrix"
      >
        <InfrastructureMatrixForm
          onSave={handleAddLocation}
          onCancel={() => setIsModalOpen(false)}
          loading={isSaving}
        />
      </Modal>

      <AnimatePresence>
        {editingLocation && (
          <LocationEditForm
            location={editingLocation}
            onSave={handleEditLocation}
            onCancel={() => setEditingLocation(null)}
            loading={editLoading}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmDelete !== null}
        title="Decommission Asset"
        message="Initiating decommissioning sequence. This will permanently archive all infrastructure telemetry and historical data for this asset. This action is irreversible."
        confirmLabel="DECOMMISSION"
        cancelLabel="MAINTAIN ACTIVE"
        isDangerous
        isLoading={deleteLoading !== null}
        onConfirm={() => {
          if (confirmDelete) {
            handleDeleteLocation(confirmDelete);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default memo(LocationManager);
