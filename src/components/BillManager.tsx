import { memo, useMemo, useState } from 'react'
import { Plus, Search, Receipt, Trash2, CalendarDays, Repeat2, Edit } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bill, BillStatus, CreateBillInput, UpdateBillInput } from '@/types/bill'
import { Location } from '@/types/location'
import { Vendor } from '@/types/vendor'
import { BillForm } from './BillForm'
import BillEditForm from './BillEditForm'
import { Modal } from './ui/Modal'
import { formatCurrency } from '@/utils/currency'

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

  const handleAddBill = async (bill: CreateBillInput) => {
    await onAddBill(bill)
    setShowModal(false)
  }

  const handleEditBill = async (updates: UpdateBillInput) => {
    if (!editingBill || !onUpdateBill) return
    setEditLoading(true)
    try {
      await onUpdateBill(editingBill.id, updates)
      setEditingBill(null)
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Bill Management</h1>
          <p>Track commitments, recurring payments, and location expenses in one focused workspace.</p>
        </div>
        <button className="button-primary" onClick={() => setShowModal(true)}>
          <Plus size={19} />
          <span>New Bill</span>
        </button>
      </header>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Bill">
        <BillForm
          locations={locations}
          onSubmit={handleAddBill}
          onCancel={() => setShowModal(false)}
          submitLabel="Save Bill"
        />
      </Modal>

      <section className="panel bill-panel">
        <div className="bill-toolbar">
          <label className="search-field">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search bills, locations, categories"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <div className="segmented-control" aria-label="Filter by status">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={filterStatus === status ? 'active' : ''}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              background: 'white',
              cursor: 'pointer',
            }}
            aria-label="Filter by location"
          >
            <option value="All">All Locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>

          <select
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              background: 'white',
              cursor: 'pointer',
            }}
            aria-label="Filter by vendor"
          >
            <option value="All">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              background: 'white',
              cursor: 'pointer',
            }}
            aria-label="Filter by category"
          >
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateRangeFrom}
            onChange={(e) => setDateRangeFrom(e.target.value)}
            placeholder="From date"
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              background: 'white',
              cursor: 'pointer',
            }}
            aria-label="Filter from date"
          />

          <input
            type="date"
            value={dateRangeTo}
            onChange={(e) => setDateRangeTo(e.target.value)}
            placeholder="To date"
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              background: 'white',
              cursor: 'pointer',
            }}
            aria-label="Filter to date"
          />

          {(filterLocation !== 'All' || filterVendor !== 'All' || filterCategory !== 'All' || dateRangeFrom || dateRangeTo) && (
            <button
              onClick={() => {
                setFilterLocation('All');
                setFilterVendor('All');
                setFilterCategory('All');
                setDateRangeFrom('');
                setDateRangeTo('');
              }}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '6px',
                background: '#f3f4f6',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#6b7280',
              }}
              aria-label="Clear filters"
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-state">Loading bills...</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Bill</th>
                  <th>Location</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => {
                  const location = locationById.get(bill.location_id);
                  return (
                    <motion.tr key={bill.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td>
                        <div className="bill-title">
                          <span className="bill-icon">
                            <Receipt size={18} />
                          </span>
                          <span>
                            <strong>{bill.charge_name}</strong>
                            <small>
                              {bill.category}
                              {bill.is_recurring && (
                                <span className="recurring-label">
                                  <Repeat2 size={12} /> Recurring
                                </span>
                              )}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td>{location?.name || 'Unassigned'}</td>
                      <td className="money">{formatCurrency(bill.amount)}</td>
                      <td>
                        <span className="date-pill">
                          <CalendarDays size={14} />
                          {bill.date}
                        </span>
                      </td>
                      <td>
                        <select
                          value={bill.status}
                          onChange={(event) => onUpdateStatus(bill.id, event.target.value as BillStatus)}
                          className={`status-badge status-${bill.status.toLowerCase()}`}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        {onUpdateBill && (
                          <button
                            className="icon-button"
                            aria-label={`Edit ${bill.charge_name}`}
                            onClick={() => setEditingBill(bill)}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#667eea' }}
                          >
                            <Edit size={17} />
                          </button>
                        )}
                        <button
                          className="icon-button danger"
                          aria-label={`Delete ${bill.charge_name}`}
                          onClick={() => {
                            if (window.confirm('Delete this bill?')) {
                              onDeleteBill(bill.id)
                            }
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {filteredBills.length === 0 && (
              <div className="empty-state">
                <Receipt size={44} />
                <p>No bills found.</p>
              </div>
            )}
          </div>
        )}
      </section>

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
    </div>
  )
}

export default memo(BillManager)
