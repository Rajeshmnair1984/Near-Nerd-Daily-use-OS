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
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  userName?: string;
  userRole?: string;
}

function Sidebar({
  activeView,
  setActiveView,
  isOpen = false,
  onNavigate,
  userName,
  userRole,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: AlertCircle },
  ];

  if (userRole === 'SUPER_ADMIN' || userRole === 'super_admin') {
    menuItems.unshift({ id: 'super-admin', label: 'Global Console', icon: Globe });
  }

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'is-open' : ''}`}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '260px',
        height: '100vh',
        background: 'var(--bg-sidebar)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '0 1.5rem',
          marginBottom: '1.25rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--primary), #111827)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          NearNerd
        </h1>
      </div>

      <div
        style={{
          margin: '0 1.5rem 1.5rem',
          padding: '0.95rem',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          background: 'rgba(255, 255, 255, 0.72)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary), #64d2ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {(userName || '?').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {userName}
          </p>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {userRole}
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                onNavigate?.();
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: 'none',
                background: isActive ? 'rgba(0, 113, 227, 0.1)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Footer */}
      <div
        style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => {
            setActiveView('settings');
            onNavigate?.();
          }}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            background: activeView === 'settings' ? 'rgba(0, 113, 227, 0.1)' : 'rgba(255, 255, 255, 0.72)',
            color: activeView === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            fontWeight: activeView === 'settings' ? 700 : 500,
          }}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
