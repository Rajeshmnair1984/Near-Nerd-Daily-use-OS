import React, { useState, useEffect } from 'react';
import { Plus, Globe, Mail, Shield, Building2, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, Organization } from '../services/dataService';
import { useToast } from '@/context/ToastContext';

const SuperAdminDashboard = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', domain: '', adminEmail: '' });
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      const data = await dataService.getOrganizations();
      setOrgs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOrg.name || !newOrg.domain || !newOrg.adminEmail) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await dataService.createOrganization(newOrg.name, newOrg.domain, newOrg.adminEmail);
      setShowModal(false);
      setNewOrg({ name: '', domain: '', adminEmail: '' });
      addToast(`Organization "${newOrg.name}" created successfully! Invitation sent to ${newOrg.adminEmail}.`, 'success');
      loadOrgs();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating organization. Make sure you have configured the Supabase Service Role Key.';
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
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Global Console
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your multi-tenant infrastructure and customer domains.</p>
        </div>
        <button className="button-primary" onClick={() => setShowModal(true)} style={{ background: 'var(--primary)' }}>
          <Plus size={20} />
          <span>Provision New Tenant</span>
        </button>
      </header>

      {impersonating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(96, 165, 250, 0.1)',
            border: '1px solid #60a5fa',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={20} color="#60a5fa" />
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>
              Impersonating: {orgs.find(o => o.id === impersonating)?.name}
            </span>
          </div>
          <button
            onClick={stopImpersonating}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid #60a5fa',
              color: '#60a5fa',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Stop Impersonating
          </button>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence>
          {orgs.map((org) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: impersonating === org.id ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                position: 'relative'
              }}
            >
              {impersonating === org.id && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#60a5fa', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Check size={12} />
                  Active
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(96, 165, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Building2 size={24} />
                </div>
                {!impersonating && (
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '100px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontWeight: 600 }}>Active</span>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{org.name}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Globe size={16} />
                  <span>{org.domain}.restaurant-os.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Shield size={16} />
                  <span>Tenant Admin Assigned</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => impersonating === org.id ? stopImpersonating() : handleImpersonate(org)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: impersonating === org.id ? '#60a5fa' : 'rgba(255,255,255,0.05)',
                    color: impersonating === org.id ? 'white' : 'inherit',
                    border: impersonating === org.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <ExternalLink size={14} />
                  {impersonating === org.id ? 'Active' : 'View'}
                </button>
                <button
                  style={{
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                  }}
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
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card" style={{ width: '450px', padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Provision New Tenant</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  placeholder="Business Name (e.g. Lucky Restaurant)"
                  className="glass-card"
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#000' }}
                  value={newOrg.name}
                  onChange={e => setNewOrg({...newOrg, name: e.target.value})}
                />
                <input
                  placeholder="Domain Slug (e.g. lucky-rest)"
                  className="glass-card"
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#000' }}
                  value={newOrg.domain}
                  onChange={e => setNewOrg({...newOrg, domain: e.target.value})}
                />
                <input
                  placeholder="Admin Email Address"
                  type="email"
                  className="glass-card"
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#000' }}
                  value={newOrg.adminEmail}
                  onChange={e => setNewOrg({...newOrg, adminEmail: e.target.value})}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', background: 'var(--primary)', color: 'white', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, fontWeight: 600 }}
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
