import { memo, useMemo, useState } from 'react';
import { MapPin, Plus, Search, Trash2, Building2, Edit, ChevronRight, Calendar, Zap, Globe, Shield, Activity } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CreateLocationInput, Location } from '@/types/location';
import { Modal } from './ui/Modal';
import { ErrorBanner } from './ui/ErrorBanner';
import { ConfirmationModal } from './ui/ConfirmationModal';
import LocationEditForm from './LocationEditForm';
import InfrastructureMatrixForm from './InfrastructureMatrixForm';

interface LocationManagerProps {
  locations: Location[];
  onAddLocation: (location: CreateLocationInput) => Promise<void>;
  onUpdateLocation?: (id: string, updates: CreateLocationInput) => Promise<void>;
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
  const [query, setQuery] = useState('');
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
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [locations, query]);

  const handleAddLocation = async (data: CreateLocationInput) => {
    setIsSaving(true);
    setError(null);
    try {
      await onAddLocation(data);
      setIsModalOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add asset';
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to update asset';
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete asset';
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
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 2rem;
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
        }

        .matrix-page .metric-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
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
          transform: translateY(-4px);
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
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .matrix-page .metric-info strong {
          display: block;
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
        }

        .matrix-page .asset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .matrix-page .asset-card {
          background: var(--surface);
          border-radius: 24px;
          border: 1px solid var(--border);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          transition: var(--transition);
          overflow: hidden;
        }

        .matrix-page .asset-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }

        .matrix-page .asset-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--border);
          transition: var(--transition);
        }

        .matrix-page .asset-card:hover::before {
          background: var(--primary);
        }

        .matrix-page .asset-badge {
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .matrix-page .badge-active { background: rgba(47, 179, 68, 0.1); color: var(--success); }
        .matrix-page .badge-construction { background: rgba(183, 121, 31, 0.1); color: var(--warning); }
        .matrix-page .badge-closed { background: rgba(217, 45, 32, 0.1); color: var(--error); }

        .matrix-page .asset-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .matrix-page .asset-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .matrix-page .asset-title h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .matrix-page .asset-title p {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--primary);
        }

        .matrix-page .asset-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--surface-soft);
          border-radius: 16px;
        }

        .matrix-page .detail-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .matrix-page .asset-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
        }

        .matrix-page .init-button {
          padding: 1rem 2rem;
          background: var(--primary);
          color: white;
          border-radius: 100px;
          font-weight: 900;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: var(--transition);
          box-shadow: 0 10px 20px rgba(0, 113, 227, 0.2);
        }

        .matrix-page .init-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(0, 113, 227, 0.3);
          background: var(--primary-hover);
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">Enterprise Infrastructure</p>
          <h1>Infrastructure Matrix</h1>
          <p>Real-time orchestration of core assets, lease terms, and operational synchronization across the global network.</p>
        </div>
        <button className="init-button" onClick={() => setIsModalOpen(true)}>
          <Zap size={20} fill="currentColor" />
          <span>INITIALIZE NEW ASSET</span>
        </button>
      </header>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <div className="metric-strip">
        <div className="metric-card">
          <div className="metric-icon"><Globe size={24} /></div>
          <div className="metric-info">
            <span>Operational Assets</span>
            <strong>{locations.length}</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><Shield size={24} /></div>
          <div className="metric-info">
            <span>Store Masters</span>
            <strong>{locations.filter(l => l.is_store_master).length}</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><Activity size={24} /></div>
          <div className="metric-info">
            <span>Risk Monitoring</span>
            <strong>{locations.filter(l => l.operational_status === 'Under Construction').length}</strong>
          </div>
        </div>
      </div>

      <section className="panel bill-panel">
        <div className="bill-toolbar" style={{ marginBottom: '2rem' }}>
          <label className="search-field" style={{ borderRadius: '100px', background: 'var(--bg-main)' }}>
            <Search size={19} />
            <input
              type="text"
              placeholder="Filter assets by name, code, brand, or geographic coordinates..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="empty-state">
             <div className="pulse-ring" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
             <p style={{ fontWeight: 700, marginTop: '1rem' }}>Synchronizing Core Matrix...</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="empty-state" style={{ padding: '4rem 0' }}>
            <Building2 size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Assets Identified</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>Your infrastructure matrix is currently empty. Initialize your first asset to begin orchestration.</p>
            <button className="init-button" onClick={() => setIsModalOpen(true)} style={{ marginTop: '2rem' }}>
              <Plus size={20} /> INITIALIZE FIRST ASSET
            </button>
          </div>
        ) : (
          <div className="asset-grid">
            {filteredLocations.map((item) => (
              <motion.article 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="asset-card" 
                key={item.id}
              >
                <div className="asset-header">
                  <div className="asset-icon-box" style={{ background: item.is_store_master ? 'rgba(0, 113, 227, 0.1)' : 'var(--surface-soft)', color: item.is_store_master ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {item.is_store_master ? <Zap size={22} fill="currentColor" /> : <Building2 size={22} />}
                  </div>
                  <span className={`asset-badge ${
                    item.operational_status === 'Active' ? 'badge-active' : 
                    item.operational_status === 'Under Construction' ? 'badge-construction' : 'badge-closed'
                  }`}>
                    {(item.operational_status || 'Active').toUpperCase()}
                  </span>
                </div>
                
                <div className="asset-title">
                  <h3>{item.name}</h3>
                  <p>{item.brand_name || 'Generic Asset'} {item.store_code && `• ${item.store_code}`}</p>
                </div>
                
                <div className="asset-details">
                  <div className="detail-row">
                    <MapPin size={14} color="var(--primary)" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.address || 'Coordinates Not Set'}</span>
                  </div>
                  <div className="detail-row">
                    <Calendar size={14} color="var(--primary)" />
                    <span>Opened: {item.opening_date || 'TBD'}</span>
                  </div>
                </div>
                
                <div className="asset-actions">
                  <button
                    className="button-primary"
                    style={{ flex: 1, height: '3rem', borderRadius: '14px', fontSize: '0.85rem' }}
                    onClick={() => setEditingLocation(item)}
                  >
                    <Edit size={16} />
                    MANAGE MATRIX
                  </button>
                  <button
                    className="icon-button danger"
                    style={{ width: '3rem', height: '3rem', borderRadius: '14px', background: 'var(--surface-soft)' }}
                    aria-label={`Decommission ${item.name}`}
                    disabled={deleteLoading === item.id}
                    onClick={() => setConfirmDelete(item.id)}
                  >
                    {deleteLoading === item.id ? '...' : <Trash2 size={18} />}
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* NEW ASSET INITIALIZATION MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        maxWidth="1000px"
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
        message="Are you sure you want to decommission this asset? This will archive all infrastructure matrix data associated with this location."
        confirmLabel="Decommission"
        cancelLabel="Keep Active"
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
