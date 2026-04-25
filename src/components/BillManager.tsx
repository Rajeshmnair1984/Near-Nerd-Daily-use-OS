import { useState, memo } from 'react';
import { Edit2, Plus, Search, Receipt, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from './ui/Modal';
import { BillForm } from './BillForm';
import { Button } from './ui/Button';
import { Bill, CreateBillInput, UpdateBillInput } from '@/types/bill';
import { Location } from '@/types/location';
import { useToast } from '@/context/ToastContext';

interface BillManagerProps {
  bills: Bill[];
  locations: Location[];
  onAddBill: (bill: CreateBillInput) => Promise<void>;
  onUpdateBill: (id: string, bill: UpdateBillInput) => Promise<void>;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDeleteBill: (id: string) => Promise<void>;
  loading?: boolean;
}

function BillManager({
  bills,
  locations,
  onAddBill,
  onUpdateBill,
  onUpdateStatus,
  onDeleteBill,
  loading,
}: BillManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { addToast } = useToast();

  const filteredBills = bills.filter((bill) => {
    const location = locations.find((l) => l.id === bill.location_id);
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch = [
      bill.charge_name,
      bill.category,
      location?.name,
    ].some((value) => value?.toLowerCase().includes(normalizedSearch));
    const matchesStatus = filterStatus === 'All' || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteConfirm = async (id: string) => {
    try {
      await onDeleteBill(id);
      setDeleteConfirm(null);
    } catch (err) {
      addToast('Failed to delete bill', 'error');
    }
  };

  const handleEditSubmit = async (bill: CreateBillInput) => {
    if (!editingBill) return;
    await onUpdateBill(editingBill.id, bill);
    setEditingBill(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Bill Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track and manage all your business expenses and recurring payments.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={20} />}
          onClick={() => setShowModal(true)}
        >
          New Bill
        </Button>
      </header>

      {/* Add Bill Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Bill"
      >
        <BillForm
          locations={locations}
          onCancel={() => setShowModal(false)}
          onSubmit={async (bill) => {
            await onAddBill(bill);
            setShowModal(false);
          }}
        />
      </Modal>

      {/* Edit Bill Modal */}
      <Modal
        isOpen={editingBill !== null}
        onClose={() => setEditingBill(null)}
        title="Edit Bill"
      >
        {editingBill && (
          <BillForm
            locations={locations}
            initialValues={editingBill}
            submitLabel="Update Bill"
            onCancel={() => setEditingBill(null)}
            onSubmit={handleEditSubmit}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Bill"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Are you sure you want to delete this bill? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirm(null)}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDeleteConfirm(deleteConfirm)}
            style={{ flex: 1 }}
          >
            Delete
          </Button>
        </div>
      </Modal>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="bill-toolbar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.03)',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border)',
            }}
          >
            <Search size={20} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search bills, locations, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
          <div className="status-filter-group" style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  background:
                    filterStatus === status
                      ? 'var(--primary)'
                      : 'rgba(255,255,255,0.03)',
                  color:
                    filterStatus === status
                      ? 'white'
                      : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition)',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <Receipt size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>Loading bills...</p>
          </div>
        ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '1rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  BILL DETAILS
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '1rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  LOCATION
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '1rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  AMOUNT
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '1rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  DUE DATE
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '1rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '1rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredBills.map((bill) => {
                  const location = locations.find((l) => l.id === bill.location_id);
                  return (
                    <motion.tr
                      key={bill.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'var(--transition)',
                      }}
                    >
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{bill.charge_name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {bill.category}
                          </p>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '1.25rem 1rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {location?.name || 'Unknown'}
                      </td>
                      <td
                        style={{
                          padding: '1.25rem 1rem',
                          fontWeight: 700,
                        }}
                      >
                        ${parseFloat(String(bill.amount)).toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: '1.25rem 1rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {bill.date}
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <select
                          value={bill.status}
                          onChange={(e) =>
                            onUpdateStatus(bill.id, e.target.value)
                          }
                          className={`status-badge status-${bill.status.toLowerCase()}`}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                      <td
                        style={{
                          padding: '1.25rem 1rem',
                          textAlign: 'right',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            aria-label={`Edit ${bill.charge_name}`}
                            title="Edit bill"
                            onClick={() => setEditingBill(bill)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              transition: 'var(--transition)',
                            }}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            aria-label={`Delete ${bill.charge_name}`}
                            title="Delete bill"
                            onClick={() => setDeleteConfirm(bill.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--error)',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              transition: 'var(--transition)',
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredBills.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Receipt size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>No bills found matching your criteria.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default memo(BillManager);
