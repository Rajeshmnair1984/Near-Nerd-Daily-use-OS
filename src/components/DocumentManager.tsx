import { FormEvent, memo, useMemo, useState } from 'react';
import { ExternalLink, FileText, Plus, Search, Trash2, Edit, Upload, Shield, Clock, HardDrive, FileCheck } from 'lucide-react';
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
        .document-vault-page .metric-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .document-vault-page .metric-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 900;
        }

        .document-vault-page .metric-attention {
          background: rgba(217, 45, 32, 0.08);
          color: var(--error);
        }

        .document-vault-page .metric-value-attention {
          color: var(--error);
        }

        .document-vault-page .metric-matrix {
          background: rgba(52, 168, 83, 0.08);
          color: #34a853;
        }

        .document-vault-page .toolbar-container {
          margin-bottom: 2rem;
          display: flex;
          gap: 1rem;
        }

        .document-vault-page .search-box-premium {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 0.8rem 1.5rem;
        }

        .document-vault-page .search-input-premium {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 0.95rem;
        }

        .document-vault-page .empty-state-large {
          padding: 5rem 0;
        }

        .document-vault-page .empty-state-icon-large {
          opacity: 0.1;
          margin-bottom: 1.5rem;
        }

        .document-vault-page .empty-state-title-large {
          font-weight: 800;
        }

        .document-vault-page .empty-state-sub-large {
          color: var(--text-secondary);
        }

        .document-vault-page .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .document-vault-page .card-status-badge {
          font-weight: 800;
          font-size: 0.65rem;
        }

        .document-vault-page .card-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: 0.4rem;
          color: var(--text-primary);
        }

        .document-vault-page .card-category {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .document-vault-page .card-logistics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--surface-soft);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .document-vault-page .logistics-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .document-vault-page .logistics-label {
          font-weight: 600;
        }

        .document-vault-page .logistics-value {
          color: var(--text-primary);
        }

        .document-vault-page .renewal-alert {
          color: var(--error);
        }

        .document-vault-page .card-notes {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .document-vault-page .card-actions {
          margin-top: auto;
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .document-vault-page .open-vault-link {
          flex: 1;
          padding: 0.6rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }

        .document-vault-page .edit-icon-button {
          background: var(--surface-soft);
          border-radius: 10px;
        }

        .document-vault-page .delete-icon-button {
          border-radius: 10px;
        }

        .document-vault-page .init-modal-container {
          padding: 2.5rem;
        }

        .document-vault-page .init-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .document-vault-page .init-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(0, 113, 227, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .document-vault-page .init-icon {
          margin: auto;
        }

        .document-vault-page .init-title {
          font-size: 1.5rem;
          font-weight: 900;
        }

        .document-vault-page .init-sub {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .document-vault-page .init-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .document-vault-page .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .document-vault-page .upload-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          border: 2px dashed var(--border);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          justify-content: center;
          flex-direction: column;
        }

        .document-vault-page .upload-box-active {
          background: rgba(0, 113, 227, 0.05);
          border-color: var(--primary);
        }

        .document-vault-page .upload-box-inactive {
          background: var(--bg-main);
        }

        .document-vault-page .upload-icon {
          margin-bottom: 0.5rem;
        }

        .document-vault-page .upload-text-main {
          font-weight: 800;
          font-size: 0.9rem;
        }

        .document-vault-page .upload-text-main-active {
          color: var(--primary);
        }

        .document-vault-page .upload-text-main-inactive {
          color: var(--text-primary);
        }

        .document-vault-page .upload-text-sub {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .document-vault-page .hidden-file-input {
          display: none;
        }

        .document-vault-page .progress-bar-container {
          margin-top: 1rem;
          background: var(--border);
          border-radius: 100px;
          height: 6px;
          overflow: hidden;
        }

        .document-vault-page .progress-bar-fill {
          background: var(--primary);
          height: 100%;
          transition: width 0.3s;
        }

        .document-vault-page .modal-footer-btns {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .document-vault-page .btn-discard {
          flex: 1;
        }

        .document-vault-page .btn-commit {
          flex: 2;
          font-weight: 900;
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">Intellectual Vault</p>
          <h1>Document Matrix</h1>
          <p>Orchestrate leases, insurance protocols, permits, and critical agreements in a secure digital environment.</p>
        </div>
        <button className="premium-button button-primary" onClick={() => setIsModalOpen(true)} title="Initialize new document">
          <Plus size={20} aria-hidden="true" />
          <span>INITIALIZE DOCUMENT</span>
        </button>
      </header>

      <div className="metric-strip" role="list">
        <div className="metric-card" role="listitem">
          <div className="metric-icon"><HardDrive size={22} aria-hidden="true" /></div>
          <div>
            <span className="metric-label">Vault Capacity</span>
            <strong className="metric-value">{documents.length} Records</strong>
          </div>
        </div>
        <div className="metric-card" role="listitem">
          <div className="metric-icon metric-attention"><Clock size={22} aria-hidden="true" /></div>
          <div>
            <span className="metric-label">Attention Required</span>
            <strong className="metric-value metric-value-attention">{reviewCount} Documents</strong>
          </div>
        </div>
        <div className="metric-card" role="listitem">
          <div className="metric-icon metric-matrix"><FileCheck size={22} aria-hidden="true" /></div>
          <div>
            <span className="metric-label">Category Matrix</span>
            <strong className="metric-value">{categoryCount} Types</strong>
          </div>
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <section className="document-panel-container">
        <div className="toolbar-container" aria-label="Search and filter documents">
          <div className="search-box-premium">
            <Search size={19} className="text-secondary" aria-hidden="true" />
            <label htmlFor="document-search" className="sr-only">Search documents</label>
            <input
              id="document-search"
              type="text"
              placeholder="Search document vault by title, owner, or status..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="search-input-premium"
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state" aria-busy="true">Synchronizing Document Vault...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state empty-state-large">
            <FileText size={64} className="empty-state-icon-large" aria-hidden="true" />
            <h3 className="empty-state-title-large">No Document Coordinates Identified</h3>
            <p className="empty-state-sub-large">Adjust your search or initialize a new record.</p>
          </div>
        ) : (
          <div className="document-grid-premium" role="list" aria-label="Document records">
            {filteredDocuments.map((item) => (
              <motion.article 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-doc-card" 
                key={item.id}
                role="listitem"
                aria-labelledby={`doc-title-${item.id}`}
              >
                <div className="card-header">
                  <div className="doc-type-icon" aria-hidden="true">
                    <FileText size={22} />
                  </div>
                  <span
                    className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')} card-status-badge`}
                    role="status"
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h2 className="card-title" id={`doc-title-${item.id}`}>{item.title}</h2>
                  <p className="card-category">{item.category}</p>
                </div>

                <div className="card-logistics">
                  <div className="logistics-item">
                    <Shield size={14} className="text-secondary" aria-hidden="true" />
                    <span className="logistics-label">Owner: <span className="logistics-value" aria-label={`Owner: ${item.owner || 'Unassigned'}`}>{item.owner || 'Unassigned'}</span></span>
                  </div>
                  <div className="logistics-item">
                    <Clock size={14} className="text-secondary" aria-hidden="true" />
                    <span className="logistics-label">Renewal: <span className={`logistics-value ${item.status === 'Needs Review' ? 'renewal-alert' : ''}`} aria-label={`Renewal date: ${item.renewal_date || 'N/A'}`}>{item.renewal_date || 'N/A'}</span></span>
                  </div>
                </div>

                {item.notes && (
                  <p className="card-notes">
                    "{item.notes}"
                  </p>
                )}

                <div className="card-actions">
                  {item.file_url && (
                    <a 
                      href={item.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="button-primary open-vault-link"
                      title="Open file in vault"
                      aria-label={`Open file for ${item.title}`}
                    >
                      <ExternalLink size={14} aria-hidden="true" /> OPEN VAULT
                    </a>
                  )}
                  <button
                    className="icon-button edit-icon-button"
                    onClick={() => setEditingDocument(item)}
                    title={`Edit ${item.title}`}
                    aria-label={`Edit ${item.title}`}
                  >
                    <Edit size={16} aria-hidden="true" />
                  </button>
                  <button
                    className="icon-button danger delete-icon-button"
                    disabled={deleteLoading === item.id}
                    onClick={() => setConfirmDelete(item.id)}
                    title={`Purge ${item.title}`}
                    aria-label={`Archive ${item.title}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="700px">
        <div className="init-modal-container">
          <div className="init-header">
            <div className="init-icon-wrapper" aria-hidden="true">
              <Plus size={24} className="init-icon" />
            </div>
            <div>
              <h2 className="init-title">Initialize Record</h2>
              <p className="init-sub">Securely add a new document to the organizational vault.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="init-form">
            <div className="form-group">
              <label className="form-label" htmlFor="new-doc-title">DOCUMENT TITLE</label>
              <input
                id="new-doc-title"
                className="form-input"
                required
                aria-required="true"
                placeholder="e.g., Master Services Agreement 2024"
                value={document.title}
                onChange={(event) => setDocument({ ...document, title: event.target.value })}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="new-doc-category">CATEGORY MATRIX</label>
                <input
                  id="new-doc-category"
                  className="form-input"
                  required
                  aria-required="true"
                  placeholder="Lease, Insurance, Permit..."
                  value={document.category}
                  onChange={(event) => setDocument({ ...document, category: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-doc-status">SETTLEMENT STATUS</label>
                <select
                  id="new-doc-status"
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

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="new-doc-owner">PRIMARY OWNER</label>
                <input
                  id="new-doc-owner"
                  className="form-input"
                  placeholder="Responsible Entity"
                  value={document.owner}
                  onChange={(event) => setDocument({ ...document, owner: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-doc-renewal">RENEWAL COORDINATE</label>
                <input
                  id="new-doc-renewal"
                  className="form-input"
                  type="date"
                  value={document.renewal_date}
                  onChange={(event) => setDocument({ ...document, renewal_date: event.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">FILE ORCHESTRATION</label>
              <label className={`upload-box ${uploadFile ? 'upload-box-active' : 'upload-box-inactive'}`}>
                <Upload size={32} color={uploadFile ? 'var(--primary)' : 'var(--text-secondary)'} className="upload-icon" aria-hidden="true" />
                <span className={`upload-text-main ${uploadFile ? 'upload-text-main-active' : 'upload-text-main-inactive'}`}>
                  {uploadFile ? uploadFile.name : 'CLICK TO UPLOAD DIGITAL ASSET'}
                </span>
                <p className="upload-text-sub">PDF, DOCX, XLSX, or High-Res Images</p>
                <input
                  type="file"
                  onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                  className="hidden-file-input"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  aria-label="Upload document file"
                />
              </label>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div 
                  className="progress-bar-container" 
                  role="progressbar" 
                  aria-valuenow={uploadProgress} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                  aria-label="File upload progress"
                >
                  <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-doc-url">EXTERNAL ASSET URL (OPTIONAL)</label>
              <input
                id="new-doc-url"
                className="form-input"
                type="url"
                placeholder="https://cloud-storage.com/asset..."
                value={document.file_url}
                onChange={(event) => setDocument({ ...document, file_url: event.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-doc-notes">OPERATIONAL NOTES</label>
              <textarea
                id="new-doc-notes"
                className="form-textarea"
                rows={3}
                placeholder="Internal references, terms, or context..."
                value={document.notes}
                onChange={(event) => setDocument({ ...document, notes: event.target.value })}
              />
            </div>

            <div className="modal-footer-btns">
              <button type="button" className="button-secondary btn-discard" onClick={() => setIsModalOpen(false)}>
                DISCARD
              </button>
              <button type="submit" className="button-primary btn-commit" disabled={isSaving}>
                {isSaving ? 'INITIALIZING...' : 'COMMIT TO VAULT'}
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
