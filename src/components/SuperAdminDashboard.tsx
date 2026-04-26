import React, { useState, useEffect } from 'react';
import { Plus, Globe, Mail, Shield, Building2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, Organization } from '../services/dataService';

const SuperAdminDashboard = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', domain: '', adminEmail: '' });

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
    try {
      await dataService.createOrganization(newOrg.name, newOrg.domain, newOrg.adminEmail);
      setShowModal(false);
      setNewOrg({ name: '', domain: '', adminEmail: '' });
      loadOrgs();
    } catch (err) {
      alert('Error creating organization. Make sure you have configured the Supabase Service Role Key.');
    }
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence>
          {orgs.map((org) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(96, 165, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Building2 size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '100px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontWeight: 600 }}>Active</span>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{org.name}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Globe size={16} />
                  <span>{org.domain}.resturant-os.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Shield size={16} />
                  <span>Tenant Admin Assigned</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="glass-card" style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <ExternalLink size={14} />
                  Impersonate
                </button>
                <button className="glass-card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}
                  value={newOrg.name}
                  onChange={e => setNewOrg({...newOrg, name: e.target.value})}
                />
                <input 
                  placeholder="Domain Slug (e.g. lucky-rest)" 
                  className="glass-card" 
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}
                  value={newOrg.domain}
                  onChange={e => setNewOrg({...newOrg, domain: e.target.value})}
                />
                <input 
                  placeholder="Admin Email Address" 
                  type="email"
                  className="glass-card" 
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}
                  value={newOrg.adminEmail}
                  onChange={e => setNewOrg({...newOrg, adminEmail: e.target.value})}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="glass-card" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="button-primary" style={{ flex: 1 }}>Send Invitation</button>
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
