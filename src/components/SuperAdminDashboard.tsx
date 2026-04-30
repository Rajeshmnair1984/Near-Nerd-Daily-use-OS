import React, { useState, useEffect } from 'react';
import { Plus, Globe, Mail, Shield, Building2, ExternalLink, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, Organization } from '../services/dataService';
import { useToast } from '@/context/ToastContext';

const SuperAdminDashboard = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', slug: '', adminEmail: '' });
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loadOrgs = async () => {
    try {
      const data = await dataService.getOrganizations();
      setOrgs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadOrgs();
    });
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    if (showModal) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOrg.name || !newOrg.slug || !newOrg.adminEmail) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await dataService.createOrganization(newOrg.name, newOrg.slug, newOrg.adminEmail);
      setShowModal(false);
      setNewOrg({ name: '', slug: '', adminEmail: '' });
      addToast(`Organization "${newOrg.name}" created successfully! Invitation sent to ${newOrg.adminEmail}.`, 'success');
      loadOrgs();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organization. An unknown error occurred.';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImpersonate = (org: Organization) => {
    setImpersonating(org.id);
    addToast(`Now viewing as ${org.name}. Data is filtered to this organization.`, 'success');
    localStorage.setItem('impersonating_org_id', org.id);
  };

  const stopImpersonating = () => {
    setImpersonating(null);
    addToast('Stopped impersonating. Viewing all organizations.', 'success');
    localStorage.removeItem('impersonating_org_id');
  };

  return (
    <div className="page-shell super-admin-page">
      <style>{`
        .super-admin-page {
          padding: 2.5rem;
        }

        .super-admin-page .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2.5rem;
        }

        .super-admin-page .page-title {
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, var(--primary), #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.04em;
        }

        .super-admin-page .page-subtitle {
          color: var(--text-secondary);
          font-size: 1.15rem;
        }

        .super-admin-page .provision-btn {
          font-weight: 800;
          padding: 0.8rem 1.5rem;
          border-radius: 100px;
        }

        .super-admin-page .impersonation-banner {
          background: rgba(0, 113, 227, 0.05);
          border: 1px solid var(--primary);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          backdrop-filter: blur(8px);
        }

        .super-admin-page .impersonation-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .super-admin-page .impersonation-text {
          color: var(--primary);
          font-weight: 800;
          font-size: 1rem;
        }

        .super-admin-page .stop-btn {
          background: var(--surface);
          border: 1px solid var(--primary);
          color: var(--primary);
          padding: 0.5rem 1.25rem;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.85rem;
          transition: var(--transition);
        }

        .super-admin-page .stop-btn:hover {
          background: var(--primary);
          color: white;
        }

        .super-admin-page .org-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        .super-admin-page .org-card {
          padding: 2rem;
          position: relative;
          transition: var(--transition);
          border: 1px solid var(--border);
        }

        .super-admin-page .org-card-impersonating {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary);
        }

        .super-admin-page .active-badge {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: var(--primary);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          text-transform: uppercase;
        }

        .super-admin-page .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .super-admin-page .org-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(0, 113, 227, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .super-admin-page .status-pill {
          font-size: 0.75rem;
          padding: 0.35rem 0.9rem;
          border-radius: 100px;
          background: rgba(52, 168, 83, 0.1);
          color: #34a853;
          font-weight: 800;
          text-transform: uppercase;
        }

        .super-admin-page .org-name {
          font-size: 1.5rem;
          font-weight: 900;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .super-admin-page .org-details {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2rem;
        }

        .super-admin-page .detail-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .super-admin-page .card-actions {
          display: flex;
          gap: 0.75rem;
        }

        .super-admin-page .action-btn-main {
          flex: 1;
          padding: 0.8rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          border-radius: 12px;
          font-weight: 800;
          transition: var(--transition);
        }

        .super-admin-page .action-btn-main-active {
          background: var(--primary);
          color: white;
          border: none;
        }

        .super-admin-page .action-btn-main-inactive {
          background: var(--surface-soft);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .super-admin-page .action-btn-main-inactive:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .super-admin-page .action-btn-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text-secondary);
          transition: var(--transition);
        }

        .super-admin-page .action-btn-icon:hover {
          color: var(--primary);
          border-color: var(--primary);
        }

        .super-admin-page .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(12px);
        }

        .super-admin-page .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 2.5rem;
          border-radius: 24px;
        }

        .super-admin-page .modal-title {
          font-size: 1.75rem;
          font-weight: 900;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }

        .super-admin-page .provision-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .super-admin-page .modal-input {
          width: 100%;
          padding: 1rem;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 1rem;
          transition: var(--transition);
        }

        .super-admin-page .modal-input:focus {
          border-color: var(--primary);
          background: var(--surface);
          box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
        }

        .super-admin-page .modal-footer {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .super-admin-page .cancel-btn {
          flex: 1;
          padding: 1rem;
          border-radius: 100px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-weight: 800;
          transition: var(--transition);
        }

        .super-admin-page .submit-btn {
          flex: 1;
          padding: 1rem;
          border-radius: 100px;
          background: var(--primary);
          color: white;
          border: none;
          font-weight: 900;
          transition: var(--transition);
        }

        .super-admin-page .btn-disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>

      <header className="page-header">
        <div>
          <h1 className="page-title" id="global-console-title">Global Console</h1>
          <p className="page-subtitle">Manage your multi-tenant infrastructure and customer domains.</p>
        </div>
        <button 
          className="button-primary provision-btn" 
          onClick={() => setShowModal(true)} 
          aria-haspopup="dialog"
          aria-label="Provision new tenant organization"
        >
          <Plus size={20} aria-hidden="true" />
          <span>Provision New Tenant</span>
        </button>
      </header>

      {impersonating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="impersonation-banner"
          role="alert"
          aria-live="assertive"
        >
          <div className="impersonation-info">
            <Shield size={24} aria-hidden="true" />
            <span className="impersonation-text">
              ORCHESTRATING TENANT: {orgs.find(o => o.id === impersonating)?.name}
            </span>
          </div>
          <button
            onClick={stopImpersonating}
            className="stop-btn"
            aria-label="Stop impersonating and return to global view"
          >
            DISCONNECT SESSION
          </button>
        </motion.div>
      )}

      <div className="org-grid" role="list" aria-labelledby="global-console-title">
        <AnimatePresence>
          {orgs.map((org) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card org-card ${impersonating === org.id ? 'org-card-impersonating' : ''}`}
              role="listitem"
            >
              {impersonating === org.id && (
                <div className="active-badge" role="status">
                  <Check size={14} aria-hidden="true" />
                  ACTIVE SESSION
                </div>
              )}

              <div className="card-top">
                <div className="org-icon-box" aria-hidden="true">
                  <Building2 size={28} />
                </div>
                {!impersonating && (
                  <span className="status-pill">Active Domain</span>
                )}
              </div>

              <h3 className="org-name" id={`org-name-${org.id}`}>{org.name}</h3>

              <div className="org-details">
                <div className="detail-row">
                  <Globe size={18} aria-hidden="true" />
                  <span>{org.slug}.restaurant-os.com</span>
                </div>
                <div className="detail-row">
                  <Shield size={18} aria-hidden="true" />
                  <span>Verified Infrastructure</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => impersonating === org.id ? stopImpersonating() : handleImpersonate(org)}
                  className={`action-btn-main ${impersonating === org.id ? 'action-btn-main-active' : 'action-btn-main-inactive'}`}
                  aria-pressed={impersonating === org.id}
                  aria-label={impersonating === org.id ? `Disconnect from ${org.name}` : `View ${org.name} console`}
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  {impersonating === org.id ? 'ACTIVE SESSION' : 'VIEW CONSOLE'}
                </button>
                <button
                  className="action-btn-icon"
                  aria-label={`Secure email communication with ${org.name} administrator`}
                >
                  <Mail size={18} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Provision Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" role="presentation" onClick={() => setShowModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-card modal-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby="provision-modal-title"
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="modal-title" id="provision-modal-title" style={{ marginBottom: 0 }}>Provision Tenant</h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="action-btn-icon" 
                  aria-label="Close modal"
                  style={{ border: 'none', background: 'none' }}
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="provision-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="org-name">LEGAL BUSINESS ENTITY</label>
                  <input
                    id="org-name"
                    placeholder="e.g. Lucky Restaurant"
                    className="modal-input"
                    value={newOrg.name}
                    autoFocus
                    onChange={e => setNewOrg({...newOrg, name: e.target.value})}
                    aria-required="true"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="org-slug">INFRASTRUCTURE SLUG</label>
                  <input
                    id="org-slug"
                    placeholder="e.g. lucky-rest"
                    className="modal-input"
                    value={newOrg.slug}
                    onChange={e => setNewOrg({...newOrg, slug: e.target.value})}
                    aria-required="true"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="org-admin-email">PRIMARY ADMIN ENDPOINT</label>
                  <input
                    id="org-admin-email"
                    placeholder="admin@business.com"
                    type="email"
                    className="modal-input"
                    value={newOrg.adminEmail}
                    onChange={e => setNewOrg({...newOrg, adminEmail: e.target.value})}
                    aria-required="true"
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className="cancel-btn"
                  >
                    DISCARD
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-btn"
                  >
                    {isSubmitting ? 'PROVISIONING...' : 'COMMENCE DEPLOYMENT'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminDashboard;
