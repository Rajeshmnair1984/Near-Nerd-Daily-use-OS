import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  User, 
  Zap, 
  Activity,
  Scale,
  Wifi,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location, CreateLocationInput } from '@/types/location';

interface LocationEditFormProps {
  location: Location;
  onSave: (updates: CreateLocationInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

type TabType = 'identity' | 'location' | 'lease' | 'insurance' | 'ops';

const IntelSyncBadge = ({ active, onClick, section }: { active: boolean, onClick: () => void, section: string }) => (
  <div 
    className={`intel-sync-toggle ${active ? 'active' : ''}`}
    onClick={onClick}
    title={`Toggle AI Intelligence Sync for ${section}`}
  >
    <div className="pulse-ring"></div>
    <Wifi size={14} />
    <span>{active ? 'AI SYNC ACTIVE' : 'AI SYNC DISABLED'}</span>
  </div>
);

export default function LocationEditForm({ location, onSave, onCancel, loading }: LocationEditFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [formData, setFormData] = useState<CreateLocationInput>({
    name: location.name,
    store_code: location.store_code || '',
    brand_name: location.brand_name || '',
    opening_date: location.opening_date || '',
    street_address: location.street_address || '',
    city: location.city || '',
    province: location.province || '',
    postal_code: location.postal_code || '',
    operational_status: location.operational_status || 'Active',
    is_store_master: location.is_store_master || false,
    
    // Landlord
    landlord_company: location.landlord_company || '',
    landlord_name: location.landlord_name || '',
    landlord_email: location.landlord_email || '',
    landlord_phone: location.landlord_phone || '',
    primary_contact_person: location.primary_contact_person || '',
    contact_person_name: location.contact_person_name || '',
    contact_email: location.contact_email || '',
    contact_phone: location.contact_phone || '',
    property_mgmt_involved: location.property_mgmt_involved || false,
    emergency_contact_name: location.emergency_contact_name || '',
    emergency_phone: location.emergency_phone || '',
    landlord_intel_sync: location.landlord_intel_sync || false,

    // Lease
    lease_start: location.lease_start || '',
    lease_expiry: location.lease_expiry || '',
    lease_term_years: location.lease_term_years || 0,
    lease_notice_months: location.lease_notice_months || 0,
    renewal_option: location.renewal_option || false,
    renewal_terms: location.renewal_terms || '',
    base_rent: location.base_rent || 0,
    additional_rent_cam: location.additional_rent_cam || 0,
    deposit_amount: location.deposit_amount || 0,
    lease_intel_sync: location.lease_intel_sync || false,

    // Insurance
    insurance_company: location.insurance_company || '',
    insurance_broker_name: location.insurance_broker_name || '',
    policy_number: location.policy_number || '',
    coverage_type: location.coverage_type || '',
    premium_amount: location.premium_amount || 0,
    premium_frequency: (location.premium_frequency as 'Monthly' | 'Quarterly' | 'Annual') || 'Monthly',
    insurance_start_date: location.insurance_start_date || '',
    insurance_expiry_date: location.insurance_expiry_date || '',
    broker_contact_name: location.broker_contact_name || '',
    broker_phone: location.broker_phone || '',
    broker_email: location.broker_email || '',
    insurance_intel_sync: location.insurance_intel_sync || false,

    // Compliance
    biz_license_expiry: location.biz_license_expiry || '',
    fire_inspection_due: location.fire_inspection_due || '',
    fire_extinguisher_expiry: location.fire_extinguisher_expiry || '',
    compliance_intel_sync: location.compliance_intel_sync || false,

    // Ops
    store_manager_name: location.store_manager_name || '',
    staff_count: location.staff_count || 0,
    manager_phone: location.manager_phone || '',
    manager_email: location.manager_email || '',
    ops_intel_sync: location.ops_intel_sync || false,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset matrix');
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'identity', label: 'Identity', icon: <Building2 size={18} /> },
    { id: 'location', label: 'Landlord', icon: <User size={18} /> },
    { id: 'lease', label: 'Lease & Legal', icon: <Scale size={18} /> },
    { id: 'insurance', label: 'Compliance', icon: <ShieldCheck size={18} /> },
    { id: 'ops', label: 'Operations', icon: <Activity size={18} /> },
  ];



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="matrix-edit-backdrop"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="matrix-edit-container"
      >
        <style>{`
          .matrix-edit-backdrop {
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

          .matrix-edit-container {
            background: var(--bg-card);
            border-radius: 24px;
            width: 100%;
            max-width: 1000px;
            max-height: 95vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border);
            color: var(--text-primary);
          }

          .matrix-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border);
            background: var(--surface-soft);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .matrix-header-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .matrix-header h1 {
            font-size: 1.25rem;
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .matrix-header-accent {
            color: var(--primary);
          }

          .matrix-header-close {
            border-radius: 50%;
          }

          .matrix-body {
            display: grid;
            grid-template-columns: 220px 1fr;
            flex: 1;
            min-height: 500px;
            overflow: hidden;
          }

          .matrix-sidebar {
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
            color: var(--text-primary);
          }

          .tab-button.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
          }

          .matrix-sidebar-status {
            margin-top: auto;
            padding: 1rem;
            background: var(--surface);
            border-radius: 12px;
            border: 1px solid var(--border);
            text-align: center;
          }

          .matrix-sidebar-status svg {
            margin-bottom: 0.5rem;
            margin-inline: auto;
          }

          .matrix-sidebar-status p {
            font-size: 0.7rem;
            font-weight: 800;
          }

          .matrix-content {
            padding: 2.5rem;
            overflow-y: auto;
          }

          .matrix-error-banner {
            background: rgba(217, 45, 32, 0.1);
            color: var(--error);
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            font-weight: 700;
          }

          .matrix-section-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
          }

          .matrix-section-title h2 {
            font-size: 1.25rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .intel-sync-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 0.8rem;
            border-radius: 100px;
            background: var(--surface-soft);
            border: 1px solid var(--border);
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--text-secondary);
            cursor: pointer;
            transition: var(--transition);
            position: relative;
          }

          .intel-sync-toggle.active {
            background: rgba(0, 113, 227, 0.05);
            border-color: var(--primary);
            color: var(--primary);
          }

          .intel-sync-toggle.active .pulse-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px solid var(--primary);
            border-radius: 100px;
            left: 0;
            top: 0;
            animation: pulse 2s infinite;
            opacity: 0;
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.1); opacity: 0; }
          }

          .matrix-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid var(--border);
            background: var(--surface-soft);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .form-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }

          .full-width {
            grid-column: 1 / -1;
          }

          .master-toggle-wrap {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .master-toggle-checkbox {
            width: 20px;
            height: 20px;
          }

          .master-toggle-label {
            font-weight: 700;
            font-size: 0.9rem;
          }

          .spacer-md {
            height: 2rem;
          }

          .footer-btn-group {
            display: flex;
            gap: 1rem;
          }

          .footer-submit-btn {
            min-width: 200px;
            font-weight: 900;
          }
        `}</style>

        <div className="matrix-header">
          <div className="matrix-header-title">
            <Building2 size={20} color="var(--primary)" />
            <h1>Manage Asset Matrix: <span className="matrix-header-accent">{location.name}</span></h1>
          </div>
          <button onClick={onCancel} className="icon-button matrix-header-close" title="Close edit form">
            <X size={20} />
          </button>
        </div>

        <div className="matrix-body">
          <aside className="matrix-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={`Switch to ${tab.label} tab`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            
            <div className="matrix-sidebar-status">
               <Zap size={24} color="var(--primary)" />
               <p>Sync Status: Online</p>
            </div>
          </aside>

          <main className="matrix-content">
            {error && (
              <div className="matrix-error-banner">
                {error}
              </div>
            )}

            <form id="matrix-edit-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {activeTab === 'identity' && (
                  <motion.div
                    key="identity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2><Building2 size={22} className="text-primary" /> Identity Coordinates</h2>
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="edit-loc-name">LOCATION NAME</label>
                        <input id="edit-loc-name" name="name" required className="form-input" value={formData.name} onChange={handleChange} title="Location Name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-store-code">STORE CODE</label>
                        <input id="edit-store-code" name="store_code" className="form-input" value={formData.store_code} onChange={handleChange} title="Store Code" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-brand-name">BRAND NAME</label>
                        <input id="edit-brand-name" name="brand_name" className="form-input" value={formData.brand_name} onChange={handleChange} title="Brand Name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-ops-status">OPERATIONAL STATUS</label>
                        <select id="edit-ops-status" name="operational_status" className="form-select" value={formData.operational_status} onChange={handleChange} title="Operational Status">
                          <option value="Active">Active</option>
                          <option value="Under Construction">Under Construction</option>
                          <option value="Closed">Closed</option>
                          <option value="Planned">Planned</option>
                        </select>
                      </div>
                      <div className="master-toggle-wrap">
                         <input type="checkbox" id="edit_is_store_master" name="is_store_master" checked={formData.is_store_master} onChange={handleChange} className="master-toggle-checkbox" title="Mark as store master" />
                         <label htmlFor="edit_is_store_master" className="master-toggle-label">MARK AS STORE MASTER</label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'location' && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2><User size={22} /> Landlord Information</h2>
                      <IntelSyncBadge 
                        active={!!formData.landlord_intel_sync} 
                        onClick={() => setFormData(p => ({ ...p, landlord_intel_sync: !p.landlord_intel_sync }))}
                        section="Landlord"
                      />
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-landlord-co">LANDLORD COMPANY</label>
                        <input id="edit-landlord-co" name="landlord_company" className="form-input" value={formData.landlord_company} onChange={handleChange} title="Landlord Company" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-landlord-name">PRIMARY CONTACT NAME</label>
                        <input id="edit-landlord-name" name="landlord_name" className="form-input" value={formData.landlord_name} onChange={handleChange} title="Landlord Name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-landlord-email">EMAIL ADDRESS</label>
                        <input id="edit-landlord-email" name="landlord_email" className="form-input" value={formData.landlord_email} onChange={handleChange} title="Landlord Email" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-landlord-phone">PHONE NUMBER</label>
                        <input id="edit-landlord-phone" name="landlord_phone" className="form-input" value={formData.landlord_phone} onChange={handleChange} title="Landlord Phone" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'lease' && (
                  <motion.div
                    key="lease"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2><Scale size={22} /> Lease Infrastructure</h2>
                      <IntelSyncBadge 
                        active={!!formData.lease_intel_sync} 
                        onClick={() => setFormData(p => ({ ...p, lease_intel_sync: !p.lease_intel_sync }))}
                        section="Lease"
                      />
                    </div>

                    <div className="form-grid-3">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-lease-start">LEASE START</label>
                        <input id="edit-lease-start" name="lease_start" type="date" className="form-input" value={formData.lease_start} onChange={handleChange} title="Lease Start" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-lease-expiry">LEASE EXPIRY</label>
                        <input id="edit-lease-expiry" name="lease_expiry" type="date" className="form-input" value={formData.lease_expiry} onChange={handleChange} title="Lease Expiry" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-lease-notice">NOTICE (MOS)</label>
                        <input id="edit-lease-notice" name="lease_notice_months" type="number" className="form-input" value={formData.lease_notice_months} onChange={handleChange} title="Notice Months" />
                      </div>
                    </div>

                    <div className="spacer-md"></div>
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-base-rent">BASE RENT ($)</label>
                        <input id="edit-base-rent" name="base_rent" type="number" className="form-input" value={formData.base_rent} onChange={handleChange} title="Base Rent" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-cam-rent">CAM / TAX ($)</label>
                        <input id="edit-cam-rent" name="additional_rent_cam" type="number" className="form-input" value={formData.additional_rent_cam} onChange={handleChange} title="Additional Rent" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-deposit">DEPOSIT ($)</label>
                        <input id="edit-deposit" name="deposit_amount" type="number" className="form-input" value={formData.deposit_amount} onChange={handleChange} title="Deposit Amount" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'insurance' && (
                  <motion.div
                    key="insurance"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2><ShieldCheck size={22} /> Compliance Coordinates</h2>
                    </div>

                    <div className="form-grid-3">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-license-expiry">BIZ LICENSE EXPIRY</label>
                        <input id="edit-license-expiry" name="biz_license_expiry" type="date" className="form-input" value={formData.biz_license_expiry} onChange={handleChange} title="License Expiry" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-fire-inspect">FIRE INSPECTION DUE</label>
                        <input id="edit-fire-inspect" name="fire_inspection_due" type="date" className="form-input" value={formData.fire_inspection_due} onChange={handleChange} title="Fire Inspection Due" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-fire-ext">FIRE EXTINGUISHER</label>
                        <input id="edit-fire-ext" name="fire_extinguisher_expiry" type="date" className="form-input" value={formData.fire_extinguisher_expiry} onChange={handleChange} title="Fire Extinguisher Expiry" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ops' && (
                  <motion.div
                    key="ops"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="matrix-section-title">
                      <h2><Activity size={22} /> Internal Operations</h2>
                    </div>

                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label" htmlFor="edit-mgr-name">STORE MANAGER NAME</label>
                        <input id="edit-mgr-name" name="store_manager_name" className="form-input" value={formData.store_manager_name} onChange={handleChange} title="Manager Name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-mgr-email">MANAGER EMAIL</label>
                        <input id="edit-mgr-email" name="manager_email" type="email" className="form-input" value={formData.manager_email} onChange={handleChange} title="Manager Email" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-mgr-phone">MANAGER PHONE</label>
                        <input id="edit-mgr-phone" name="manager_phone" className="form-input" value={formData.manager_phone} onChange={handleChange} title="Manager Phone" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-staff-count">STAFF COUNT</label>
                        <input id="edit-staff-count" name="staff_count" type="number" className="form-input" value={formData.staff_count} onChange={handleChange} title="Staff Count" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </main>
        </div>

        <div className="matrix-footer">
          <button type="button" onClick={onCancel} className="button-secondary" title="Discard all changes">DISCARD CHANGES</button>
          <div className="footer-btn-group">
             <button 
               type="submit" 
               form="matrix-edit-form" 
               disabled={loading} 
               className="button-primary footer-submit-btn" 
               title="Update location asset matrix"
             >
               {loading ? 'COMMITING...' : 'UPDATE ASSET MATRIX'}
             </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
