import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, Building2, MapPin, Calendar, ShieldCheck, FileText, User, Wallet, 
  Zap, Activity, CheckCircle2, AlertCircle, Wifi, Scale, Phone, Mail, 
  Clock, Flame, Users 
} from 'lucide-react'
import { Location, CreateLocationInput } from '@/types/location'

interface LocationEditFormProps {
  location: Location
  onSave: (updates: CreateLocationInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function LocationEditForm({ location, onSave, onCancel, loading }: LocationEditFormProps) {
  const [formData, setFormData] = useState<CreateLocationInput>({
    name: location.name,
    store_code: location.store_code || '',
    brand_name: location.brand_name || '',
    opening_date: location.opening_date || '',
    street_address: location.street_address || '',
    city: location.city || '',
    province: location.province || '',
    postal_code: location.postal_code || '',
    operational_status: (location.operational_status as any) || 'Active',
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
    premium_frequency: (location.premium_frequency as any) || 'Monthly',
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
  })

  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onSave(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset matrix')
    }
  }

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    background: 'var(--surface-soft)',
    borderRadius: '10px 10px 0 0',
    border: '1px solid var(--border)',
    borderBottom: 'none',
    marginTop: '1.5rem',
  };

  const contentBlockStyle = {
    padding: '1.25rem',
    background: 'var(--bg-card)',
    borderRadius: '0 0 10px 10px',
    border: '1px solid var(--border)',
    marginBottom: '1rem',
  };

  const grid3Style = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  };

  const intelSyncStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.3rem 0.6rem',
    borderRadius: '20px',
    background: active ? 'rgba(0, 113, 227, 0.1)' : 'var(--surface)',
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    fontSize: '0.7rem',
    fontWeight: 700,
    cursor: 'pointer',
    border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onCancel}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '950px',
          width: '100%',
          maxHeight: '95vh',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
               <Wifi size={14} color="var(--primary)" />
               <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>INTELLIGENCE SYNC ACTIVE</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>MANAGE ASSET MATRIX: {location.name}</h2>
          </div>
          <button type="button" onClick={onCancel} style={{ background: 'var(--surface-soft)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.6rem', borderRadius: '50%' }}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--status-overdue)15', color: 'var(--status-overdue)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 700 }}>
            {error}
          </div>
        )}

        {/* CORE IDENTITY */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>IDENTITY COORDINATES</span>
          </div>
        </div>
        <div style={contentBlockStyle}>
          <div style={grid3Style}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">LOCATION NAME</label>
              <input name="name" required className="form-input" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">STORE CODE</label>
              <input name="store_code" className="form-input" value={formData.store_code} onChange={handleChange} />
            </div>
          </div>
          <div style={grid3Style}>
             <div className="form-group">
              <label className="form-label">BRAND NAME</label>
              <input name="brand_name" className="form-input" value={formData.brand_name} onChange={handleChange} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="edit_is_store_master" name="is_store_master" checked={formData.is_store_master} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
              <label htmlFor="edit_is_store_master" style={{ fontWeight: 700, fontSize: '0.8rem' }}>STORE MASTER</label>
            </div>
          </div>
        </div>

        {/* LANDLORD */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>LANDLORD INFORMATION</span>
          </div>
          <div style={intelSyncStyle(!!formData.landlord_intel_sync)} onClick={() => setFormData(p=>({...p, landlord_intel_sync: !p.landlord_intel_sync}))}>
            <Wifi size={12} /> SYNC
          </div>
        </div>
        <div style={contentBlockStyle}>
           <div style={grid3Style}>
             <input name="landlord_company" className="form-input" placeholder="LANDLORD COMPANY" value={formData.landlord_company} onChange={handleChange} />
             <input name="landlord_name" className="form-input" placeholder="LANDLORD NAME" value={formData.landlord_name} onChange={handleChange} />
             <input name="landlord_email" className="form-input" placeholder="LANDLORD EMAIL" value={formData.landlord_email} onChange={handleChange} />
           </div>
           <div style={grid3Style}>
             <input name="landlord_phone" className="form-input" placeholder="LANDLORD PHONE" value={formData.landlord_phone} onChange={handleChange} />
             <input name="emergency_phone" className="form-input" placeholder="EMERGENCY PHONE" value={formData.emergency_phone} onChange={handleChange} />
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}>
               <input type="checkbox" name="property_mgmt_involved" checked={formData.property_mgmt_involved} onChange={handleChange} />
               PROPERTY MGMT?
             </div>
           </div>
        </div>

        {/* LEASE */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>LEASE INFRASTRUCTURE</span>
          </div>
          <div style={intelSyncStyle(!!formData.lease_intel_sync)} onClick={() => setFormData(p=>({...p, lease_intel_sync: !p.lease_intel_sync}))}>
            <Wifi size={12} /> SYNC
          </div>
        </div>
        <div style={contentBlockStyle}>
           <div style={grid3Style}>
             <div className="form-group"><label className="form-label">LEASE START</label><input name="lease_start" type="date" className="form-input" value={formData.lease_start} onChange={handleChange} /></div>
             <div className="form-group"><label className="form-label">LEASE EXPIRY</label><input name="lease_expiry" type="date" className="form-input" value={formData.lease_expiry} onChange={handleChange} /></div>
             <div className="form-group"><label className="form-label">NOTICE (MOS)</label><input name="lease_notice_months" type="number" className="form-input" value={formData.lease_notice_months} onChange={handleChange} /></div>
           </div>
           <div style={grid3Style}>
             <div className="form-group"><label className="form-label">BASE RENT ($)</label><input name="base_rent" type="number" className="form-input" value={formData.base_rent} onChange={handleChange} /></div>
             <div className="form-group"><label className="form-label">CAM / TAX ($)</label><input name="additional_rent_cam" type="number" className="form-input" value={formData.additional_rent_cam} onChange={handleChange} /></div>
             <div className="form-group"><label className="form-label">DEPOSIT ($)</label><input name="deposit_amount" type="number" className="form-input" value={formData.deposit_amount} onChange={handleChange} /></div>
           </div>
        </div>

        {/* COMPLIANCE */}
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>CRITICAL COMPLIANCE COORDINATES</span>
          </div>
        </div>
        <div style={contentBlockStyle}>
           <div style={grid3Style}>
             <div className="form-group"><label className="form-label">BIZ LICENSE EXPIRY</label><input name="biz_license_expiry" type="date" className="form-input" value={formData.biz_license_expiry} onChange={handleChange} /></div>
             <div className="form-group"><label className="form-label">FIRE INSPECTION DUE</label><input name="fire_inspection_due" type="date" className="form-input" value={formData.fire_inspection_due} onChange={handleChange} /></div>
             <div className="form-group"><label className="form-label">FIRE EXTINGUISHER</label><input name="fire_extinguisher_expiry" type="date" className="form-input" value={formData.fire_extinguisher_expiry} onChange={handleChange} /></div>
           </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
          <button type="button" onClick={onCancel} className="button-secondary" style={{ flex: 1, height: '3rem' }}>DISCARD</button>
          <button type="submit" disabled={loading} className="button-primary" style={{ flex: 2, height: '3rem', fontWeight: 900 }}>COMMIT MATRIX UPDATES</button>
        </div>
      </motion.form>
    </motion.div>
  )
}
