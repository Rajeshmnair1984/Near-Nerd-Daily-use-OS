import { memo, useMemo, useState } from 'react';
import { Plus, Search, Receipt, Trash2, CalendarDays, Repeat2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Bill, BillStatus, CreateBillInput } from '@/types/bill';
import { Location } from '@/types/location';
import { BillForm } from './BillForm';
import { Modal } from './ui/Modal';
import { formatCurrency } from '@/utils/currency';

interface BillManagerProps {
  bills: Bill[];
  locations: Location[];
  onUpdateStatus: (id: string, status: BillStatus) => Promise<void>;
  onAddBill: (bill: CreateBillInput) => Promise<void>;
  onDeleteBill: (id: string) => Promise<void>;
  loading?: boolean;
}

const statusOptions: Array<BillStatus | 'All'> = ['All', 'Paid', 'Pending', 'Overdue'];

function BillManager({
  bills,
  locations,
  onUpdateStatus,
  onAddBill,
  onDeleteBill,
  loading,
}: BillManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BillStatus | 'All'>('All');
  const [showModal, setShowModal] = useState(false);

  const locationById = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations]
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
        return matchesSearch && matchesStatus;
      }),
    [bills, filterStatus, locationById, searchTerm]
  );

  const handleAddBill = async (bill: CreateBillInput) => {
    await onAddBill(bill);
    setShowModal(false);
  };

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
                      <td>
                        <button
                          className="icon-button danger"
                          aria-label={`Delete ${bill.charge_name}`}
                          onClick={() => {
                            if (window.confirm('Delete this bill?')) {
                              onDeleteBill(bill.id);
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
    </div>
  );
}

export default memo(BillManager);
