import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  User, 
  Wallet, 
  Zap, 
  Calendar,
  Activity,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Scale,
  Clock,
  Flame,
  Users,
  Wifi,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateLocationInput } from '@/types/location';

interface InfrastructureMatrixFormProps {
  onSave: (data: CreateLocationInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

type TabType = 'identity' | 'location' | 'lease' | 'insurance' | 'ops';

const InfrastructureMatrixForm: React.FC<InfrastructureMatrixFormProps> = ({ 
  onSave, 
  onCancel, 
  loading 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [formData, setFormData] = useState<CreateLocationInput>({
    name: '',
    store_code: '',
    brand_name: '',
    opening_date: '',
    street_address: '',
    city: '',
    province: '',
    postal_code: '',
    operational_status: 'Active',
    is_store_master: false,
    
    // Landlord
    landlord_company: '',
    landlord_name: '',
    landlord_email: '',
    landlord_phone: '',
    primary_contact_person: '',
    contact_person_name: '',
    contact_email: '',
    contact_phone: '',
    property_mgmt_involved: false,
    emergency_contact_name: '',
    emergency_phone: '',
    landlord_intel_sync: false,

    // Lease
    lease_start: '',
    lease_expiry: '',
    lease_term_years: 0,
    lease_notice_months: 0,
    renewal_option: false,
    renewal_terms: '',
    base_rent: 0,
    additional_rent_cam: 0,
    deposit_amount: 0,
    lease_intel_sync: false,

    // Insurance
    insurance_company: '',
    insurance_broker_name: '',
    policy_number: '',
    coverage_type: '',
    premium_amount: 0,
    premium_frequency: 'Monthly',
    insurance_start_date: '',
    insurance_expiry_date: '',
    broker_contact_name: '',
    broker_phone: '',
    broker_email: '',
    insurance_intel_sync: false,

    // Compliance
    biz_license_expiry: '',
    fire_inspection_due: '',
    fire_extinguisher_expiry: '',
    compliance_intel_sync: false,

    // Ops
    store_manager_name: '',
    staff_count: 0,
    manager_phone: '',
    manager_email: '',
    ops_intel_sync: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'identity', label: 'Identity', icon: <Building2 size={18} /> },
    { id: 'location', label: 'Landlord', icon: <User size={18} /> },
    { id: 'lease', label: 'Lease & Legal', icon: <Scale size={18} /> },
    { id: 'insurance', label: 'Compliance', icon: <ShieldCheck size={18} /> },
    { id: 'ops', label: 'Operations', icon: <Activity size={18} /> },
  ];

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

  return (
    <div className="matrix-form-container">
      <style>{`
        .matrix-form-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          color: var(--text-primary);
        }

        .matrix-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border);
          background: var(--surface-soft);
        }

        .matrix-header h1 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        .matrix-header p {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .matrix-body {
          display: grid;
          grid-template-columns: 240px 1fr;
          flex: 1;
          min-height: 500px;
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

        .matrix-content {
          padding: 2rem;
          overflow-y: auto;
          max-height: 600px;
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

        .matrix-info-box {
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(0, 113, 227, 0.03);
          border: 1px solid rgba(0, 113, 227, 0.1);
          border-radius: var(--radius-md);
          display: flex;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .matrix-info-box svg {
          color: var(--primary);
          flex-shrink: 0;
        }
      `}</style>

      <div className="matrix-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: '8px', color: 'white' }}>
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h1>Asset Initialization Matrix</h1>
            <p>Define core infrastructure parameters and operational coordinates.</p>
          </div>
        </div>
      </div>

      <div className="matrix-body">
        <aside className="matrix-sidebar">
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
          
          <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Completion</p>
            <div style={{ height: '6px', background: 'var(--surface-soft)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '40%', height: '100%', background: 'var(--primary)' }}></div>
            </div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.4rem' }}>40% Coordinates Locked</p>
          </div>
        </aside>

        <main className="matrix-content">
          <form id="matrix-form" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {activeTab === 'identity' && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="matrix-section-title">
                    <h2><Building2 size={22} className="text-primary" /> Store Master Identity</h2>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">LOCATION NAME</label>
                      <input name="name" required className="form-input" value={formData.name} onChange={handleChange} placeholder="e.g. Near Nerd Global HQ" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">STORE CODE</label>
                      <input name="store_code" className="form-input" value={formData.store_code} onChange={handleChange} placeholder="NN-XXX" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">BRAND NAME</label>
                      <input name="brand_name" className="form-input" value={formData.brand_name} onChange={handleChange} placeholder="Official Brand Identity" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">OPENING DATE</label>
                      <input name="opening_date" type="date" className="form-input" value={formData.opening_date} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">OPERATIONAL STATUS</label>
                      <select name="operational_status" className="form-select" value={formData.operational_status} onChange={handleChange}>
                        <option value="Active">Active</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="Closed">Closed</option>
                        <option value="Planned">Planned</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        name="is_store_master" 
                        checked={formData.is_store_master} 
                        onChange={handleChange} 
                        style={{ width: '22px', height: '22px', accentColor: 'var(--primary)' }} 
                      />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>MARK AS STORE MASTER ASSET</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Designates this location as a primary administrative hub.</p>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {activeTab === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="matrix-section-title">
                    <h2><MapPin size={22} /> Geographic & Landlord</h2>
                    <IntelSyncBadge 
                      active={!!formData.landlord_intel_sync} 
                      onClick={() => setFormData(p => ({ ...p, landlord_intel_sync: !p.landlord_intel_sync }))}
                      section="Landlord Intelligence"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">STREET ADDRESS</label>
                      <input name="street_address" className="form-input" value={formData.street_address} onChange={handleChange} placeholder="Unit #, Street Address" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CITY</label>
                      <input name="city" className="form-input" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="form-grid" style={{ gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">PROVINCE</label>
                        <input name="province" className="form-input" value={formData.province} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">POSTAL CODE</label>
                        <input name="postal_code" className="form-input" value={formData.postal_code} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1.5rem' }}></div>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>LANDLORD & PROPERTY MANAGEMENT</h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">LANDLORD COMPANY</label>
                      <input name="landlord_company" className="form-input" value={formData.landlord_company} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PRIMARY CONTACT NAME</label>
                      <input name="landlord_name" className="form-input" value={formData.landlord_name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">EMAIL ADDRESS</label>
                      <input name="landlord_email" type="email" className="form-input" value={formData.landlord_email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PHONE NUMBER</label>
                      <input name="landlord_phone" className="form-input" value={formData.landlord_phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="matrix-info-box">
                    <Info size={16} />
                    <p>Enabling AI Sync will automatically monitor landlord communications and lease updates if integrated with NN Intelligence Hub.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'lease' && (
                <motion.div
                  key="lease"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="matrix-section-title">
                    <h2><Scale size={22} /> Lease & Financials</h2>
                    <IntelSyncBadge 
                      active={!!formData.lease_intel_sync} 
                      onClick={() => setFormData(p => ({ ...p, lease_intel_sync: !p.lease_intel_sync }))}
                      section="Lease Intelligence"
                    />
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">LEASE START</label>
                      <input name="lease_start" type="date" className="form-input" value={formData.lease_start} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">LEASE EXPIRY</label>
                      <input name="lease_expiry" type="date" className="form-input" value={formData.lease_expiry} onChange={handleChange} />
                    </div>
                    <div className="form-grid" style={{ gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">TERM (YRS)</label>
                        <input name="lease_term_years" type="number" className="form-input" value={formData.lease_term_years} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">NOTICE (MOS)</label>
                        <input name="lease_notice_months" type="number" className="form-input" value={formData.lease_notice_months} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '2rem' }}></div>
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">BASE RENT ($)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>$</span>
                        <input name="base_rent" type="number" className="form-input" style={{ paddingLeft: '2rem' }} value={formData.base_rent} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">CAM / TAX ($)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>$</span>
                        <input name="additional_rent_cam" type="number" className="form-input" style={{ paddingLeft: '2rem' }} value={formData.additional_rent_cam} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">DEPOSIT ($)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>$</span>
                        <input name="deposit_amount" type="number" className="form-input" style={{ paddingLeft: '2rem' }} value={formData.deposit_amount} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">RENEWAL TERMS</label>
                    <textarea name="renewal_terms" className="form-textarea" style={{ minHeight: '100px' }} value={formData.renewal_terms} onChange={handleChange} placeholder="Outline renewal options, indexation, and special conditions..." />
                  </div>

                  <div style={{ marginTop: '2rem', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '16px', textAlign: 'center', background: 'var(--surface-soft)' }}>
                    <FileText size={32} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Upload Signed Lease Agreement</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PDF or Scan required for Intelligence Sync validation.</p>
                    <button type="button" className="button-secondary" style={{ marginTop: '1rem', marginInline: 'auto' }}>Select File</button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'insurance' && (
                <motion.div
                  key="insurance"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="matrix-section-title">
                    <h2><ShieldCheck size={22} /> Insurance & Compliance</h2>
                    <IntelSyncBadge 
                      active={!!formData.insurance_intel_sync} 
                      onClick={() => setFormData(p => ({ ...p, insurance_intel_sync: !p.insurance_intel_sync }))}
                      section="Compliance Intelligence"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">INSURANCE CARRIER</label>
                      <input name="insurance_company" className="form-input" value={formData.insurance_company} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">POLICY NUMBER</label>
                      <input name="policy_number" className="form-input" value={formData.policy_number} onChange={handleChange} />
                    </div>
                  </div>

                  <div style={{ height: '2rem' }}></div>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>CRITICAL COMPLIANCE MONITORING</h3>
                  
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">BIZ LICENSE EXPIRY</label>
                      <div style={{ position: 'relative' }}>
                        <Clock size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input name="biz_license_expiry" type="date" className="form-input" value={formData.biz_license_expiry} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">FIRE INSPECTION DUE</label>
                      <div style={{ position: 'relative' }}>
                        <Flame size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input name="fire_inspection_due" type="date" className="form-input" value={formData.fire_inspection_due} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">FIRE EXT. EXPIRY</label>
                      <input name="fire_extinguisher_expiry" type="date" className="form-input" value={formData.fire_extinguisher_expiry} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="matrix-info-box" style={{ marginTop: '2.5rem', background: 'rgba(217, 45, 32, 0.03)', border: '1px solid rgba(217, 45, 32, 0.1)' }}>
                    <AlertCircle size={16} style={{ color: 'var(--error)' }} />
                    <p style={{ color: 'var(--error)' }}>Missing compliance dates will trigger "High Risk" status in the Master Operations Dashboard.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ops' && (
                <motion.div
                  key="ops"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="matrix-section-title">
                    <h2><Activity size={22} /> Internal Operations</h2>
                    <IntelSyncBadge 
                      active={!!formData.ops_intel_sync} 
                      onClick={() => setFormData(p => ({ ...p, ops_intel_sync: !p.ops_intel_sync }))}
                      section="Ops Intelligence"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">STORE MANAGER NAME</label>
                      <input name="store_manager_name" className="form-input" value={formData.store_manager_name} onChange={handleChange} placeholder="Full Legal Name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">MANAGER EMAIL</label>
                      <input name="manager_email" type="email" className="form-input" value={formData.manager_email} onChange={handleChange} placeholder="nn.manager@nearnerd.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">MANAGER PHONE</label>
                      <input name="manager_phone" className="form-input" value={formData.manager_phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">STAFF COMPLEMENT (HC)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Users size={20} color="var(--text-secondary)" />
                        <input name="staff_count" type="number" className="form-input" value={formData.staff_count} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', background: 'rgba(0, 113, 227, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)' }}>
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>Finalize Asset Matrix</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Review all coordinates across tabs before committing to the core system.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </main>
      </div>

      <div className="matrix-footer">
        <button type="button" className="button-secondary" onClick={onCancel} style={{ paddingInline: '2rem' }}>
          ABORT
        </button>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
           {activeTab !== 'identity' && (
             <button 
               type="button" 
               className="button-secondary" 
               onClick={() => {
                 const currentIndex = tabs.findIndex(t => t.id === activeTab);
                 setActiveTab(tabs[currentIndex - 1].id);
               }}
             >
               PREVIOUS
             </button>
           )}
           
           {activeTab !== 'ops' ? (
             <button 
               type="button" 
               className="button-primary" 
               onClick={() => {
                 const currentIndex = tabs.findIndex(t => t.id === activeTab);
                 setActiveTab(tabs[currentIndex + 1].id);
               }}
               style={{ paddingInline: '2rem' }}
             >
               NEXT STEP <ChevronRight size={18} />
             </button>
           ) : (
             <button 
               form="matrix-form"
               type="submit" 
               className="button-primary" 
               disabled={loading} 
               style={{ paddingInline: '3rem', background: 'var(--success)' }}
             >
               {loading ? 'SYNCHRONIZING...' : 'COMMIT MATRIX'}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default InfrastructureMatrixForm;
