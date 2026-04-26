import { FormEvent, memo, useMemo, useState } from 'react';
import { MapPin, Plus, Search, Trash2, Building2 } from 'lucide-react';
import { CreateLocationInput, Location } from '@/types/location';
import { Modal } from './ui/Modal';

interface LocationManagerProps {
  locations: Location[];
  onAddLocation: (location: CreateLocationInput) => Promise<void>;
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
  onDeleteLocation,
  loading,
}: LocationManagerProps) {
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState<CreateLocationInput>(emptyLocation);
  const [isSaving, setIsSaving] = useState(false);

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
    try {
      await onAddLocation({
        name: location.name.trim(),
        address: location.address?.trim(),
        contact: location.contact?.trim(),
      });
      setLocation(emptyLocation);
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
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
                <button
                  className="icon-button danger"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => {
                    if (window.confirm('Delete this location? Bills linked to it may also be removed in Supabase.')) {
                      onDeleteLocation(item.id);
                    }
                  }}
                >
                  <Trash2 size={17} />
                </button>
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
    </div>
  );
}

export default memo(LocationManager);
