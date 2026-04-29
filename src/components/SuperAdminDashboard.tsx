import React, { useState, useEffect } from 'react';
import { Plus, Globe, Mail, Shield, Building2, ExternalLink, Check } from 'lucide-react';
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrgs();
  }, []);



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
    // In a full implementation, would redirect or reload with org context
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
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .super-admin-page .page-subtitle {
          color: var(--text-secondary);
        }

        .super-admin-page .provision-btn {
          background: var(--primary);
        }

        .super-admin-page .impersonation-banner {
          background: rgba(96, 165, 250, 0.1);
          border: 1px solid #60a5fa;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .super-admin-page .impersonation-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .super-admin-page .impersonation-text {
          color: #60a5fa;
          font-weight: 600;
        }

        .super-admin-page .stop-impersonate-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid #60a5fa;
          color: #60a5fa;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition);
        }

        .super-admin-page .stop-impersonate-btn:hover {
          background: rgba(96, 165, 250, 0.2);
        }

        .super-admin-page .org-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .super-admin-page .org-card {
          padding: 1.5rem;
          position: relative;
          transition: var(--transition);
        }

        .super-admin-page .org-card-impersonating {
          border: 2px solid #60a5fa;
        }

        .super-admin-page .org-card-standard {
          border: 1px solid rgba(255,255,255,0.1);
        }

        .super-admin-page .active-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #60a5fa;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .super-admin-page .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .super-admin-page .org-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(96, 165, 250, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
        }

        .super-admin-page .status-pill {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 100px;
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          font-weight: 600;
        }

        .super-admin-page .org-name {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .super-admin-page .org-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .super-admin-page .detail-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .super-admin-page .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .super-admin-page .action-btn-main {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition);
        }

        .super-admin-page .action-btn-main-active {
          background: #60a5fa;
          color: white;
          border: none;
        }

        .super-admin-page .action-btn-main-inactive {
          background: rgba(255,255,255,0.05);
          color: inherit;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .super-admin-page .action-btn-icon {
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition);
        }

        .super-admin-page .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .super-admin-page .modal-content {
          width: 450px;
          padding: 2rem;
        }

        .super-admin-page .modal-title {
          margin-bottom: 1.5rem;
        }

        .super-admin-page .provision-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .super-admin-page .modal-input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          color: inherit;
        }

        .super-admin-page .modal-footer {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .super-admin-page .cancel-btn {
          flex: 1;
          padding: 0.75rem;
          border-radius: 6px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          cursor: pointer;
          transition: var(--transition);
        }

        .super-admin-page .submit-btn {
          flex: 1;
          padding: 0.75rem;
          border-radius: 6px;
          background: var(--primary);
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition);
        }

        .super-admin-page .btn-disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>

      <header className="page-header">
        <div>
          <h1 className="page-title">Global Console</h1>
          <p className="page-subtitle">Manage your multi-tenant infrastructure and customer domains.</p>
        </div>
        <button className="button-primary provision-btn" onClick={() => setShowModal(true)} title="Provision a new tenant organization">
          <Plus size={20} />
          <span>Provision New Tenant</span>
        </button>
      </header>

      {impersonating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="impersonation-banner"
        >
          <div className="impersonation-info">
            <Shield size={20} color="#60a5fa" />
            <span className="impersonation-text">
              Impersonating: {orgs.find(o => o.id === impersonating)?.name}
            </span>
          </div>
          <button
            onClick={stopImpersonating}
            className="stop-impersonate-btn"
            title="Stop impersonating and return to global view"
          >
            Stop Impersonating
          </button>
        </motion.div>
      )}

      <div className="org-grid">
        <AnimatePresence>
          {orgs.map((org) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card org-card ${impersonating === org.id ? 'org-card-impersonating' : 'org-card-standard'}`}
            >
              {impersonating === org.id && (
                <div className="active-badge">
                  <Check size={12} />
                  Active
                </div>
              )}

              <div className="card-top">
                <div className="org-icon-box">
                  <Building2 size={24} />
                </div>
                {!impersonating && (
                  <span className="status-pill">Active</span>
                )}
              </div>

              <h3 className="org-name">{org.name}</h3>

              <div className="org-details">
                <div className="detail-row">
                  <Globe size={16} />
                  <span>{org.slug}.restaurant-os.com</span>
                </div>
                <div className="detail-row">
                  <Shield size={16} />
                  <span>Tenant Admin Assigned</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => impersonating === org.id ? stopImpersonating() : handleImpersonate(org)}
                  className={`action-btn-main ${impersonating === org.id ? 'action-btn-main-active' : 'action-btn-main-inactive'}`}
                  title={impersonating === org.id ? `Currently viewing ${org.name}` : `View dashboard as ${org.name}`}
                >
                  <ExternalLink size={14} />
                  {impersonating === org.id ? 'Active' : 'View'}
                </button>
                <button
                  className="action-btn-icon"
                  title={`Email administrator for ${org.name}`}
                  aria-label={`Email administrator for ${org.name}`}
                >
                  <Mail size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Provision Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card modal-content">
              <h2 className="modal-title">Provision New Tenant</h2>
              <form onSubmit={handleSubmit} className="provision-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="org-name">BUSINESS NAME</label>
                  <input
                    id="org-name"
                    placeholder="e.g. Lucky Restaurant"
                    className="glass-card modal-input"
                    value={orgs.length > 0 ? newOrg.name : ''}
                    autoFocus
                    onChange={e => setNewOrg({...newOrg, name: e.target.value})}
                    title="Business Name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="org-slug">DOMAIN SLUG</label>
                  <input
                    id="org-slug"
                    placeholder="e.g. lucky-rest"
                    className="glass-card modal-input"
                    value={orgs.length > 0 ? newOrg.slug : ''}
                    onChange={e => setNewOrg({...newOrg, slug: e.target.value})}
                    title="Domain Slug"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="org-admin-email">ADMIN EMAIL ADDRESS</label>
                  <input
                    id="org-admin-email"
                    placeholder="admin@business.com"
                    type="email"
                    className="glass-card modal-input"
                    value={orgs.length > 0 ? newOrg.adminEmail : ''}
                    onChange={e => setNewOrg({...newOrg, adminEmail: e.target.value})}
                    title="Admin Email"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className={`cancel-btn ${isSubmitting ? 'btn-disabled' : ''}`}
                    title="Cancel provisioning"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`submit-btn ${isSubmitting ? 'btn-disabled' : ''}`}
                    title="Provision tenant and send invitation"
                  >
                    {isSubmitting ? 'Provisioning...' : 'Send Invitation'}
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
