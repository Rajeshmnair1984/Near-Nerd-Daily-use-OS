import { memo, useMemo, useState } from 'react';
import { MapPin, Plus, Search, Trash2, Building2, Edit, ChevronRight } from 'lucide-react';
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
    <div className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Asset Management</p>
          <h1>Infrastructure Matrix</h1>
          <p>Core infrastructure, lease terms, and operational status for all operating assets.</p>
        </div>
        <button className="button-primary" onClick={() => setIsModalOpen(true)} style={{ gap: '0.75rem', padding: '0.75rem 1.5rem' }}>
          <Plus size={19} />
          <span>INITIALIZE NEW ASSET</span>
        </button>
      </header>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <div className="metric-strip">
        <div>
          <span>Operating Assets</span>
          <strong>{locations.length}</strong>
        </div>
        <div>
          <span>Store Masters</span>
          <strong>{locations.filter(l => l.is_store_master).length}</strong>
        </div>
        <div>
          <span>Under Construction</span>
          <strong>{locations.filter(l => l.operational_status === 'Under Construction').length}</strong>
        </div>
      </div>

      <section className="panel bill-panel">
        <div className="bill-toolbar">
          <label className="search-field">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search assets by name, code, brand, or address..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="empty-state">Synchronizing core matrix...</div>
        ) : filteredLocations.length === 0 ? (
          <div className="empty-state">
            <Building2 size={48} />
            <p>No operational assets identified. Initialize your first asset to begin.</p>
            <button className="button-primary" onClick={() => setIsModalOpen(true)} style={{ marginTop: '1.5rem' }}>
              INITIALIZE FIRST ASSET
            </button>
          </div>
        ) : (
          <div className="vendor-grid">
            {filteredLocations.map((item) => (
              <article className="vendor-card" key={item.id}>
                <div className="vendor-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="bill-icon" style={{ background: item.is_store_master ? 'var(--primary)' : 'var(--surface-soft)', color: item.is_store_master ? 'white' : 'var(--text-secondary)' }}>
                      {item.is_store_master ? <Building2 size={18} /> : <MapPin size={18} />}
                    </span>
                    {item.store_code && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{item.store_code}</span>}
                  </div>
                  <span className={`status-badge status-${(item.operational_status || 'Active').toLowerCase().replace(' ', '-')}`}>
                    {item.operational_status || 'Active'}
                  </span>
                </div>
                
                <h2 style={{ marginBottom: '0.25rem' }}>{item.name}</h2>
                {item.brand_name && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>{item.brand_name}</p>}
                
                <div className="vendor-contact" style={{ marginBottom: '1.5rem' }}>
                  {item.address && (
                    <span>
                      <MapPin size={14} />
                      {item.address}
                    </span>
                  )}
                  {item.opening_date && (
                    <span>
                      <Calendar size={14} />
                      Opened: {item.opening_date}
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    className="button-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', gap: '0.4rem' }}
                    onClick={() => setEditingLocation(item)}
                  >
                    <Edit size={14} />
                    Manage Matrix
                  </button>
                  <button
                    className="icon-button danger"
                    aria-label={`Decommission ${item.name}`}
                    disabled={deleteLoading === item.id}
                    onClick={() => setConfirmDelete(item.id)}
                  >
                    {deleteLoading === item.id ? '...' : <Trash2 size={16} />}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* NEW ASSET INITIALIZATION MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Initialize New Asset"
        maxWidth="950px"
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
