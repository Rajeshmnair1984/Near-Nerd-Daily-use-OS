import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, Calendar, MapPin, FileText, Receipt, User, Wallet, PieChart, Shield, Clock, Info, CheckCircle2, ChevronRight, Zap } from 'lucide-react'
import { Bill, UpdateBillInput, RecurringFrequency } from '@/types/bill'
import { Location } from '@/types/location'
import { Vendor } from '@/types/vendor'
import { formatCurrency } from '@/utils/currency'

interface BillEditFormProps {
  bill: Bill
  locations: Location[]
  vendors: Vendor[]
  onSave: (updates: UpdateBillInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

type TabType = 'identity' | 'financials' | 'schedule' | 'logistics';

export default function BillEditForm({ bill, locations, vendors, onSave, onCancel, loading }: BillEditFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [formData, setFormData] = useState<UpdateBillInput>({
    charge_name: bill.charge_name,
    amount: bill.amount,
    date: bill.date,
    location_id: bill.location_id,
    category: bill.category,
    status: bill.status,
    is_recurring: bill.is_recurring,
    vendor_id: bill.vendor_id,
    invoice_number: bill.invoice_number,
    payment_method: bill.payment_method,
    notes: bill.notes,
    due_date: bill.due_date,
    paid_date: bill.paid_date,
    gst_amount: bill.gst_amount,
    pst_amount: bill.pst_amount,
    subtotal: bill.subtotal || bill.amount,
    tax_total: bill.tax_total,
    recurring_frequency: bill.recurring_frequency,
    recurring_end_date: bill.recurring_end_date,
  })

  const [error, setError] = useState<string | null>(null)

  const taxTotal = useMemo(() => {
    const gst = formData.gst_amount || 0
    const pst = formData.pst_amount || 0
    return gst + pst
  }, [formData.gst_amount, formData.pst_amount])

  const totalAmount = useMemo(() => {
    const subtotal = formData.subtotal || 0
    return subtotal + taxTotal
  }, [formData.subtotal, taxTotal])

  const handleInputChange = (field: keyof UpdateBillInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.charge_name || !formData.subtotal) {
      setError('Required: Identity & Base Financials')
      return
    }

    try {
      await onSave({ ...formData, amount: totalAmount, tax_total: taxTotal })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit financial orchestration')
    }
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'identity', label: 'Identity', icon: <Receipt size={18} /> },
    { id: 'financials', label: 'Financials', icon: <Wallet size={18} /> },
    { id: 'schedule', label: 'Schedule', icon: <Clock size={18} /> },
    { id: 'logistics', label: 'Logistics', icon: <MapPin size={18} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        backdropFilter: 'blur(12px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bill-edit-container"
      >
        <style>{`
          .bill-edit-container {
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

          .bill-modal-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border);
            background: var(--surface-soft);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .bill-modal-header h1 {
            font-size: 1.25rem;
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .bill-modal-body {
            display: grid;
            grid-template-columns: 220px 1fr;
            flex: 1;
            min-height: 500px;
            overflow: hidden;
          }

          .bill-modal-sidebar {
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

          .bill-modal-content {
            padding: 2.5rem;
            overflow-y: auto;
          }

          .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
          }

          .section-header h2 {
            font-size: 1.25rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .full-width {
            grid-column: 1 / -1;
          }

          .financial-summary {
            margin-top: 2rem;
            padding: 1.5rem;
            background: var(--surface-soft);
            border-radius: 16px;
            border: 1px solid var(--border);
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            font-size: 0.9rem;
          }

          .total-row {
            border-top: 1px solid var(--border);
            margin-top: 0.5rem;
            padding-top: 1rem;
            font-weight: 900;
            font-size: 1.25rem;
            color: var(--primary);
          }
        `}</style>

        <div className="bill-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(0, 113, 227, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
              <Receipt size={20} />
            </div>
            <h1>Commitment Matrix: <span style={{ color: 'var(--primary)' }}>{bill.charge_name}</span></h1>
          </div>
          <button onClick={onCancel} className="icon-button" style={{ borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <div className="bill-modal-body">
          <aside className="bill-modal-sidebar">
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
            
            <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
               <Zap size={24} color="var(--primary)" style={{ marginBottom: '0.5rem', marginInline: 'auto' }} />
               <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>Ledger Sync: Online</p>
            </div>
          </aside>

          <main className="bill-modal-content">
            {error && (
              <div style={{ background: 'rgba(217, 45, 32, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 700 }}>
                {error}
              </div>
            )}

            <form id="bill-edit-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {activeTab === 'identity' && (
                  <motion.div key="identity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="section-header">
                      <h2><Receipt size={22} className="text-primary" /> Charge Identity</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label">BILL NAME / CHARGE IDENTITY</label>
                        <input className="form-input" value={formData.charge_name} onChange={(e) => handleInputChange('charge_name', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">INVOICE NUMBER</label>
                        <input className="form-input" value={formData.invoice_number || ''} onChange={(e) => handleInputChange('invoice_number', e.target.value)} placeholder="INV-0000" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CATEGORY MATRIX</label>
                        <select className="form-select" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)}>
                          <option value="Rent">Rent</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Insurance">Insurance</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">SETTLEMENT STATUS</label>
                        <select className="form-select" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)}>
                          <option value="Pending">Pending Orchestration</option>
                          <option value="Paid">Settled (Paid)</option>
                          <option value="Overdue">High Risk (Overdue)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'financials' && (
                  <motion.div key="financials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="section-header">
                      <h2><Wallet size={22} /> Financial Coordinates</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label">SUBTOTAL (BASE AMOUNT)</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-secondary)' }}>$</span>
                          <input type="number" step="0.01" className="form-input" style={{ paddingLeft: '2rem' }} value={formData.subtotal} onChange={(e) => handleInputChange('subtotal', parseFloat(e.target.value) || 0)} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">GST / VAT (5%)</label>
                        <input type="number" step="0.01" className="form-input" value={formData.gst_amount} onChange={(e) => handleInputChange('gst_amount', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">PST / LOCAL (7%)</label>
                        <input type="number" step="0.01" className="form-input" value={formData.pst_amount} onChange={(e) => handleInputChange('pst_amount', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">PAYMENT INSTRUMENT</label>
                        <select className="form-select" value={formData.payment_method || ''} onChange={(e) => handleInputChange('payment_method', e.target.value)}>
                          <option value="">Select Method</option>
                          <option value="Bank Transfer">Bank Transfer (EFT)</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Check">Check</option>
                          <option value="Online">Online Portal</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="financial-summary">
                      <div className="summary-row"><span>Subtotal Matrix:</span><span>{formatCurrency(formData.subtotal || 0)}</span></div>
                      <div className="summary-row"><span>Tax Accumulation:</span><span>{formatCurrency(taxTotal)}</span></div>
                      <div className="summary-row total-row"><span>Total Commitment:</span><span>{formatCurrency(totalAmount)}</span></div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'schedule' && (
                  <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="section-header">
                      <h2><Clock size={22} /> Temporal Range</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">INVOICE / BILL DATE</label>
                        <input type="date" className="form-input" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">DUE DATE</label>
                        <input type="date" className="form-input" value={formData.due_date} onChange={(e) => handleInputChange('due_date', e.target.value)} />
                      </div>
                      
                      <div className="form-group full-width" style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--surface-soft)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={formData.is_recurring} onChange={(e) => handleInputChange('is_recurring', e.target.checked)} style={{ width: '22px', height: '22px', accentColor: 'var(--primary)' }} />
                          <div>
                            <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>ENABLE RECURRING ORCHESTRATION</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automatically generate the next liability entry in the ledger.</p>
                          </div>
                        </label>
                      </div>

                      {formData.is_recurring && (
                        <>
                          <div className="form-group">
                            <label className="form-label">RECURRENCE FREQUENCY</label>
                            <select className="form-select" value={formData.recurring_frequency} onChange={(e) => handleInputChange('recurring_frequency', e.target.value)}>
                              <option value="monthly">Monthly</option>
                              <option value="weekly">Weekly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="annual">Annual</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">TERMINATION DATE</label>
                            <input type="date" className="form-input" value={formData.recurring_end_date || ''} onChange={(e) => handleInputChange('recurring_end_date', e.target.value)} />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'logistics' && (
                  <motion.div key="logistics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="section-header">
                      <h2><MapPin size={22} /> Logistics & Intelligence</h2>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">LOCATION COORDINATE</label>
                        <select className="form-select" value={formData.location_id} onChange={(e) => handleInputChange('location_id', e.target.value)}>
                          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">VENDOR IDENTITY</label>
                        <select className="form-select" value={formData.vendor_id || ''} onChange={(e) => handleInputChange('vendor_id', e.target.value)}>
                          <option value="">No Vendor Assigned</option>
                          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">OPERATIONAL NOTES</label>
                        <textarea className="form-textarea" style={{ minHeight: '120px' }} value={formData.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Technical details, dispute logs, or internal comments..." />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </main>
        </div>

        <div className="bill-modal-footer" style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', background: 'var(--surface-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={onCancel} className="button-secondary">DISCARD CHANGES</button>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button type="submit" form="bill-edit-form" disabled={loading} className="button-primary" style={{ minWidth: '200px', fontWeight: 900 }}>
               {loading ? 'COMMITING...' : 'COMMIT CHANGES'}
             </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
