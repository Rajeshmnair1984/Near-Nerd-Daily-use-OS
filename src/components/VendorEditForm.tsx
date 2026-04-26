import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, Users, Mail, Phone, Globe, Info, Shield, CheckCircle2, Zap } from 'lucide-react'
import { Vendor, CreateVendorInput } from '@/types/vendor'

interface VendorEditFormProps {
  vendor: Vendor
  onSave: (updates: CreateVendorInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

type TabType = 'identity' | 'contact' | 'intelligence';

export default function VendorEditForm({ vendor, onSave, onCancel, loading }: VendorEditFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [formData, setFormData] = useState<CreateVendorInput>({
    name: vendor.name,
    category: vendor.category,
    contact_name: vendor.contact_name,
    email: vendor.email,
    phone: vendor.phone,
    website: vendor.website,
    notes: vendor.notes,
    status: vendor.status,
  })

  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof CreateVendorInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.category) {
      setError('Identity & Category coordination required')
      return
    }

    try {
      await onSave(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit vendor orchestration')
    }
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'identity', label: 'Identity', icon: <Building2 size={18} /> },
    { id: 'contact', label: 'Contact', icon: <Mail size={18} /> },
    { id: 'intelligence', label: 'Intelligence', icon: <Zap size={18} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        backdropFilter: 'blur(12px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="vendor-edit-container"
      >
        <style>{`
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

          .vendor-modal-header h1 {
            font-size: 1.25rem;
            font-weight: 800;
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
          }

          .tab-button:hover {
            background: var(--surface-soft);
          }

          .tab-button.active {
            background: var(--primary);
            color: white;
          }

          .vendor-modal-content {
            padding: 2.5rem;
            overflow-y: auto;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .full-width {
            grid-column: 1 / -1;
          }
        `}</style>

        <div className="vendor-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(0, 113, 227, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
              <Building2 size={20} />
            </div>
            <h1>Partner Orchestration: <span style={{ color: 'var(--primary)' }}>{vendor.name}</span></h1>
          </div>
          <button onClick={onCancel} className="icon-button" style={{ borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <div className="vendor-modal-body">
          <aside className="vendor-modal-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </aside>

          <main className="vendor-modal-content">
            {error && (
              <div style={{ background: 'rgba(217, 45, 32, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 700 }}>
                {error}
              </div>
            )}

            <form id="vendor-edit-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {activeTab === 'identity' && (
                  <motion.div key="identity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Primary Identity</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label">VENDOR IDENTITY / NAME</label>
                        <input className="form-input" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CATEGORY MATRIX</label>
                        <input className="form-input" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">OPERATIONAL STATUS</label>
                        <select className="form-select" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)}>
                          <option value="Active">Active / Verified</option>
                          <option value="Paused">Paused / Restricted</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'contact' && (
                  <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Communication Protocol</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label">PRIMARY CONTACT ENTITY</label>
                        <input className="form-input" value={formData.contact_name || ''} onChange={(e) => handleInputChange('contact_name', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">COMMUNICATION EMAIL</label>
                        <input type="email" className="form-input" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">TELEPHONIC COORDINATE</label>
                        <input className="form-input" value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">DIGITAL DOMAIN (WEBSITE)</label>
                        <input type="url" className="form-input" value={formData.website || ''} onChange={(e) => handleInputChange('website', e.target.value)} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'intelligence' && (
                  <motion.div key="intelligence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Network Intelligence</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label">OPERATIONAL NOTES & CONTEXT</label>
                        <textarea className="form-textarea" style={{ minHeight: '200px' }} value={formData.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Terms, performance logs, or relationship history..." />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </main>
        </div>

        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', background: 'var(--surface-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={onCancel} className="button-secondary">DISCARD</button>
          <button type="submit" form="vendor-edit-form" disabled={loading} className="button-primary" style={{ minWidth: '180px', fontWeight: 900 }}>
            {loading ? 'COMMITING...' : 'COMMIT CHANGES'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
