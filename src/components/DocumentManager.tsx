import { FormEvent, memo, useMemo, useState } from 'react';
import { ExternalLink, FileText, Plus, Search, Trash2, Edit } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { CreateDocumentInput, DocumentRecord } from '@/types/document';
import { Modal } from './ui/Modal';
import DocumentEditForm from './DocumentEditForm';

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
    try {
      await onAddDocument({
        ...document,
        title: document.title.trim(),
        category: document.category.trim(),
        owner: document.owner?.trim(),
        file_url: document.file_url?.trim(),
        renewal_date: document.renewal_date || undefined,
        notes: document.notes?.trim(),
      });
      setDocument(emptyDocument);
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditDocument = async (updates: CreateDocumentInput) => {
    if (!editingDocument || !onUpdateDocument) return;
    setEditLoading(true);
    try {
      await onUpdateDocument(editingDocument.id, updates);
      setEditingDocument(null);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Vault</p>
          <h1>Documents</h1>
          <p>Keep leases, insurance, permits, agreements, and renewal dates organized.</p>
        </div>
        <button className="button-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={19} />
          <span>New Document</span>
        </button>
      </header>

      <div className="metric-strip">
        <div>
          <span>Total documents</span>
          <strong>{documents.length}</strong>
        </div>
        <div>
          <span>Needs review</span>
          <strong>{reviewCount}</strong>
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
              placeholder="Search documents, owners, categories"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="empty-state">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>No documents yet. Add your first document record to build the vault.</p>
          </div>
        ) : (
          <div className="vendor-grid">
            {filteredDocuments.map((item) => (
              <article className="vendor-card document-card" key={item.id}>
                <div className="vendor-card-header">
                  <span className="bill-icon">
                    <FileText size={18} />
                  </span>
                  <span
                    className={`status-badge ${
                      item.status === 'Needs Review'
                        ? 'status-pending'
                        : item.status === 'Archived'
                          ? 'status-overdue'
                          : 'status-paid'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.category}</p>
                <div className="vendor-contact">
                  {item.owner && <span>Owner: {item.owner}</span>}
                  {item.renewal_date && <span>Renewal: {item.renewal_date}</span>}
                  {item.file_url && (
                    <a href={item.file_url} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} />
                      Open document
                    </a>
                  )}
                </div>
                {item.notes && <p className="vendor-notes">{item.notes}</p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {onUpdateDocument && (
                    <button
                      className="icon-button"
                      aria-label={`Edit ${item.title}`}
                      onClick={() => setEditingDocument(item)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#667eea' }}
                    >
                      <Edit size={17} />
                    </button>
                  )}
                  <button
                    className="icon-button danger"
                    aria-label={`Delete ${item.title}`}
                    onClick={() => {
                      if (window.confirm('Delete this document record?')) {
                        onDeleteDocument(item.id);
                      }
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Document">
        <form onSubmit={handleSubmit} className="vendor-form">
          <label className="form-group">
            <span className="form-label">Title</span>
            <input
              className="form-input"
              required
              value={document.title}
              onChange={(event) => setDocument({ ...document, title: event.target.value })}
            />
          </label>
          <div className="form-row">
            <label className="form-group">
              <span className="form-label">Category</span>
              <input
                className="form-input"
                required
                value={document.category}
                onChange={(event) => setDocument({ ...document, category: event.target.value })}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Status</span>
              <select
                className="form-select"
                value={document.status}
                onChange={(event) =>
                  setDocument({ ...document, status: event.target.value as DocumentRecord['status'] })
                }
              >
                <option value="Active">Active</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Archived">Archived</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label className="form-group">
              <span className="form-label">Owner</span>
              <input
                className="form-input"
                value={document.owner}
                onChange={(event) => setDocument({ ...document, owner: event.target.value })}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Renewal Date</span>
              <input
                className="form-input"
                type="date"
                value={document.renewal_date}
                onChange={(event) => setDocument({ ...document, renewal_date: event.target.value })}
              />
            </label>
          </div>
          <label className="form-group">
            <span className="form-label">Document Link</span>
            <input
              className="form-input"
              type="url"
              placeholder="https://..."
              value={document.file_url}
              onChange={(event) => setDocument({ ...document, file_url: event.target.value })}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Notes</span>
            <textarea
              className="form-textarea"
              rows={3}
              value={document.notes}
              onChange={(event) => setDocument({ ...document, notes: event.target.value })}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </form>
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
    </div>
  );
}

export default memo(DocumentManager);
