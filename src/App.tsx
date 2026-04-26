import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BillManager from './components/BillManager';
import CalendarView from './components/CalendarView';
import VendorManager from './components/VendorManager';
import SettingsView from './components/SettingsView';
import LocationManager from './components/LocationManager';
import { dataService } from './services/dataService';
import { Bell, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bill, CreateBillInput, UpdateBillInput } from '@/types/bill';
import { CreateLocationInput, Location } from '@/types/location';
import { CreateVendorInput, Vendor } from '@/types/vendor';
import { DashboardStats } from '@/types/common';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

function AppContent() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [bills, setBills] = useState<Bill[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalPaid: 0, totalPending: 0, totalOverdue: 0, overdueCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, setUser } = useUser();
  const { addToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedBills, loadedLocations, loadedVendors] = await Promise.all([
        dataService.getBills(),
        dataService.getLocations(),
        dataService.getVendors(),
      ]);
      setBills(loadedBills);
      setLocations(loadedLocations);
      setVendors(loadedVendors);
      setStats(dataService.getDashboardStats(loadedBills));
    } catch (err) {
      console.warn('Starting with an empty workspace because data could not be loaded.', err);
      setBills([]);
      setLocations([]);
      setVendors([]);
      setStats(dataService.getDashboardStats([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddBill = async (newBill: CreateBillInput) => {
    try {
      const added = await dataService.addBill(newBill);
      const updatedBills = [...bills, added];
      setBills(updatedBills);
      setStats(dataService.getDashboardStats(updatedBills));
      addToast('Bill added successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add bill';
      addToast(errorMessage, 'error');
    }
  };

  const handleUpdateBill = async (id: string, billData: UpdateBillInput) => {
    try {
      const updated = await dataService.updateBill(id, billData);
      const updatedBills = bills.map((b) => (b.id === id ? updated : b));
      setBills(updatedBills);
      setStats(dataService.getDashboardStats(updatedBills));
      addToast('Bill updated successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bill';
      addToast(errorMessage, 'error');
      throw err;
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const updated = await dataService.updateBillStatus(id, status);
      const updatedBills = bills.map((b) => (b.id === id ? updated : b));
      setBills(updatedBills);
      setStats(dataService.getDashboardStats(updatedBills));
      addToast('Bill status updated', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bill';
      addToast(errorMessage, 'error');
    }
  };

  const handleDeleteBill = async (id: string) => {
    try {
      await dataService.deleteBill(id);
      const updatedBills = bills.filter((b) => b.id !== id);
      setBills(updatedBills);
      setStats(dataService.getDashboardStats(updatedBills));
      addToast('Bill deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bill';
      addToast(errorMessage, 'error');
    }
  };

  const handleAddLocation = async (newLocation: CreateLocationInput) => {
    try {
      const added = await dataService.addLocation(newLocation);
      setLocations((current) => [...current, added].sort((a, b) => a.name.localeCompare(b.name)));
      addToast('Location added successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add location';
      addToast(errorMessage, 'error');
      throw err;
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await dataService.deleteLocation(id);
      setLocations((current) => current.filter((location) => location.id !== id));
      addToast('Location deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete location';
      addToast(errorMessage, 'error');
    }
  };

  const handleAddVendor = async (newVendor: CreateVendorInput) => {
    try {
      const added = await dataService.addVendor(newVendor);
      setVendors((current) => [...current, added].sort((a, b) => a.name.localeCompare(b.name)));
      addToast('Vendor added successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add vendor';
      addToast(errorMessage, 'error');
      throw err;
    }
  };

  const handleDeleteVendor = async (id: string) => {
    try {
      await dataService.deleteVendor(id);
      setVendors((current) => current.filter((vendor) => vendor.id !== id));
      addToast('Vendor deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vendor';
      addToast(errorMessage, 'error');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard stats={stats} bills={bills} loading={loading} />;
      case 'bills':
        return (
          <BillManager
            bills={bills}
            locations={locations}
            onAddBill={handleAddBill}
            onUpdateBill={handleUpdateBill}
            onUpdateStatus={handleUpdateStatus}
            onDeleteBill={handleDeleteBill}
            loading={loading}
          />
        );
      case 'locations':
        return (
          <LocationManager
            locations={locations}
            onAddLocation={handleAddLocation}
            onDeleteLocation={handleDeleteLocation}
            loading={loading}
          />
        );
      case 'calendar':
        return <CalendarView bills={bills} loading={loading} />;
      case 'vendors':
        return (
          <VendorManager
            vendors={vendors}
            onAddVendor={handleAddVendor}
            onDeleteVendor={handleDeleteVendor}
            loading={loading}
          />
        );
      case 'settings':
        return (
          <SettingsView
            user={user}
            onUpdateUser={setUser}
            billsCount={bills.length}
            locationsCount={locations.length}
            vendorsCount={vendors.length}
          />
        );
      default:
        return (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2 style={{ opacity: 0.5 }}>{activeView.charAt(0).toUpperCase() + activeView.slice(1)} View Coming Soon</h2>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        onNavigate={() => setIsSidebarOpen(false)}
      />
      {isSidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="app-main" style={{ flex: 1, minHeight: '100vh', position: 'relative' }}>
        {/* Top Header Bar */}
        <header
          className="app-topbar"
          style={{
            height: '70px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(22px)',
            zIndex: 10,
          }}
        >
          <button
            className="mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} color="var(--text-secondary)" />
              {stats.overdueCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--status-overdue)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                  }}
                >
                  {stats.overdueCount}
                </span>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderLeft: '1px solid var(--border)',
                paddingLeft: '1.5rem',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.role}</p>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary), #64d2ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {user?.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AppContent;
