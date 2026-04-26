import { FormEvent, memo, useMemo, useState } from 'react';
import { Building2, Mail, Phone, Plus, Search, Trash2, Edit, Globe, Users, Star, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">Supply Chain Intelligence</p>
          <h1>Vendor Matrix</h1>
          <p>Orchestrate your global network of suppliers, service partners, and operational business contacts.</p>
        </div>
        <button className="premium-button button-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>INITIALIZE VENDOR</span>
        </button>
      </header>

      <div className="metric-strip">
        <div className="metric-card">
          <div className="metric-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 113, 227, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={22} /></div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Network Scale</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900 }}>{vendors.length} Partners</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 168, 83, 0.08)', color: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={22} /></div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Orchestration</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900 }}>{activeCount} Operational</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 149, 0, 0.08)', color: '#ff9500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={22} /></div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category Matrix</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900 }}>{categoryCount} Types</strong>
          </div>
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <section style={{ marginBottom: '2rem' }}>
        <div className="search-field-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.8rem 1.5rem' }}>
          <Search size={19} className="text-secondary" />
          <input
            type="text"
            placeholder="Search vendor identities, contact entities, or categories..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ width: '100%', border: '0', outline: '0', background: 'transparent', fontSize: '0.95rem' }}
          />
        </div>
      </section>

      {loading ? (
        <div className="empty-state">Synchronizing Vendor Network...</div>
      ) : filteredVendors.length === 0 ? (
        <div className="empty-state" style={{ padding: '5rem 0' }}>
          <Building2 size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
          <h3 style={{ fontWeight: 800 }}>No Vendor Identities Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Adjust your search or initialize a new partner record.</p>
        </div>
      ) : (
        <div className="vendor-grid-premium">
          {filteredVendors.map((item) => (
            <motion.article 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-vendor-card" 
              key={item.id}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="vendor-identity">
                  <div className="vendor-logo">
                    <Building2 size={28} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{item.name}</h2>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>{item.category}</p>
                  </div>
                </div>
                <span className={`status-badge status-${item.status.toLowerCase()}`} style={{ fontWeight: 800, fontSize: '0.65rem' }}>
                  {item.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', padding: '1.25rem', background: 'var(--surface-soft)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                {item.contact_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <Users size={16} className="text-secondary" />
                    <span style={{ fontWeight: 700 }}>{item.contact_name}</span>
                  </div>
                )}
                {item.email && (
                  <a href={`mailto:${item.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <Mail size={16} />
                    {item.email}
                  </a>
                )}
                {item.phone && (
                  <a href={`tel:${item.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <Phone size={16} />
                    {item.phone}
                  </a>
                )}
                {item.website && (
                  <a href={item.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Globe size={16} />
                    {item.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              {item.notes && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxDirection: 'vertical', overflow: 'hidden' }}>
                  {item.notes}
                </p>
              )}

              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                  className="button-primary"
                  onClick={() => setEditingVendor(item)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Edit size={14} /> ORCHESTRATE
                </button>
                <button
                  className="icon-button danger"
                  disabled={deleteLoading === item.id}
                  onClick={() => setConfirmDelete(item.id)}
                  style={{ borderRadius: '10px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="700px">
        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Initialize Partner</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Securely add a new vendor or service partner to the network.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">VENDOR IDENTITY / NAME</label>
              <input
                className="form-input"
                required
                placeholder="e.g., Global Logistics Corp"
                value={vendor.name}
                onChange={(event) => setVendor({ ...vendor, name: event.target.value })}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">CATEGORY MATRIX</label>
                <input
                  className="form-input"
                  required
                  placeholder="Supplier, Service, Maintenance..."
                  value={vendor.category}
                  onChange={(event) => setVendor({ ...vendor, category: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">OPERATIONAL STATUS</label>
                <select
                  className="form-select"
                  value={vendor.status}
                  onChange={(event) =>
                    setVendor({ ...vendor, status: event.target.value as Vendor['status'] })
                  }
                >
                  <option value="Active">Active / Verified</option>
                  <option value="Paused">Paused / Under Review</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">PRIMARY CONTACT ENTITY</label>
                <input
                  className="form-input"
                  placeholder="Contact Name"
                  value={vendor.contact_name}
                  onChange={(event) => setVendor({ ...vendor, contact_name: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">COMMUNICATION EMAIL</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="contact@vendor.com"
                  value={vendor.email}
                  onChange={(event) => setVendor({ ...vendor, email: event.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">TELEPHONIC COORDINATE</label>
                <input
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={vendor.phone}
                  onChange={(event) => setVendor({ ...vendor, phone: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">DIGITAL DOMAIN (WEBSITE)</label>
                <input
                  className="form-input"
                  placeholder="https://vendor.com"
                  value={vendor.website}
                  onChange={(event) => setVendor({ ...vendor, website: event.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ORCHESTRATION NOTES</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Internal references, terms, or historical context..."
                value={vendor.notes}
                onChange={(event) => setVendor({ ...vendor, notes: event.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="button-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                DISCARD
              </button>
              <button type="submit" className="button-primary" style={{ flex: 2, fontWeight: 900 }} disabled={isSaving}>
                {isSaving ? 'INITIALIZING...' : 'COMMIT TO NETWORK'}
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
