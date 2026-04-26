import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Shield, Calendar, Link as LinkIcon, Info, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { DocumentRecord, CreateDocumentInput } from '@/types/document'

interface DocumentEditFormProps {
  document: DocumentRecord
  onSave: (updates: CreateDocumentInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

type TabType = 'identity' | 'logistics' | 'intelligence';

export default function DocumentEditForm({ document, onSave, onCancel, loading }: DocumentEditFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [formData, setFormData] = useState<CreateDocumentInput>({
    title: document.title,
    category: document.category,
    owner: document.owner,
    file_url: document.file_url,
    renewal_date: document.renewal_date,
    status: document.status,
    notes: document.notes,
  })

  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof CreateDocumentInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title || !formData.category) {
      setError('Document title and category are required for vault indexing')
      return
    }

    try {
      await onSave(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit vault update')
    }
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'identity', label: 'Identity', icon: <FileText size={18} /> },
    { id: 'logistics', label: 'Logistics', icon: <LinkIcon size={18} /> },
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
        className="doc-edit-container"
      >
        <style>{`
          .doc-edit-container {
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

          .doc-modal-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border);
            background: var(--surface-soft);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .doc-modal-header h1 {
            font-size: 1.25rem;
            font-weight: 800;
          }

          .doc-modal-body {
            display: grid;
            grid-template-columns: 200px 1fr;
            flex: 1;
            overflow: hidden;
          }

          .doc-modal-sidebar {
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

          .doc-modal-content {
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

        <div className="doc-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(0, 113, 227, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
              <Shield size={20} />
            </div>
            <h1>Vault Orchestration: <span style={{ color: 'var(--primary)' }}>{document.title}</span></h1>
          </div>
          <button onClick={onCancel} className="icon-button" style={{ borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <div className="doc-modal-body">
          <aside className="doc-modal-sidebar">
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

          <main className="doc-modal-content">
            {error && (
              <div style={{ background: 'rgba(217, 45, 32, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 700 }}>
                {error}
              </div>
            )}

            <form id="doc-edit-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {activeTab === 'identity' && (
                  <motion.div key="identity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Primary Identity</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label">DOCUMENT TITLE / DESIGNATION</label>
                        <input className="form-input" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">INTEL CATEGORY</label>
                        <select className="form-select" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} required>
                          <option value="">Select category</option>
                          <option value="Insurance">Insurance</option>
                          <option value="License">License</option>
                          <option value="Permit">Permit</option>
                          <option value="Contract">Contract</option>
                          <option value="Certification">Certification</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">VAULT STATUS</label>
                        <select className="form-select" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)}>
                          <option value="Active">Active / Verified</option>
                          <option value="Needs Review">Needs Review / Audit</option>
                          <option value="Archived">Archived / Historical</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'logistics' && (
                  <motion.div key="logistics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Asset Logistics</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label">ISSUING ENTITY / OWNER</label>
                        <input className="form-input" value={formData.owner || ''} onChange={(e) => handleInputChange('owner', e.target.value)} placeholder="e.g., Municipal Licensing Bureau" />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">DIGITAL ASSET COORDINATE (URL)</label>
                        <input type="url" className="form-input" value={formData.file_url || ''} onChange={(e) => handleInputChange('file_url', e.target.value)} placeholder="https://..." />
                      </div>
                      <div className="form-group">
                        <label className="form-label">RENEWAL / EXPIRY COORDINATE</label>
                        <input type="date" className="form-input" value={formData.renewal_date || ''} onChange={(e) => handleInputChange('renewal_date', e.target.value)} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'intelligence' && (
                  <motion.div key="intelligence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Vault Intelligence</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label">INTERNAL CONTEXT & NOTES</label>
                        <textarea className="form-textarea" style={{ minHeight: '200px' }} value={formData.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Audit logs, historical context, or specific compliance notes..." />
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
          <button type="submit" form="doc-edit-form" disabled={loading} className="button-primary" style={{ minWidth: '180px', fontWeight: 900 }}>
            {loading ? 'COMMITING...' : 'COMMIT VAULT UPDATE'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
