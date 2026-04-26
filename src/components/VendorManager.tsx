import { FormEvent, memo, useMemo, useState } from 'react';
import { Building2, Mail, Phone, Plus, Search, Trash2, Edit } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { CreateVendorInput, Vendor } from '@/types/vendor';
import { Modal } from './ui/Modal';
import { ErrorBanner } from './ui/ErrorBanner';
import { ConfirmationModal } from './ui/ConfirmationModal';
import VendorEditForm from './VendorEditForm';

interface VendorManagerProps {
  vendors: Vendor[];
  onAddVendor: (vendor: CreateVendorInput) => Promise<void>;
  onUpdateVendor?: (id: string, updates: CreateVendorInput) => Promise<void>;
  onDeleteVendor: (id: string) => Promise<void>;
  loading?: boolean;
}

const emptyVendor: CreateVendorInput = {
  name: '',
  category: 'Supplier',
  contact_name: '',
  email: '',
  phone: '',
  website: '',
  notes: '',
  status: 'Active',
};

function VendorManager({ vendors, onAddVendor, onUpdateVendor, onDeleteVendor, loading }: VendorManagerProps) {
  const [query, setQuery] = useState('');
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
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [query, vendors]);

  const activeCount = vendors.filter((item) => item.status === 'Active').length;
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to add vendor';
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to update vendor';
      setError(errorMsg);
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete vendor';
      setError(errorMsg);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Network</p>
          <h1>Vendors</h1>
          <p>Keep every supplier, service partner, and business contact easy to find.</p>
        </div>
        <button className="button-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={19} />
          <span>New Vendor</span>
        </button>
      </header>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <div className="metric-strip">
        <div>
          <span>Total vendors</span>
          <strong>{vendors.length}</strong>
        </div>
        <div>
          <span>Active partners</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>Categories</span>
          <strong>{categoryCount}</strong>
        </div>
      </div>

      <section className="panel bill-panel">
        <div className="bill-toolbar">
          <label className="search-field">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search vendors, contacts, categories"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="empty-state">Loading vendors...</div>
        ) : filteredVendors.length === 0 ? (
          <div className="empty-state">
            <Building2 size={48} />
            <p>No vendors yet. Add your first vendor to start building your directory.</p>
          </div>
        ) : (
          <div className="vendor-grid">
            {filteredVendors.map((item) => (
              <article className="vendor-card" key={item.id}>
                <div className="vendor-card-header">
                  <span className="bill-icon">
                    <Building2 size={18} />
                  </span>
                  <span className={`status-badge ${item.status === 'Active' ? 'status-paid' : 'status-pending'}`}>
                    {item.status}
                  </span>
                </div>
                <h2>{item.name}</h2>
                <p>{item.category}</p>
                <div className="vendor-contact">
                  {item.contact_name && <span>{item.contact_name}</span>}
                  {item.email && (
                    <a href={`mailto:${item.email}`}>
                      <Mail size={14} />
                      {item.email}
                    </a>
                  )}
                  {item.phone && (
                    <a href={`tel:${item.phone}`}>
                      <Phone size={14} />
                      {item.phone}
                    </a>
                  )}
                </div>
                {item.notes && <p className="vendor-notes">{item.notes}</p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {onUpdateVendor && (
                    <button
                      className="icon-button"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => setEditingVendor(item)}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Vendor">
        <form onSubmit={handleSubmit} className="vendor-form">
          <label className="form-group">
            <span className="form-label">Vendor Name</span>
            <input
              className="form-input"
              required
              value={vendor.name}
              onChange={(event) => setVendor({ ...vendor, name: event.target.value })}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Category</span>
            <input
              className="form-input"
              required
              value={vendor.category}
              onChange={(event) => setVendor({ ...vendor, category: event.target.value })}
            />
          </label>
          <div className="form-row">
            <label className="form-group">
              <span className="form-label">Contact Name</span>
              <input
                className="form-input"
                value={vendor.contact_name}
                onChange={(event) => setVendor({ ...vendor, contact_name: event.target.value })}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Status</span>
              <select
                className="form-select"
                value={vendor.status}
                onChange={(event) =>
                  setVendor({ ...vendor, status: event.target.value as Vendor['status'] })
                }
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label className="form-group">
              <span className="form-label">Email</span>
              <input
                className="form-input"
                type="email"
                value={vendor.email}
                onChange={(event) => setVendor({ ...vendor, email: event.target.value })}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Phone</span>
              <input
                className="form-input"
                value={vendor.phone}
                onChange={(event) => setVendor({ ...vendor, phone: event.target.value })}
              />
            </label>
          </div>
          <label className="form-group">
            <span className="form-label">Website</span>
            <input
              className="form-input"
              value={vendor.website}
              onChange={(event) => setVendor({ ...vendor, website: event.target.value })}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Notes</span>
            <textarea
              className="form-textarea"
              rows={3}
              value={vendor.notes}
              onChange={(event) => setVendor({ ...vendor, notes: event.target.value })}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </form>
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
        title="Delete Vendor"
        message="Are you sure you want to delete this vendor? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
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
