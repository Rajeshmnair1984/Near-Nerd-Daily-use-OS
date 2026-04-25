import {
  LayoutDashboard,
  MapPin,
  Receipt,
  Users,
  Calendar,
  FileText,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen?: boolean;
  onNavigate?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'bills', label: 'Bills', icon: Receipt },
  { id: 'vendors', label: 'Vendors', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'documents', label: 'Documents', icon: FileText },
];

function Sidebar({ activeView, setActiveView, isOpen = false, onNavigate }: SidebarProps) {
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
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--primary), #818cf8)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          NearNerd
        </h1>
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
                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
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
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            fontWeight: 500,
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
