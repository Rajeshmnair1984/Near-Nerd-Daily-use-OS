import { useCallback, useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import BillManager from './components/BillManager'
import CalendarView from './components/CalendarView'
import VendorManager from './components/VendorManager'
import SettingsView from './components/SettingsView'
import LocationManager from './components/LocationManager'
import DocumentManager from './components/DocumentManager'
import AlertsManager from './components/AlertsManager'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import LoginView from './components/LoginView'
import { dataService } from './services/dataService'
import { Bell, Menu, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bill, CreateBillInput, UpdateBillInput } from '@/types/bill'
import { CreateDocumentInput, DocumentRecord } from '@/types/document'
import { CreateLocationInput, Location } from '@/types/location'
import { CreateVendorInput, Vendor } from '@/types/vendor'
import { DashboardStats } from '@/types/common'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'
import { UserProfile } from '@/services/AuthService'

function AppContent() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [bills, setBills] = useState<Bill[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalPaid: 0, totalPending: 0, totalOverdue: 0, overdueCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user } = useUser()
  const { addToast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [billsResult, locationsResult, vendorsResult, documentsResult] = await Promise.allSettled([
        dataService.getBills(),
        dataService.getLocations(),
        dataService.getVendors(),
        dataService.getDocuments(),
      ]);
      const loadedBills = billsResult.status === 'fulfilled' ? billsResult.value : [];
      const loadedLocations = locationsResult.status === 'fulfilled' ? locationsResult.value : [];
      const loadedVendors = vendorsResult.status === 'fulfilled' ? vendorsResult.value : [];
      const loadedDocuments = documentsResult.status === 'fulfilled' ? documentsResult.value : [];

      [billsResult, locationsResult, vendorsResult, documentsResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          const resource = ['bills', 'locations', 'vendors', 'documents'][index];
          console.warn(`Could not load ${resource}; starting that section empty.`, result.reason);
        }
      });

      setBills(loadedBills);
      setLocations(loadedLocations);
      setVendors(loadedVendors);
      setDocuments(loadedDocuments);
      setStats(dataService.getDashboardStats(loadedBills));
    } catch (err) {
      console.warn('Starting with an empty workspace because data could not be loaded.', err);
      setBills([]);
      setLocations([]);
      setVendors([]);
      setDocuments([]);
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

  const handleUpdateLocation = async (id: string, locationData: CreateLocationInput) => {
    try {
      const updated = await dataService.updateLocation(id, locationData);
      setLocations((current) => current.map((location) => (location.id === id ? updated : location)).sort((a, b) => a.name.localeCompare(b.name)));
      addToast('Location updated successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
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

  const handleUpdateVendor = async (id: string, vendorData: CreateVendorInput) => {
    try {
      const updated = await dataService.updateVendor(id, vendorData);
      setVendors((current) => current.map((vendor) => (vendor.id === id ? updated : vendor)).sort((a, b) => a.name.localeCompare(b.name)));
      addToast('Vendor updated successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vendor';
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

  const handleAddDocument = async (newDocument: CreateDocumentInput) => {
    try {
      const added = await dataService.addDocument(newDocument);
      setDocuments((current) => [added, ...current]);
      addToast('Document added successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add document';
      addToast(errorMessage, 'error');
      throw err;
    }
  };

  const handleUpdateDocument = async (id: string, documentData: CreateDocumentInput) => {
    try {
      const updated = await dataService.updateDocument(id, documentData);
      setDocuments((current) => current.map((document) => (document.id === id ? updated : document)));
      addToast('Document updated successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
      addToast(errorMessage, 'error');
      throw err;
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await dataService.deleteDocument(id);
      setDocuments((current) => current.filter((document) => document.id !== id));
      addToast('Document deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
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
            onUpdateLocation={handleUpdateLocation}
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
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
            loading={loading}
          />
        );
      case 'documents':
        return (
          <DocumentManager
            documents={documents}
            onAddDocument={handleAddDocument}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
            loading={loading}
          />
        );
      case 'alerts':
        return (
          <AlertsManager
            bills={bills}
            documents={documents}
            loading={loading}
          />
        );
      case 'settings':
        return (
          <SettingsView
            user={user}
            billsCount={bills.length}
            locationsCount={locations.length}
            vendorsCount={vendors.length}
          />
        );
      case 'super-admin':
        return <SuperAdminDashboard />;
      default:
        return (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2 style={{ opacity: 0.5 }}>View Coming Soon</h2>
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
        userRole={user?.role}
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
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.fullName || user?.email}</p>
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
                {(user?.fullName || user?.email || '?').split(' ').map(n => n[0]).join('').toUpperCase()}
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

function App() {
  const { isAuthenticated, isLoading } = useUser()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => window.location.reload()} />
  }

  return <AppContent />
}

export default App
