import { memo, useMemo, useState } from 'react'
import { Plus, Search, Receipt, Trash2, CalendarDays, Repeat2, Edit, Download, Wallet, CreditCard, PieChart, TrendingUp, Filter, X, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bill, BillStatus, CreateBillInput, UpdateBillInput } from '@/types/bill'
import { Location } from '@/types/location'
import { Vendor } from '@/types/vendor'
import { BillForm } from './BillForm'
import BillEditForm from './BillEditForm'
import { Modal } from './ui/Modal'
import { ErrorBanner } from './ui/ErrorBanner'
import { ConfirmationModal } from './ui/ConfirmationModal'
import { formatCurrency } from '@/utils/currency'
import { exportService } from '@/services/exportService'

interface BillManagerProps {
  bills: Bill[]
  locations: Location[]
  vendors?: Vendor[]
  onUpdateStatus: (id: string, status: BillStatus) => Promise<void>
  onAddBill: (bill: CreateBillInput) => Promise<void>
  onUpdateBill?: (id: string, updates: UpdateBillInput) => Promise<void>
  onDeleteBill: (id: string) => Promise<void>
  loading?: boolean
}

const statusOptions: Array<BillStatus | 'All'> = ['All', 'Paid', 'Pending', 'Overdue'];

function BillManager({
  bills,
  locations,
  vendors = [],
  onUpdateStatus,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  loading,
}: BillManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<BillStatus | 'All'>('All')
  const [filterLocation, setFilterLocation] = useState<string>('All')
  const [filterVendor, setFilterVendor] = useState<string>('All')
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [dateRangeFrom, setDateRangeFrom] = useState<string>('')
  const [dateRangeTo, setDateRangeTo] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const locationById = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations]
  );

  const uniqueCategories = useMemo(
    () => ['All', ...Array.from(new Set(bills.map((b) => b.category)))],
    [bills]
  );

  const filteredBills = useMemo(
    () =>
      bills.filter((bill) => {
        const location = locationById.get(bill.location_id);
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
          query.length === 0 ||
          bill.charge_name.toLowerCase().includes(query) ||
          bill.category.toLowerCase().includes(query) ||
          location?.name.toLowerCase().includes(query);
        const matchesStatus = filterStatus === 'All' || bill.status === filterStatus;
        const matchesLocation = filterLocation === 'All' || bill.location_id === filterLocation;
        const matchesVendor = filterVendor === 'All' || bill.vendor_id === filterVendor;
        const matchesCategory = filterCategory === 'All' || bill.category === filterCategory;
        const billDate = new Date(bill.date);
        const fromDate = dateRangeFrom ? new Date(dateRangeFrom) : null;
        const toDate = dateRangeTo ? new Date(dateRangeTo) : null;
        const matchesDateRange =
          (!fromDate || billDate >= fromDate) && (!toDate || billDate <= toDate);
        return (
          matchesSearch &&
          matchesStatus &&
          matchesLocation &&
          matchesVendor &&
          matchesCategory &&
          matchesDateRange
        );
      }),
    [bills, filterStatus, filterLocation, filterVendor, filterCategory, dateRangeFrom, dateRangeTo, locationById, searchTerm]
  );

  const stats = useMemo(() => {
    const total = bills.reduce((acc, curr) => acc + curr.amount, 0);
    const pending = bills.filter(b => b.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
    const overdue = bills.filter(b => b.status === 'Overdue').reduce((acc, curr) => acc + curr.amount, 0);
    return { total, pending, overdue };
  }, [bills]);

  const handleAddBill = async (bill: CreateBillInput) => {
    setError(null)
    try {
      await onAddBill(bill)
      setShowModal(false)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add bill'
      setError(errorMsg)
    }
  }

  const handleEditBill = async (updates: UpdateBillInput) => {
    if (!editingBill || !onUpdateBill) return
    setEditLoading(true)
    setError(null)
    try {
      await onUpdateBill(editingBill.id, updates)
      setEditingBill(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update bill'
      setError(errorMsg)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteBill = async (id: string) => {
    setDeleteLoading(id)
    setError(null)
    try {
      await onDeleteBill(id)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete bill'
      setError(errorMsg)
    } finally {
      setDeleteLoading(null)
    }
  }

  const isFiltered = filterLocation !== 'All' || filterVendor !== 'All' || filterCategory !== 'All' || dateRangeFrom || dateRangeTo;

  return (
    <div className="page-shell bill-matrix-page">
      <style>{`
        .bill-matrix-page .page-hero {
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-soft) 100%);
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          margin-bottom: 2.5rem;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 2rem;
        }

        .bill-matrix-page .hero-content h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 0.75rem;
          background: linear-gradient(to right, var(--text-primary), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .bill-matrix-page .hero-content p {
          font-size: 1.15rem;
          color: var(--text-secondary);
          max-width: 600px;
        }

        .bill-matrix-page .metric-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .bill-matrix-page .metric-card {
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .bill-matrix-page .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }

        .bill-matrix-page .metric-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: rgba(0, 113, 227, 0.08);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bill-matrix-page .metric-info span {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .bill-matrix-page .metric-info strong {
          display: block;
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
        }

        .bill-matrix-page .bill-toolbar-premium {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .bill-matrix-page .main-tools {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .bill-matrix-page .search-field-premium {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 0.8rem 1.5rem;
          transition: var(--transition);
        }

        .bill-matrix-page .search-field-premium:focus-within {
          background: var(--surface);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
        }

        .bill-matrix-page .search-field-premium input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .bill-matrix-page .advanced-filters {
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .bill-matrix-page .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .bill-matrix-page .filter-group label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bill-matrix-page .filter-select {
          padding: 0.6rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          font-size: 0.85rem;
          cursor: pointer;
        }

        .bill-matrix-page .premium-button {
          padding: 0.75rem 1.5rem;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: var(--transition);
        }

        .bill-matrix-page .export-group {
          display: flex;
          gap: 0.5rem;
        }

        .bill-matrix-page .export-button {
          padding: 0.6rem 1rem;
          border-radius: 100px;
          border: 1px solid var(--border);
          background: var(--surface);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: var(--transition);
        }

        .bill-matrix-page .export-button:hover {
          background: var(--surface-soft);
          border-color: var(--primary);
          color: var(--primary);
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">Financial Orchestration</p>
          <h1>Bill Management</h1>
          <p>Global oversight of commitments, recurring liabilities, and location-based operational expenses.</p>
        </div>
        <button className="premium-button button-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          <span>INITIALIZE NEW BILL</span>
        </button>
      </header>

      <div className="metric-strip">
        <div className="metric-card">
          <div className="metric-icon"><Wallet size={24} /></div>
          <div className="metric-info">
            <span>Total Liabilities</span>
            <strong>{formatCurrency(stats.total)}</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><CreditCard size={24} /></div>
          <div className="metric-info">
            <span>Pending Clearance</span>
            <strong>{formatCurrency(stats.pending)}</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><PieChart size={24} /></div>
          <div className="metric-info">
            <span>High Risk (Overdue)</span>
        .bill-matrix-page .overdue-text {
          color: var(--error);
        }

        .bill-matrix-page .segmented-control-wrapper {
          border-radius: 100px;
          padding: 0.4rem;
        }

        .bill-matrix-page .segmented-button {
          border-radius: 100px;
          min-height: 34px;
        }

        .bill-matrix-page .filter-overflow {
          overflow: hidden;
        }

        .bill-matrix-page .reset-button {
          width: 100%;
          justify-content: center;
          height: 38px;
          color: var(--error);
        }

        .bill-matrix-page .stats-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bill-matrix-page .stats-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .bill-matrix-page .stats-count {
          color: var(--primary);
        }

        .bill-matrix-page .bill-icon-status {
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }

        .bill-matrix-page .title-main {
          font-size: 0.95rem;
        }

        .bill-matrix-page .title-sub {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .bill-matrix-page .recurring-tag {
          color: var(--primary);
          font-weight: 800;
          font-size: 0.65rem;
        }

        .bill-matrix-page .location-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .bill-matrix-page .location-name {
          font-weight: 600;
        }

        .bill-matrix-page .money-cell {
          font-size: 1rem;
        }

        .bill-matrix-page .date-badge {
          background: var(--surface-soft);
          border: 1px solid var(--border);
        }

        .bill-matrix-page .status-select {
          border: none;
          cursor: pointer;
          font-weight: 800;
        }

        .bill-matrix-page .action-group {
          display: flex;
          gap: 0.5rem;
        }

        .bill-matrix-page .edit-button {
          background: var(--surface-soft);
        }

        .bill-matrix-page .empty-state-container {
          padding: 4rem 0;
        }

        .bill-matrix-page .empty-state-icon {
          opacity: 0.1;
          margin-bottom: 1rem;
        }

        .bill-matrix-page .empty-state-title {
          font-weight: 800;
        }

        .bill-matrix-page .empty-state-sub {
          color: var(--text-secondary);
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">Financial Orchestration</p>
          <h1>Bill Management</h1>
          <p>Global oversight of commitments, recurring liabilities, and location-based operational expenses.</p>
        </div>
        <button className="premium-button button-primary" onClick={() => setShowModal(true)} title="Create new bill entry">
          <Plus size={20} aria-hidden="true" />
          <span>INITIALIZE NEW BILL</span>
        </button>
      </header>

      <div className="metric-strip">
        <div className="metric-card">
          <div className="metric-icon"><Wallet size={24} aria-hidden="true" /></div>
          <div className="metric-info">
            <span>Total Liabilities</span>
            <strong>{formatCurrency(stats.total)}</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><CreditCard size={24} aria-hidden="true" /></div>
          <div className="metric-info">
            <span>Pending Clearance</span>
            <strong>{formatCurrency(stats.pending)}</strong>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><PieChart size={24} aria-hidden="true" /></div>
          <div className="metric-info">
            <span>High Risk (Overdue)</span>
            <strong className="overdue-text">{formatCurrency(stats.overdue)}</strong>
          </div>
        </div>
      </div>

      <section className="panel bill-panel">
        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        <div className="bill-toolbar-premium">
          <div className="main-tools">
            <div className="search-field-premium">
              <Search size={19} className="text-secondary" aria-hidden="true" />
              <input
                type="text"
                placeholder="Locate liabilities by name, location, or category..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                title="Search bills"
              />
            </div>
            
            <div className="segmented-control segmented-control-wrapper" role="group" aria-label="Filter by status">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`segmented-button ${filterStatus === status ? 'active' : ''}`}
                  aria-pressed={filterStatus === status}
                >
                  {status}
                </button>
              ))}
            </div>

            <button 
              className={`export-button ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              title={showFilters ? 'Hide filters' : 'Show filters'}
              aria-expanded={showFilters}
            >
              <Filter size={18} aria-hidden="true" />
              {showFilters ? 'HIDE FILTERS' : 'ADVANCED FILTERS'}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="filter-overflow"
              >
                <div className="advanced-filters">
                  <div className="filter-group">
                    <label htmlFor="filter-location">Location Coordinate</label>
                    <select id="filter-location" className="filter-select" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                      <option value="All">All Locations</option>
                      {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="filter-vendor">Vendor Identity</label>
                    <select id="filter-vendor" className="filter-select" value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)}>
                      <option value="All">All Vendors</option>
                      {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="filter-category">Category Matrix</label>
                    <select id="filter-category" className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                      {uniqueCategories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="date-from">Temporal Range (Start)</label>
                    <input id="date-from" type="date" className="filter-select" value={dateRangeFrom} onChange={(e) => setDateRangeFrom(e.target.value)} />
                  </div>
                  <div className="filter-group">
                    <label htmlFor="date-to">Temporal Range (End)</label>
                    <input id="date-to" type="date" className="filter-select" value={dateRangeTo} onChange={(e) => setDateRangeTo(e.target.value)} />
                  </div>
                  <div className="filter-actions-box">
                    {isFiltered && (
                      <button 
                        onClick={() => { setFilterLocation('All'); setFilterVendor('All'); setFilterCategory('All'); setDateRangeFrom(''); setDateRangeTo(''); }}
                        className="export-button reset-button"
                        title="Reset all filters"
                      >
                        <X size={14} aria-hidden="true" /> RESET COORDINATES
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="stats-row">
            <p className="stats-text">
              IDENTIFIED <span className="stats-count">{filteredBills.length}</span> LIABILITIES
            </p>
            <div className="export-group" role="group" aria-label="Export options">
              <button className="export-button" onClick={() => exportService.exportBillsToCSV(filteredBills)} title="Export to CSV"><Download size={14} aria-hidden="true" /> CSV</button>
              <button className="export-button" onClick={() => exportService.exportBillsSummaryToCSV(filteredBills)} title="Export summary to CSV"><Download size={14} aria-hidden="true" /> SUMMARY</button>
              <button className="export-button" onClick={() => exportService.exportBillsToText(filteredBills)} title="Export to text report"><Download size={14} aria-hidden="true" /> REPORT</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state" aria-busy="true">Synchronizing Financial Matrix...</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th scope="col">Charge Identity</th>
                  <th scope="col">Location</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Temporal Coordinate</th>
                  <th scope="col">Status</th>
                  <th scope="col" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => {
                  const location = locationById.get(bill.location_id);
                  const isOverdue = bill.status === 'Overdue';
                  return (
                    <motion.tr key={bill.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td>
                        <div className="bill-title">
                          <span 
                            className={`bill-icon bill-icon-status ${isOverdue ? 'icon-overdue' : 'icon-normal'}`}
                          >
                            {bill.is_recurring ? <Repeat2 size={18} aria-hidden="true" /> : <Receipt size={18} aria-hidden="true" />}
                          </span>
                          <span>
                            <strong className="title-main">{bill.charge_name}</strong>
                            <small className="title-sub">
                              {bill.category}
                              {bill.is_recurring && <span className="recurring-tag">• RECURRING</span>}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td>
                         <div className="location-cell">
                           <MapPin size={14} className="text-secondary" aria-hidden="true" />
                           <span className="location-name">{location?.name || 'Unassigned'}</span>
                         </div>
                      </td>
                      <td className="money money-cell">{formatCurrency(bill.amount)}</td>
                      <td>
                        <span className="date-pill date-badge">
                          <CalendarDays size={14} aria-hidden="true" />
                          {bill.date}
                        </span>
                      </td>
                      <td>
                        <select
                          value={bill.status}
                          onChange={(event) => onUpdateStatus(bill.id, event.target.value as BillStatus)}
                          className={`status-badge status-${bill.status.toLowerCase()} status-select`}
                          aria-label={`Change status for ${bill.charge_name}`}
                        >
                          <option value="Paid">PAID</option>
                          <option value="Pending">PENDING</option>
                          <option value="Overdue">OVERDUE</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-group">
                          <button
                            className="icon-button edit-button"
                            onClick={() => setEditingBill(bill)}
                            title={`Edit liability ${bill.charge_name}`}
                            aria-label={`Edit ${bill.charge_name}`}
                          >
                            <Edit size={16} aria-hidden="true" />
                          </button>
                          <button
                            className="icon-button danger"
                            disabled={deleteLoading === bill.id}
                            onClick={() => setConfirmDelete(bill.id)}
                            title={`Archive liability ${bill.charge_name}`}
                            aria-label={`Archive ${bill.charge_name}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {filteredBills.length === 0 && (
              <div className="empty-state empty-state-container">
                <TrendingUp size={48} className="empty-state-icon" aria-hidden="true" />
                <h3 className="empty-state-title">No Financial Coordinates Found</h3>
                <p className="empty-state-sub">Adjust your filters or initialize a new liability entry.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <style>{`
        .bill-matrix-page .filter-actions-box {
          display: flex;
          align-items: flex-end;
        }

        .bill-matrix-page .icon-overdue {
          background: rgba(217, 45, 32, 0.1);
          color: var(--error);
        }

        .bill-matrix-page .icon-normal {
          background: rgba(0, 113, 227, 0.1);
          color: var(--primary);
        }
      `}</style>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} maxWidth="1000px">
        <BillForm
          locations={locations}
          onSubmit={handleAddBill}
          onCancel={() => setShowModal(false)}
          submitLabel="Commit to Ledger"
        />
      </Modal>

      <AnimatePresence>
        {editingBill && (
          <BillEditForm
            bill={editingBill}
            locations={locations}
            vendors={vendors}
            onSave={handleEditBill}
            onCancel={() => setEditingBill(null)}
            loading={editLoading}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmDelete !== null}
        title="Archive Liability"
        message="Are you sure you want to archive this financial commitment? This orchestration cannot be reversed."
        confirmLabel="Archive"
        cancelLabel="Discard"
        isDangerous
        isLoading={deleteLoading !== null}
        onConfirm={() => {
          if (confirmDelete) {
            handleDeleteBill(confirmDelete)
            setConfirmDelete(null)
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

export default memo(BillManager)
