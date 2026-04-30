import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Shield, Link as LinkIcon, Zap } from 'lucide-react'
import { DocumentRecord, CreateDocumentInput } from '@/types/document'

interface DocumentEditFormProps {
  document: DocumentRecord
  onSave: (updates: CreateDocumentInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

type TabType = 'identity' | 'logistics' | 'intelligence';

export default function DocumentEditForm({ document: documentRecord, onSave, onCancel, loading }: DocumentEditFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [formData, setFormData] = useState<CreateDocumentInput>({
    title: documentRecord.title,
    category: documentRecord.category,
    owner: documentRecord.owner,
    file_url: documentRecord.file_url,
    renewal_date: documentRecord.renewal_date,
    status: documentRecord.status,
    notes: documentRecord.notes,
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleInputChange = (field: keyof CreateDocumentInput, value: string) => {
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
    { id: 'identity', label: 'Identity', icon: <FileText size={18} aria-hidden="true" /> },
    { id: 'logistics', label: 'Logistics', icon: <LinkIcon size={18} aria-hidden="true" /> },
    { id: 'intelligence', label: 'Intelligence', icon: <Zap size={18} aria-hidden="true" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="doc-edit-overlay"
      role="presentation"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="doc-edit-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-edit-title"
      >
        <style>{`
          .doc-edit-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            backdrop-filter: blur(12px);
          }

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
            border: none;
            background: none;
            cursor: pointer;
          }

          .tab-button:hover {
            background: var(--surface-soft);
            color: var(--text-primary);
          }

          .tab-button.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
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

          .doc-modal-header-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .header-icon-wrapper {
            padding: 0.5rem;
            background: rgba(0, 113, 227, 0.1);
            border-radius: 10px;
            color: var(--primary);
            display: flex;
            align-items: center;
          }

          .header-title-text span {
            color: var(--primary);
          }

          .close-icon-button {
            border-radius: 50%;
          }

          .error-banner-fixed {
            background: rgba(217, 45, 32, 0.1);
            color: var(--error);
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            font-weight: 700;
          }

          .section-header-wrap {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
          }

          .section-title-large {
            font-size: 1.25rem;
            font-weight: 800;
          }

          .textarea-intelligence {
            min-height: 200px;
          }

          .modal-footer-action-bar {
            padding: 1.5rem 2rem;
            border-top: 1px solid var(--border);
            background: var(--surface-soft);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer-commit-button {
            min-width: 180px;
            font-weight: 900;
          }
        `}</style>

        <div className="doc-modal-header">
          <div className="doc-modal-header-left">
            <div className="header-icon-wrapper" aria-hidden="true">
              <Shield size={20} />
            </div>
            <h1 className="header-title-text" id="doc-edit-title">Vault Orchestration: <span>{document.title}</span></h1>
          </div>
          <button onClick={onCancel} className="icon-button close-icon-button" aria-label="Close vault update">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="doc-modal-body">
          <aside className="doc-modal-sidebar" role="tablist" aria-label="Document sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`section-${tab.id}`}
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
              <div className="error-banner-fixed" role="alert">
                {error}
              </div>
            )}

            <form id="doc-edit-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {activeTab === 'identity' && (
                  <motion.div 
                    key="identity" 
                    id="section-identity"
                    role="tabpanel"
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="section-header-wrap">
                      <h2 className="section-title-large">Primary Identity</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="doc-title">DOCUMENT TITLE / DESIGNATION</label>
                        <input id="doc-title" className="form-input" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required aria-required="true" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="intel-category">INTEL CATEGORY</label>
                        <select id="intel-category" className="form-select" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} required aria-required="true">
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
                        <label className="form-label" htmlFor="vault-status">VAULT STATUS</label>
                        <select id="vault-status" className="form-select" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)}>
                          <option value="Active">Active / Verified</option>
                          <option value="Needs Review">Needs Review / Audit</option>
                          <option value="Archived">Archived / Historical</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'logistics' && (
                  <motion.div 
                    key="logistics" 
                    id="section-logistics"
                    role="tabpanel"
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="section-header-wrap">
                      <h2 className="section-title-large">Asset Logistics</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="issuing-entity">ISSUING ENTITY / OWNER</label>
                        <input id="issuing-entity" className="form-input" value={formData.owner || ''} onChange={(e) => handleInputChange('owner', e.target.value)} placeholder="e.g., Municipal Licensing Bureau" />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="asset-url">DIGITAL ASSET COORDINATE (URL)</label>
                        <input id="asset-url" type="url" className="form-input" value={formData.file_url || ''} onChange={(e) => handleInputChange('file_url', e.target.value)} placeholder="https://..." />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="renewal-date">RENEWAL / EXPIRY COORDINATE</label>
                        <input id="renewal-date" type="date" className="form-input" value={formData.renewal_date || ''} onChange={(e) => handleInputChange('renewal_date', e.target.value)} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'intelligence' && (
                  <motion.div 
                    key="intelligence" 
                    id="section-intelligence"
                    role="tabpanel"
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="section-header-wrap">
                      <h2 className="section-title-large">Vault Intelligence</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="doc-notes">INTERNAL CONTEXT & NOTES</label>
                        <textarea id="doc-notes" className="form-textarea textarea-intelligence" value={formData.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Audit logs, historical context, or specific compliance notes..." />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </main>
        </div>

        <div className="modal-footer-action-bar">
          <button type="button" onClick={onCancel} className="button-secondary">DISCARD</button>
          <button type="submit" form="doc-edit-form" disabled={loading} className="button-primary footer-commit-button">
            {loading ? 'COMMITING...' : 'COMMIT VAULT UPDATE'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
