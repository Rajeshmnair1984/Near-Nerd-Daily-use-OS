import React, { useState, memo } from 'react';
import { 
  Plus, 
  Search, 
  Receipt, 
  Trash2, 
  Edit2,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BillManager = ({ bills, locations, onUpdateStatus, onAddBill, onDeleteBill }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [newBill, setNewBill] = useState({
    charge_name: '',
    amount: '',
    date: '',
    location_id: '',
    category: 'Rent',
    status: 'Pending',
    is_recurring: false
  });

  const filteredBills = bills.filter(bill => {
    const location = locations.find(l => l.id === bill.location_id);
    const matchesSearch = bill.charge_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddBill({
        ...newBill,
        amount: parseFloat(newBill.amount)
      });
      setShowModal(false);
      setNewBill({ charge_name: '', amount: '', date: '', location_id: '', category: 'Rent', status: 'Pending', is_recurring: false });
    } catch (err) {
      alert('Failed to add bill: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Bill Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage all your business expenses and recurring payments.</p>
        </div>
        <button className="button-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          <span>New Bill</span>
        </button>
      </header>

      {/* New Bill Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}
            >
              <button 
                onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              <h2 style={{ marginBottom: '1.5rem' }}>Add New Bill</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Bill Name</label>
                  <input 
                    required
                    className="glass-card"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', border: '1px solid var(--border)', color: 'white' }}
                    value={newBill.charge_name}
                    onChange={e => setNewBill({...newBill, charge_name: e.target.value})}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Amount ($)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      className="glass-card"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', border: '1px solid var(--border)', color: 'white' }}
                      value={newBill.amount}
                      onChange={e => setNewBill({...newBill, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Due Date</label>
                    <input 
                      required
                      type="date"
                      className="glass-card"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', border: '1px solid var(--border)', color: 'white' }}
                      value={newBill.date}
                      onChange={e => setNewBill({...newBill, date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Location</label>
                  <select 
                    required
                    className="glass-card"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', border: '1px solid var(--border)', color: 'white' }}
                    value={newBill.location_id}
                    onChange={e => setNewBill({...newBill, location_id: e.target.value})}
                  >
                    <option value="">Select Location</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="is_recurring"
                    checked={newBill.is_recurring}
                    onChange={e => setNewBill({...newBill, is_recurring: e.target.checked})}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="is_recurring" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Monthly Recurring Bill</label>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="glass-card" style={{ flex: 1, padding: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" className="button-primary" style={{ flex: 1 }}>Save Bill</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: 'rgba(255,255,255,0.03)',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border)'
          }}>
            <Search size={20} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search bills, locations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'white', 
                outline: 'none',
                width: '100%' 
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Paid', 'Pending', 'Overdue'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  background: filterStatus === status ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                  color: filterStatus === status ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition)'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>BILL DETAILS</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>LOCATION</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>AMOUNT</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>DUE DATE</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>STATUS</th>
                <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredBills.map((bill) => {
                  const location = locations.find(l => l.id === bill.location_id);
                  return (
                    <motion.tr 
                      key={bill.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                    >
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{bill.charge_name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {bill.category} {bill.is_recurring && '• Recurring'}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>
                        {location?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 700 }}>
                        ${parseFloat(bill.amount).toLocaleString()}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>
                        {bill.date}
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <select 
                          value={bill.status}
                          onChange={(e) => onUpdateStatus(bill.id, e.target.value)}
                          className={`status-badge status-${bill.status.toLowerCase()}`}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', fontWeight: 600 }}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button 
                            onClick={() => {
                              if(window.confirm('Delete this bill?')) onDeleteBill(bill.id);
                            }}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              color: 'var(--status-overdue)', 
                              cursor: 'pointer',
                              padding: '0.5rem',
                              opacity: 0.6,
                              transition: 'var(--transition)'
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
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <Receipt size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>No bills found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(BillManager);
