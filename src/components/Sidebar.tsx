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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'locations', label: 'Infrastructure', icon: MapPin },
    { id: 'bills', label: 'Financial Matrix', icon: Receipt },
    { id: 'vendors', label: 'Partner Network', icon: Users },
    { id: 'calendar', label: 'Temporal View', icon: Calendar },
    { id: 'documents', label: 'Intel Vault', icon: FileText },
    { id: 'alerts', label: 'Threat Intel', icon: AlertCircle },
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
          width: 280px;
          height: 100vh;
          background: rgba(255, 255, 255, 0.8);
          border-right: 1px solid var(--border);
          box-shadow: 20px 0 50px rgba(0, 0, 0, 0.02);
          backdrop-filter: blur(32px);
          display: flex;
          flex-direction: column;
          z-index: 1400;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-brand-header {
          padding: 2.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 16px rgba(0, 113, 227, 0.3);
        }

        .brand-title {
          font-size: 1.4rem;
          font-weight: 950;
          letter-spacing: -0.04em;
          background: linear-gradient(to right, #1d1d1f, var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-title-suffix {
          color: var(--primary);
          -webkit-text-fill-color: var(--primary);
        }

        .identity-matrix {
          margin: 0 1.25rem 2.5rem;
          padding: 1.25rem;
          background: var(--bg-main);
          border-radius: 20px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }

        .identity-bg-icon {
          position: absolute;
          right: -10px;
          top: -10px;
          opacity: 0.05;
        }

        .avatar-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary), #00c6ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: white;
          fontSize: 1rem;
          box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
        }

        .user-info {
          min-width: 0;
          z-index: 1;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 800;
          color: #1d1d1f;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0 0.75rem;
        }

        .nav-section-label {
          padding: 0 1.25rem 0.75rem;
          font-size: 0.65rem;
          font-weight: 900;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .nav-items-container {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-btn {
          width: 100%;
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 0.9rem;
          text-align: left;
        }

        .nav-btn-active {
          background: var(--primary);
          color: white;
          font-weight: 800;
          box-shadow: 0 10px 20px rgba(0, 113, 227, 0.15);
        }

        .nav-btn-inactive {
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .nav-btn-inactive:hover {
          background: var(--surface-soft);
          color: var(--text-primary);
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          background: rgba(255,255,255,0.4);
        }

        .footer-btn {
          width: 100%;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 800;
          font-size: 0.85rem;
        }

        .settings-btn {
          border: 1px solid var(--border);
          border-radius: 16px;
          margin-bottom: 0.75rem;
        }

        .settings-btn-active {
          background: var(--primary);
          color: white;
          box-shadow: 0 8px 16px rgba(0, 113, 227, 0.15);
        }

        .settings-btn-inactive {
          background: white;
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .logout-btn {
          border: 1px solid rgba(217, 45, 32, 0.1);
          border-radius: 16px;
          background: rgba(217, 45, 32, 0.05);
          color: var(--error);
          margin-bottom: 1.5rem;
        }

        .status-badge-container {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          width: fit-content;
          border: 1px solid rgba(0,0,0,0.03);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-text {
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>

      {/* Brand Header */}
      <div className="sidebar-brand-header">
        <div className="brand-icon-box">
           <Cpu size={22} aria-hidden="true" />
        </div>
        <h1 className="brand-title">
          NearNerd<span className="brand-title-suffix">OS</span>
        </h1>
      </div>

      {/* Identity Matrix */}
      <section className="identity-matrix" aria-label="User identity">
        <div className="identity-bg-icon" aria-hidden="true">
          <ShieldCheck size={60} />
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
        <p className="nav-section-label">Core Orchestration</p>
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
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <motion.div layoutId="active-indicator" aria-hidden="true"><ChevronRight size={16} /></motion.div>}
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
        >
          <Settings size={18} aria-hidden="true" />
          <span>System Settings</span>
        </button>

        <button
          onClick={onLogout}
          className="footer-btn logout-btn"
          aria-label="Logout of system"
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Sever Session</span>
        </button>

        <div 
          className="status-badge-container"
          style={{ background: isSupabaseConfigured ? 'rgba(52, 168, 83, 0.08)' : 'rgba(245, 158, 11, 0.08)' }}
          title={isSupabaseConfigured ? "Connected to Cloud Sync" : "Running in Local Sandbox"}
        >
          <div 
            className="status-dot"
            style={{ 
              background: isSupabaseConfigured ? '#34a853' : '#f59e0b', 
              boxShadow: isSupabaseConfigured ? '0 0 8px #34a853' : 'none' 
            }} 
          />
          <span className="status-text" style={{ color: isSupabaseConfigured ? '#34a853' : '#f59e0b' }}>
            {isSupabaseConfigured ? 'Cloud Sync Online' : 'Local Sandbox'}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
