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
  Wifi
} from 'lucide-react';
import { CreateLocationInput } from '@/types/location';

interface InfrastructureMatrixFormProps {
  onSave: (data: CreateLocationInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const InfrastructureMatrixForm: React.FC<InfrastructureMatrixFormProps> = ({ 
  onSave, 
  onCancel, 
  loading 
}) => {
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

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    background: 'var(--surface-soft)',
    borderRadius: '12px 12px 0 0',
    border: '1px solid var(--border)',
    borderBottom: 'none',
    marginTop: '2rem',
  };

  const contentBlockStyle = {
    padding: '1.5rem',
    background: 'var(--bg-card)',
    borderRadius: '0 0 12px 12px',
    border: '1px solid var(--border)',
    marginBottom: '2rem',
  };

  const grid3Style = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  };

  const intelSyncStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '20px',
    background: active ? 'rgba(0, 113, 227, 0.1)' : 'var(--surface)',
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0, 113, 227, 0.05)', padding: '0.5rem 1.5rem', borderRadius: '100px', marginBottom: '1rem' }}>
          <Wifi size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>INTELLIGENCE SYNC ACTIVE</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>NEAR NERD CORE INFRASTRUCTURE MATRIX</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Initialize enterprise-grade asset infrastructure coordinates.</p>
      </header>

      <form onSubmit={handleSubmit}>
        {/* CORE IDENTITY */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={22} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>STORE MASTER IDENTITY</span>
          </div>
        </div>
        <div style={contentBlockStyle}>
          <div style={grid3Style}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">LOCATION NAME</label>
              <input name="name" required className="form-input" value={formData.name} onChange={handleChange} placeholder="Official Site Name" />
            </div>
            <div className="form-group">
              <label className="form-label">STORE CODE</label>
              <input name="store_code" className="form-input" value={formData.store_code} onChange={handleChange} placeholder="NN-XXX" />
            </div>
          </div>
          <div style={grid3Style}>
            <div className="form-group">
              <label className="form-label">BRAND NAME</label>
              <input name="brand_name" className="form-input" value={formData.brand_name} onChange={handleChange} placeholder="Brand Identity" />
            </div>
            <div className="form-group">
              <label className="form-label">OPENING DATE</label>
              <input name="opening_date" type="date" className="form-input" value={formData.opening_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">OPERATIONAL STATUS</label>
              <select name="operational_status" className="form-input" value={formData.operational_status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Closed">Closed</option>
                <option value="Planned">Planned</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" name="is_store_master" checked={formData.is_store_master} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>MARK AS STORE MASTER ASSET</span>
            </label>
          </div>
        </div>

        {/* GEOGRAPHIC */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={22} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>GEOGRAPHIC COORDINATES</span>
          </div>
        </div>
        <div style={contentBlockStyle}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">STREET ADDRESS</label>
            <input name="street_address" className="form-input" value={formData.street_address} onChange={handleChange} placeholder="Street line" />
          </div>
          <div style={grid3Style}>
            <div className="form-group">
              <label className="form-label">CITY</label>
              <input name="city" className="form-input" value={formData.city} onChange={handleChange} />
            </div>
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

        {/* LANDLORD SECTION */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={22} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>LANDLORD INFORMATION</span>
          </div>
          <div 
            style={intelSyncStyle(!!formData.landlord_intel_sync)}
            onClick={() => setFormData(p => ({ ...p, landlord_intel_sync: !p.landlord_intel_sync }))}
          >
            <Wifi size={14} /> INTELLIGENCE SYNC
          </div>
        </div>
        <div style={contentBlockStyle}>
          <div style={grid3Style}>
            <div className="form-group">
              <label className="form-label">LANDLORD COMPANY</label>
              <input name="landlord_company" className="form-input" value={formData.landlord_company} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">LANDLORD NAME</label>
              <input name="landlord_name" className="form-input" value={formData.landlord_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">PROPERTY MGMT INVOLVED?</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label><input type="radio" name="property_mgmt_involved" checked={formData.property_mgmt_involved === true} onChange={() => setFormData(p=>({...p, property_mgmt_involved: true}))} /> Yes</label>
                <label><input type="radio" name="property_mgmt_involved" checked={formData.property_mgmt_involved === false} onChange={() => setFormData(p=>({...p, property_mgmt_involved: false}))} /> No</label>
              </div>
            </div>
          </div>
          <div style={grid3Style}>
            <div className="form-group">
              <label className="form-label">LANDLORD EMAIL</label>
              <input name="landlord_email" type="email" className="form-input" value={formData.landlord_email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">LANDLORD PHONE</label>
              <input name="landlord_phone" className="form-input" value={formData.landlord_phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">EMERGENCY PHONE (AFTER-HOURS)</label>
              <input name="emergency_phone" className="form-input" value={formData.emergency_phone} onChange={handleChange} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-secondary)' }}>PRIMARY CONTACT PERSON</p>
            <div style={grid3Style}>
              <input name="contact_person_name" className="form-input" placeholder="Contact Name" value={formData.contact_person_name} onChange={handleChange} />
              <input name="contact_email" className="form-input" placeholder="Contact Email" value={formData.contact_email} onChange={handleChange} />
              <input name="contact_phone" className="form-input" placeholder="Contact Phone" value={formData.contact_phone} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* LEASE SECTION */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Scale size={22} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>LEASE & LEGAL INFRASTRUCTURE</span>
          </div>
          <div 
            style={intelSyncStyle(!!formData.lease_intel_sync)}
            onClick={() => setFormData(p => ({ ...p, lease_intel_sync: !p.lease_intel_sync }))}
          >
            <Wifi size={14} /> INTELLIGENCE SYNC
          </div>
        </div>
        <div style={contentBlockStyle}>
          <div style={grid3Style}>
            <div className="form-group">
              <label className="form-label">LEASE START</label>
              <input name="lease_start" type="date" className="form-input" value={formData.lease_start} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">LEASE EXPIRY</label>
              <input name="lease_expiry" type="date" className="form-input" value={formData.lease_expiry} onChange={handleChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">TERM (YEARS)</label>
                <input name="lease_term_years" type="number" className="form-input" value={formData.lease_term_years} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">NOTICE (MONTHS)</label>
                <input name="lease_notice_months" type="number" className="form-input" value={formData.lease_notice_months} onChange={handleChange} />
              </div>
            </div>
          </div>
          <div style={grid3Style}>
            <div className="form-group">
              <label className="form-label">BASE RENT ($)</label>
              <input name="base_rent" type="number" className="form-input" value={formData.base_rent} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">CAM / TAX ($)</label>
              <input name="additional_rent_cam" type="number" className="form-input" value={formData.additional_rent_cam} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">DEPOSIT AMOUNT ($)</label>
              <input name="deposit_amount" type="number" className="form-input" value={formData.deposit_amount} onChange={handleChange} />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
             <label className="form-label">RENEWAL TERMS & OPTIONS</label>
             <textarea name="renewal_terms" className="form-input" style={{ minHeight: '60px' }} value={formData.renewal_terms} onChange={handleChange} placeholder="Describe renewal options and conditions..." />
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center' }}>
            <FileText size={24} color="var(--text-secondary)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>UPLOAD LEASE DOCUMENT</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PDF, DOCX accepted</p>
          </div>
        </div>

        {/* INSURANCE SECTION */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={22} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>POLICY & COVERAGE MATRIX</span>
          </div>
          <div 
            style={intelSyncStyle(!!formData.insurance_intel_sync)}
            onClick={() => setFormData(p => ({ ...p, insurance_intel_sync: !p.insurance_intel_sync }))}
          >
            <Wifi size={14} /> INTELLIGENCE SYNC
          </div>
        </div>
        <div style={contentBlockStyle}>
          <div style={grid3Style}>
            <div className="form-group">
              <label className="form-label">INSURANCE COMPANY</label>
              <input name="insurance_company" className="form-input" value={formData.insurance_company} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">POLICY NUMBER</label>
              <input name="policy_number" className="form-input" value={formData.policy_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">COVERAGE TYPE</label>
              <input name="coverage_type" className="form-input" value={formData.coverage_type} onChange={handleChange} placeholder="General Liability, etc." />
            </div>
          </div>
          <div style={grid3Style}>
             <div className="form-group">
              <label className="form-label">PREMIUM AMOUNT ($)</label>
              <input name="premium_amount" type="number" className="form-input" value={formData.premium_amount} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">FREQUENCY</label>
              <select name="premium_frequency" className="form-input" value={formData.premium_frequency} onChange={handleChange}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">MONTHLY EQUIVALENT ($)</label>
              <input readOnly className="form-input" style={{ background: 'var(--surface)' }} value={
                formData.premium_frequency === 'Monthly' ? formData.premium_amount :
                formData.premium_frequency === 'Quarterly' ? formData.premium_amount / 3 :
                formData.premium_amount / 12
              } />
            </div>
          </div>
          <div style={grid3Style}>
             <div className="form-group">
              <label className="form-label">POLICY START DATE</label>
              <input name="insurance_start_date" type="date" className="form-input" value={formData.insurance_start_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">POLICY EXPIRY DATE</label>
              <input name="insurance_expiry_date" type="date" className="form-input" value={formData.insurance_expiry_date} onChange={handleChange} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-secondary)' }}>BROKER CONTACT</p>
            <div style={grid3Style}>
              <input name="broker_contact_name" className="form-input" placeholder="Broker Name" value={formData.broker_contact_name} onChange={handleChange} />
              <input name="broker_email" className="form-input" placeholder="Broker Email" value={formData.broker_email} onChange={handleChange} />
              <input name="broker_phone" className="form-input" placeholder="Broker Phone" value={formData.broker_phone} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* COMPLIANCE SECTION */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>CRITICAL COMPLIANCE DATES</span>
          </div>
          <div 
            style={intelSyncStyle(!!formData.compliance_intel_sync)}
            onClick={() => setFormData(p => ({ ...p, compliance_intel_sync: !p.compliance_intel_sync }))}
          >
            <Wifi size={14} /> INTELLIGENCE SYNC
          </div>
        </div>
        <div style={contentBlockStyle}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Critical dates to prevent shutdown and fines.</p>
          <div style={grid3Style}>
            <div className="form-group">
              <label className="form-label">BIZ LICENSE EXPIRY</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', right: '12px', top: '12px' }} />
                <input name="biz_license_expiry" type="date" className="form-input" value={formData.biz_license_expiry} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">FIRE INSPECTION DUE</label>
              <div style={{ position: 'relative' }}>
                <Flame size={16} style={{ position: 'absolute', right: '12px', top: '12px' }} />
                <input name="fire_inspection_due" type="date" className="form-input" value={formData.fire_inspection_due} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">FIRE EXTINGUISHER EXPIRY</label>
              <input name="fire_extinguisher_expiry" type="date" className="form-input" value={formData.fire_extinguisher_expiry} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* INTERNAL OPS SECTION */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={22} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>INTERNAL STORE OPERATIONS</span>
          </div>
          <div 
            style={intelSyncStyle(!!formData.ops_intel_sync)}
            onClick={() => setFormData(p => ({ ...p, ops_intel_sync: !p.ops_intel_sync }))}
          >
            <Wifi size={14} /> INTELLIGENCE SYNC
          </div>
        </div>
        <div style={contentBlockStyle}>
          <div style={grid3Style}>
            <div className="form-group">
              <label className="form-label">STORE MANAGER NAME</label>
              <input name="store_manager_name" className="form-input" value={formData.store_manager_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">MANAGER EMAIL</label>
              <input name="manager_email" type="email" className="form-input" value={formData.manager_email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">MANAGER PHONE</label>
              <input name="manager_phone" className="form-input" value={formData.manager_phone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group" style={{ maxWidth: '200px' }}>
            <label className="form-label">STAFF COUNT</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Users size={20} color="var(--text-secondary)" />
              <input name="staff_count" type="number" className="form-input" value={formData.staff_count} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* FINAL ACTIONS */}
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          marginTop: '4rem', 
          padding: '2rem', 
          background: 'var(--surface-soft)', 
          borderRadius: '16px',
          border: '1px solid var(--border)' 
        }}>
          <button type="button" className="button-secondary" onClick={onCancel} style={{ flex: 1, height: '3.5rem', fontSize: '1rem', fontWeight: 800 }}>
            ABORT INITIALIZATION
          </button>
          <button type="submit" className="button-primary" disabled={loading} style={{ flex: 2, height: '3.5rem', fontSize: '1rem', fontWeight: 900 }}>
            {loading ? 'SYNCHRONIZING MATRIX...' : 'COMMIT INFRASTRUCTURE TO CORE'}
          </button>
        </div>
      </form>

      <footer style={{ marginTop: '3rem', textAlign: 'center', paddingBottom: '4rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.1em' }}>NEAR NERD ASSET MANAGEMENT SYSTEM • v2.4.0</p>
      </footer>
    </div>
  );
};

export default InfrastructureMatrixForm;
