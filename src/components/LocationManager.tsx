import { FormEvent, memo, useMemo, useState } from 'react';
import { MapPin, Plus, Search, Trash2, Building2, Edit } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { CreateLocationInput, Location } from '@/types/location';
import { Modal } from './ui/Modal';
import { ErrorBanner } from './ui/ErrorBanner';
import { ConfirmationModal } from './ui/ConfirmationModal';
import LocationEditForm from './LocationEditForm';

interface LocationManagerProps {
  locations: Location[];
  onAddLocation: (location: CreateLocationInput) => Promise<void>;
  onUpdateLocation?: (id: string, updates: CreateLocationInput) => Promise<void>;
  onDeleteLocation: (id: string) => Promise<void>;
  loading?: boolean;
}

const emptyLocation: CreateLocationInput = {
  name: '',
  address: '',
  contact: '',
};

function LocationManager({
  locations,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  loading,
}: LocationManagerProps) {
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState<CreateLocationInput>(emptyLocation);
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
      [item.name, item.address, item.contact]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [locations, query]);

  const withAddressCount = locations.filter((item) => Boolean(item.address)).length;
  const withContactCount = locations.filter((item) => Boolean(item.contact)).length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onAddLocation({
        name: location.name.trim(),
        address: location.address?.trim(),
        contact: location.contact?.trim(),
      });
      setLocation(emptyLocation);
      setIsModalOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add location';
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to update location';
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete location';
      setError(errorMsg);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Locations</h1>
          <p>Manage every operating address, contact point, and site used across bills.</p>
        </div>
        <button className="button-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={19} />
          <span>New Location</span>
        </button>
      </header>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <div className="metric-strip">
        <div>
          <span>Total locations</span>
          <strong>{locations.length}</strong>
        </div>
        <div>
          <span>With address</span>
          <strong>{withAddressCount}</strong>
        </div>
        <div>
          <span>With contact</span>
          <strong>{withContactCount}</strong>
        </div>
      </div>

      <section className="panel bill-panel">
        <div className="bill-toolbar">
          <label className="search-field">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search locations, addresses, contacts"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="empty-state">Loading locations...</div>
        ) : filteredLocations.length === 0 ? (
          <div className="empty-state">
            <MapPin size={48} />
            <p>No locations yet. Add your first operating location to start organizing bills.</p>
          </div>
        ) : (
          <div className="vendor-grid">
            {filteredLocations.map((item) => (
              <article className="vendor-card" key={item.id}>
                <div className="vendor-card-header">
                  <span className="bill-icon">
                    <Building2 size={18} />
                  </span>
                  <span className="status-badge status-paid">Active</span>
                </div>
                <h2>{item.name}</h2>
                <div className="vendor-contact">
                  {item.address && (
                    <span>
                      <MapPin size={14} />
                      {item.address}
                    </span>
                  )}
                  {item.contact && <span>{item.contact}</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {onUpdateLocation && (
                    <button
                      className="icon-button"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => setEditingLocation(item)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#667eea' }}
                    >
                      <Edit size={17} />
                    </button>
                  )}
                  <button
                    className="icon-button danger"
                    aria-label={`Delete ${item.name}`}
                    disabled={deleteLoading === item.id}
                    onClick={() => setConfirmDelete(item.id)}
                    style={{ opacity: deleteLoading === item.id ? 0.5 : 1 }}
                  >
                    {deleteLoading === item.id ? '...' : <Trash2 size={17} />}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Location">
        <form onSubmit={handleSubmit} className="vendor-form">
          <label className="form-group">
            <span className="form-label">Location Name</span>
            <input
              className="form-input"
              required
              value={location.name}
              onChange={(event) => setLocation({ ...location, name: event.target.value })}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Address</span>
            <input
              className="form-input"
              value={location.address}
              onChange={(event) => setLocation({ ...location, address: event.target.value })}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Contact</span>
            <input
              className="form-input"
              value={location.contact}
              onChange={(event) => setLocation({ ...location, contact: event.target.value })}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>
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
        title="Delete Location"
        message="Are you sure you want to delete this location? Bills linked to it may also be removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
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
