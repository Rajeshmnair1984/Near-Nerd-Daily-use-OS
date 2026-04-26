import { FormEvent, memo, useMemo, useState } from 'react';
import { ExternalLink, FileText, Plus, Search, Trash2, Edit, Upload, Shield, Clock, HardDrive, FileCheck, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateDocumentInput, DocumentRecord } from '@/types/document';
import { Modal } from './ui/Modal';
import { ErrorBanner } from './ui/ErrorBanner';
import { ConfirmationModal } from './ui/ConfirmationModal';
import DocumentEditForm from './DocumentEditForm';
import { dataService } from '@/services/dataService';

interface DocumentManagerProps {
  documents: DocumentRecord[];
  onAddDocument: (document: CreateDocumentInput) => Promise<void>;
  onUpdateDocument?: (id: string, updates: CreateDocumentInput) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  loading?: boolean;
}

const emptyDocument: CreateDocumentInput = {
  title: '',
  category: 'Lease',
  owner: '',
  file_url: '',
  renewal_date: '',
  status: 'Active',
  notes: '',
};

function DocumentManager({
  documents,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  loading,
}: DocumentManagerProps) {
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [document, setDocument] = useState<CreateDocumentInput>(emptyDocument);
  const [isSaving, setIsSaving] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return documents;

    return documents.filter((item) =>
      [item.title, item.category, item.owner, item.status, item.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [documents, query]);

  const reviewCount = documents.filter((item) => item.status === 'Needs Review').length;
  const categoryCount = new Set(documents.map((item) => item.category)).size;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setUploadProgress(0);
    setError(null);
    try {
      let fileUrl = document.file_url;

      if (uploadFile) {
        fileUrl = await dataService.uploadDocumentFile(uploadFile, setUploadProgress);
      }

      await onAddDocument({
        ...document,
        title: document.title.trim(),
        category: document.category.trim(),
        owner: document.owner?.trim(),
        file_url: fileUrl?.trim(),
        renewal_date: document.renewal_date || undefined,
        notes: document.notes?.trim(),
      });
      setDocument(emptyDocument);
      setUploadFile(null);
      setUploadProgress(0);
      setIsModalOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add document';
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditDocument = async (updates: CreateDocumentInput) => {
    if (!editingDocument || !onUpdateDocument) return;
    setEditLoading(true);
    setError(null);
    try {
      await onUpdateDocument(editingDocument.id, updates);
      setEditingDocument(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update document';
      setError(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setDeleteLoading(id);
    setError(null);
    try {
      await onDeleteDocument(id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMsg);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="page-shell document-vault-page">
      <style>{`
        .document-vault-page .page-hero {
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

        .document-vault-page .hero-content h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          background: linear-gradient(to right, var(--text-primary), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .document-vault-page .metric-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .document-vault-page .metric-card {
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
        }

        .document-vault-page .metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(0, 113, 227, 0.08);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .document-vault-page .document-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .document-vault-page .premium-doc-card {
          background: var(--bg-card);
          border-radius: 20px;
          border: 1px solid var(--border);
          padding: 1.5rem;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          overflow: hidden;
        }

        .document-vault-page .premium-doc-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .document-vault-page .doc-type-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--surface-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .document-vault-page .premium-button {
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
          <p className="eyebrow">Intellectual Vault</p>
          <h1>Document Matrix</h1>
          <p>Orchestrate leases, insurance protocols, permits, and critical agreements in a secure digital environment.</p>
        </div>
        <button className="premium-button button-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>INITIALIZE DOCUMENT</span>
        </button>
      </header>

      <div className="metric-strip">
        <div className="metric-card">
          <div className="metric-icon"><HardDrive size={22} /></div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Vault Capacity</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900 }}>{documents.length} Records</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(217, 45, 32, 0.08)', color: 'var(--error)' }}><Clock size={22} /></div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Attention Required</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900, color: 'var(--error)' }}>{reviewCount} Documents</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(52, 168, 83, 0.08)', color: '#34a853' }}><FileCheck size={22} /></div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category Matrix</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900 }}>{categoryCount} Types</strong>
          </div>
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <section className="panel" style={{ background: 'transparent', border: 'none', padding: 0 }}>
        <div className="toolbar-premium" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <div className="search-field-premium" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.8rem 1.5rem' }}>
            <Search size={19} className="text-secondary" />
            <input
              type="text"
              placeholder="Search document vault by title, owner, or status..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ width: '100%', border: '0', outline: '0', background: 'transparent', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Synchronizing Document Vault...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state" style={{ padding: '5rem 0' }}>
            <FileText size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h3 style={{ fontWeight: 800 }}>No Document Coordinates Identified</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Adjust your search or initialize a new record.</p>
          </div>
        ) : (
          <div className="document-grid-premium">
            {filteredDocuments.map((item) => (
              <motion.article 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-doc-card" 
                key={item.id}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="doc-type-icon">
                    <FileText size={22} />
                  </div>
                  <span
                    className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`}
                    style={{ fontWeight: 800, fontSize: '0.65rem' }}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{item.title}</h2>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.category}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'var(--surface-soft)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Shield size={14} className="text-secondary" />
                    <span style={{ fontWeight: 600 }}>Owner: <span style={{ color: 'var(--text-primary)' }}>{item.owner || 'Unassigned'}</span></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Clock size={14} className="text-secondary" />
                    <span style={{ fontWeight: 600 }}>Renewal: <span style={{ color: item.status === 'Needs Review' ? 'var(--error)' : 'var(--text-primary)' }}>{item.renewal_date || 'N/A'}</span></span>
                  </div>
                </div>

                {item.notes && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxDirection: 'vertical', overflow: 'hidden' }}>
                    "{item.notes}"
                  </p>
                )}

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  {item.file_url && (
                    <a 
                      href={item.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="button-primary"
                      style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <ExternalLink size={14} /> OPEN VAULT
                    </a>
                  )}
                  <button
                    className="icon-button"
                    onClick={() => setEditingDocument(item)}
                    style={{ background: 'var(--surface-soft)', borderRadius: '10px' }}
                  >
                    <Edit size={16} />
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
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="700px">
        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
              <Plus size={24} style={{ margin: 'auto' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Initialize Record</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Securely add a new document to the organizational vault.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">DOCUMENT TITLE</label>
              <input
                className="form-input"
                required
                placeholder="e.g., Master Services Agreement 2024"
                value={document.title}
                onChange={(event) => setDocument({ ...document, title: event.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">CATEGORY MATRIX</label>
                <input
                  className="form-input"
                  required
                  placeholder="Lease, Insurance, Permit..."
                  value={document.category}
                  onChange={(event) => setDocument({ ...document, category: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">SETTLEMENT STATUS</label>
                <select
                  className="form-select"
                  value={document.status}
                  onChange={(event) =>
                    setDocument({ ...document, status: event.target.value as DocumentRecord['status'] })
                  }
                >
                  <option value="Active">Active / Valid</option>
                  <option value="Needs Review">Needs Attention</option>
                  <option value="Archived">Archived / Expired</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">PRIMARY OWNER</label>
                <input
                  className="form-input"
                  placeholder="Responsible Entity"
                  value={document.owner}
                  onChange={(event) => setDocument({ ...document, owner: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">RENEWAL COORDINATE</label>
                <input
                  className="form-input"
                  type="date"
                  value={document.renewal_date}
                  onChange={(event) => setDocument({ ...document, renewal_date: event.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">FILE ORCHESTRATION</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', border: '2px dashed var(--border)', borderRadius: '16px', cursor: 'pointer', background: uploadFile ? 'rgba(0, 113, 227, 0.05)' : 'var(--bg-main)', transition: 'all 0.2s', textAlign: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Upload size={32} color={uploadFile ? 'var(--primary)' : 'var(--text-secondary)'} style={{ marginBottom: '0.5rem' }} />
                <span style={{ color: uploadFile ? 'var(--primary)' : 'var(--text-primary)', fontWeight: 800, fontSize: '0.9rem' }}>
                  {uploadFile ? uploadFile.name : 'CLICK TO UPLOAD DIGITAL ASSET'}
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PDF, DOCX, XLSX, or High-Res Images</p>
                <input
                  type="file"
                  onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
              </label>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ marginTop: '1rem', background: 'var(--border)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--primary)', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">EXTERNAL ASSET URL (OPTIONAL)</label>
              <input
                className="form-input"
                type="url"
                placeholder="https://cloud-storage.com/asset..."
                value={document.file_url}
                onChange={(event) => setDocument({ ...document, file_url: event.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">OPERATIONAL NOTES</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Internal references, terms, or context..."
                value={document.notes}
                onChange={(event) => setDocument({ ...document, notes: event.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="button-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                DISCARD
              </button>
              <button type="submit" className="button-primary" style={{ flex: 2, fontWeight: 900 }} disabled={isSaving}>
                {isSaving ? 'UPLOADING...' : 'COMMIT TO VAULT'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <AnimatePresence>
        {editingDocument && (
          <DocumentEditForm
            document={editingDocument}
            onSave={handleEditDocument}
            onCancel={() => setEditingDocument(null)}
            loading={editLoading}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmDelete !== null}
        title="Purge Document"
        message="Are you sure you want to purge this document record from the vault? This orchestration is irreversible."
        confirmLabel="Purge"
        cancelLabel="Keep"
        isDangerous
        isLoading={deleteLoading !== null}
        onConfirm={() => {
          if (confirmDelete) {
            handleDeleteDocument(confirmDelete);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default memo(DocumentManager);
