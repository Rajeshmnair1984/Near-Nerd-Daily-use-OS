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
import { Bell, Menu, LogOut, Sun, Moon, Search, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bill, CreateBillInput, UpdateBillInput } from '@/types/bill'
import { CreateDocumentInput, DocumentRecord } from '@/types/document'
import { CreateLocationInput, Location } from '@/types/location'
import { CreateVendorInput, Vendor } from '@/types/vendor'
import { DashboardStats } from '@/types/common'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'

function AppContent() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [bills, setBills] = useState<Bill[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalPaid: 0, totalPending: 0, totalOverdue: 0, overdueCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { user, updateUser, logout } = useUser()
  const { addToast } = useToast()

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

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
    queueMicrotask(() => {
      void loadData();
    });
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
            onUpdateUser={updateUser}
            billsCount={bills.length}
            locationsCount={locations.length}
            vendorsCount={vendors.length}
          />
        );
      case 'super-admin':
        if (user?.role !== 'super_admin') {
          return (
            <div className="unauthorized-view" role="alert">
              <h2 className="unauthorized-title">Unauthorized Access</h2>
              <p className="unauthorized-sub">System security parameters restrict your access to this console.</p>
            </div>
          );
        }
        return <SuperAdminDashboard />;
      default:
        return (
          <div className="coming-soon-view">
            <h2 className="coming-soon-title">Module Under Construction</h2>
          </div>
        );
    }
  };

  return (
    <div className="app-container-premium">
      <style>{`
        .app-container-premium {
          display: flex;
          min-height: 100vh;
          background: var(--bg-main);
        }

        .unauthorized-view, .coming-soon-view {
          padding: 8rem 4rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .unauthorized-title, .coming-soon-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          background: linear-gradient(to right, var(--error), var(--text-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .unauthorized-sub {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 400px;
        }

        .app-main-content {
          flex: 1;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .app-topbar {
          height: 80px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          position: sticky;
          top: 0;
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          z-index: 100;
          background: var(--bg-sidebar);
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .quick-add-btn {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary);
          color: white;
          box-shadow: 0 8px 20px rgba(0, 113, 227, 0.25);
          transition: var(--transition);
          border: none;
          cursor: pointer;
        }

        .quick-add-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 24px rgba(0, 113, 227, 0.35);
        }

        .topbar-search-container {
          width: 100%;
          max-width: 450px;
          display: flex;
          align-items: center;
          position: relative;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-toggle-btn {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          background: var(--surface);
          transition: var(--transition);
          cursor: pointer;
        }

        .theme-toggle-btn:hover {
          background: var(--surface-soft);
          color: var(--primary);
          border-color: var(--primary);
        }

        .notification-bell-btn {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          background: var(--surface);
          position: relative;
          transition: var(--transition);
          cursor: pointer;
        }

        .notification-bell-btn:hover {
          background: var(--surface-soft);
          color: var(--primary);
          border-color: var(--primary);
        }

        .notification-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: var(--error);
          color: white;
          font-size: 11px;
          font-weight: 900;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--surface);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .logout-btn-premium {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 1.25rem;
          border-radius: 14px;
          border: 1px solid rgba(217, 45, 32, 0.1);
          background: rgba(217, 45, 32, 0.05);
          color: var(--error);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 800;
          transition: var(--transition);
        }

        .logout-btn-premium:hover {
          background: var(--error);
          color: white;
          box-shadow: 0 8px 20px rgba(217, 45, 32, 0.2);
        }

        .app-loading-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg-main);
        }

        .app-loading-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .loading-pulse {
          width: 64px;
          height: 64px;
          background: var(--primary);
          border-radius: 20px;
          animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.4); }
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 40px 20px rgba(0, 113, 227, 0); }
          100% { transform: scale(0.9); opacity: 0.5; box-shadow: 0 0 0 0 rgba(0, 113, 227, 0); }
        }

        .loading-text {
          color: var(--text-secondary);
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 0.85rem;
        }
      `}</style>

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        onNavigate={() => setIsSidebarOpen(false)}
        userName={user?.fullName || user?.email || ''}
        userRole={user?.role}
        onLogout={logout}
      />
      
      {isSidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="app-main-content">
        <header className="app-topbar" role="banner">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              aria-label="Open navigation menu"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} aria-hidden="true" />
            </button>

            <button
              aria-label="Initialize new liability entry"
              className="quick-add-btn"
              onClick={() => {
                setActiveView('bills');
                addToast('Accessing Financial Matrix...', 'info');
              }}
            >
              <Plus size={24} strokeWidth={3} aria-hidden="true" />
            </button>
          </div>

          <div className="topbar-search-container">
            <div className="search-field" style={{ width: '100%', margin: 0 }}>
              <Search size={20} aria-hidden="true" />
              <label htmlFor="global-app-search" className="sr-only">Search systems</label>
              <input 
                id="global-app-search"
                type="text" 
                placeholder="Synchronize search query..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="topbar-right">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label={theme === 'light' ? 'Enable dark mode' : 'Enable light mode'}
            >
              {theme === 'light' ? <Moon size={22} aria-hidden="true" /> : <Sun size={22} aria-hidden="true" />}
            </button>

            <button 
              className="notification-bell-btn"
              aria-label={`${stats.overdueCount} system alerts requiring attention`}
              onClick={() => setActiveView('alerts')}
            >
              <Bell size={22} aria-hidden="true" />
              {stats.overdueCount > 0 && (
                <span className="notification-badge">
                  {stats.overdueCount}
                </span>
              )}
            </button>
            
            <button
              onClick={logout}
              className="logout-btn-premium"
              aria-label="Terminate secure session"
            >
              <LogOut size={18} aria-hidden="true" />
              <span>TERMINATE</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
      <div className="app-loading-screen" aria-busy="true" aria-live="polite">
        <div className="app-loading-content">
          <div className="loading-pulse" aria-hidden="true" />
          <p className="loading-text">Synchronizing Global Systems...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => {}} />
  }

  return <AppContent />
}

export default App
