import {
  LayoutDashboard,
  MapPin,
  Receipt,
  Users,
  Calendar,
  FileText,
  AlertCircle,
  Settings,
  Globe,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

function Sidebar({
  activeView,
  setActiveView,
  isOpen = false,
  onNavigate,
  userName,
  userRole,
  onLogout,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'locations', label: 'Infrastructure', icon: MapPin },
    { id: 'bills', label: 'Financial Matrix', icon: Receipt },
    { id: 'vendors', label: 'Partner Network', icon: Users },
    { id: 'calendar', label: 'Temporal Grid', icon: Calendar },
    { id: 'documents', label: 'Intel Vault', icon: FileText },
    { id: 'alerts', label: 'Threat Intelligence', icon: AlertCircle },
  ];

  if (userRole === 'SUPER_ADMIN' || userRole === 'super_admin') {
    menuItems.unshift({ id: 'super-admin', label: 'Global Console', icon: Globe });
  }

  return (
    <aside
      className={`app-sidebar-premium ${isOpen ? 'is-open' : ''}`}
      aria-label="Main Navigation"
    >
      <style>{`
        .app-sidebar-premium {
          position: fixed;
          left: 0;
          top: 0;
          width: 320px;
          height: 100vh;
          background: var(--bg-card);
          border-right: 1px solid var(--border-strong);
          box-shadow: 40px 0 100px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          display: flex;
          flex-direction: column;
          z-index: 1400;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-brand-header {
          padding: 3.5rem 2.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .brand-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 12px 24px rgba(0, 113, 227, 0.3);
        }

        .brand-title {
          font-size: 1.85rem;
          font-weight: 950;
          letter-spacing: -0.05em;
          color: var(--text-primary);
        }

        .brand-title-suffix {
          color: var(--primary);
        }

        .identity-matrix {
          margin: 0 1.5rem 3rem;
          padding: 1.5rem;
          background: var(--surface);
          border-radius: 24px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          position: relative;
          overflow: hidden;
          transition: var(--transition);
        }

        .identity-matrix:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        .identity-bg-icon {
          position: absolute;
          right: -15px;
          bottom: -15px;
          opacity: 0.03;
          color: var(--primary);
        }

        .avatar-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--primary) 0%, #00c6ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 950;
          color: white;
          font-size: 1.25rem;
          box-shadow: 0 8px 16px rgba(0, 113, 227, 0.2);
          flex-shrink: 0;
        }

        .user-info {
          min-width: 0;
          z-index: 1;
        }

        .user-name {
          font-size: 1.05rem;
          font-weight: 900;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.02em;
        }

        .user-role {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.2rem;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0 1rem;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .nav-section-label {
          padding: 0 1.5rem 1rem;
          font-size: 0.75rem;
          font-weight: 950;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          opacity: 0.6;
        }

        .nav-items-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-btn {
          width: 100%;
          padding: 1.1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 1rem;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .nav-btn-active {
          background: var(--primary);
          color: white;
          font-weight: 900;
          box-shadow: 0 15px 30px rgba(0, 113, 227, 0.2);
        }

        .nav-btn-inactive {
          background: transparent;
          color: var(--text-secondary);
          font-weight: 700;
        }

        .nav-btn-inactive:hover {
          background: var(--surface-soft);
          color: var(--text-primary);
          transform: translateX(8px);
        }

        .sidebar-footer {
          padding: 2rem;
          border-top: 1px solid var(--border);
          background: var(--surface-soft);
          backdrop-filter: blur(20px);
        }

        .footer-btn {
          width: 100%;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: var(--transition);
          font-weight: 900;
          font-size: 0.95rem;
          border: 1px solid transparent;
        }

        .settings-btn {
          border-radius: 18px;
          margin-bottom: 1rem;
        }

        .settings-btn-active {
          background: var(--primary);
          color: white;
          box-shadow: 0 10px 20px rgba(0, 113, 227, 0.2);
        }

        .settings-btn-inactive {
          background: var(--bg-card);
          color: var(--text-primary);
          border-color: var(--border);
          box-shadow: var(--shadow-sm);
        }

        .settings-btn-inactive:hover {
           border-color: var(--primary);
           background: var(--surface);
        }

        .logout-btn {
          border-radius: 18px;
          background: rgba(217, 45, 32, 0.05);
          color: var(--error);
          margin-bottom: 2rem;
          border: 1px solid rgba(217, 45, 32, 0.1);
        }

        .logout-btn:hover {
          background: var(--error);
          color: white;
          box-shadow: 0 10px 20px rgba(217, 45, 32, 0.2);
        }

        .status-badge-container {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.75rem 1rem;
          border-radius: 14px;
          width: 100%;
          border: 1px solid var(--border);
          background: var(--bg-card);
          transition: var(--transition);
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: relative;
        }

        .status-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: inherit;
          opacity: 0.4;
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 0.75rem;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.4; }
          70% { transform: scale(2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>

      {/* Brand Header */}
      <div className="sidebar-brand-header">
        <div className="brand-icon-box" aria-hidden="true">
           <Cpu size={28} />
        </div>
        <h1 className="brand-title">
          NearNerd<span className="brand-title-suffix">OS</span>
        </h1>
      </div>

      {/* Identity Matrix */}
      <section className="identity-matrix" aria-label="Authenticated identity session">
        <div className="identity-bg-icon" aria-hidden="true">
          <ShieldCheck size={80} />
        </div>
        <div className="avatar-box" aria-hidden="true">
          {(userName || '?')[0].toUpperCase()}
        </div>
        <div className="user-info">
          <p className="user-name">{userName}</p>
          <p className="user-role">{userRole?.replace('_', ' ')}</p>
        </div>
      </section>

      {/* Navigation Matrix */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">Neural Orchestration</p>
        <div className="nav-items-container" role="menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => { setActiveView(item.id); onNavigate?.(); }}
                className={`nav-btn ${isActive ? 'nav-btn-active' : 'nav-btn-inactive'}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
              >
                <Icon size={22} strokeWidth={isActive ? 3 : 2} aria-hidden="true" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator" 
                    aria-hidden="true"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <ChevronRight size={18} />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer / System Control */}
      <div className="sidebar-footer">
        <button
          onClick={() => { setActiveView('settings'); onNavigate?.(); }}
          className={`footer-btn settings-btn ${activeView === 'settings' ? 'settings-btn-active' : 'settings-btn-inactive'}`}
          aria-current={activeView === 'settings' ? 'page' : undefined}
          aria-label="Access global system settings"
        >
          <Settings size={20} aria-hidden="true" />
          <span>System Parameters</span>
        </button>

        <button
          onClick={onLogout}
          className="footer-btn logout-btn"
          aria-label="Terminate secure session and logout"
        >
          <LogOut size={20} aria-hidden="true" />
          <span>Terminate Session</span>
        </button>

        <div 
          className="status-badge-container"
          role="status"
          aria-label={isSupabaseConfigured ? "System Status: Cloud Synchronization Active" : "System Status: Local Sandbox Mode"}
        >
          <div 
            className="status-dot"
            style={{ 
              background: isSupabaseConfigured ? '#10b981' : '#f59e0b', 
              boxShadow: isSupabaseConfigured ? '0 0 12px rgba(16, 185, 129, 0.4)' : '0 0 12px rgba(245, 158, 11, 0.4)' 
            }} 
            aria-hidden="true"
          />
          <span className="status-text" style={{ color: isSupabaseConfigured ? '#10b981' : '#f59e0b' }}>
            {isSupabaseConfigured ? 'Cloud Sync Online' : 'Local Sandbox'}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
