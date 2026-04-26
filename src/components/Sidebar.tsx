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
  Zap,
  ZapOff,
  HelpCircle,
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
      className={`app-sidebar ${isOpen ? 'is-open' : ''}`}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '280px',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRight: '1px solid var(--border)',
        boxShadow: '20px 0 50px rgba(0, 0, 0, 0.02)',
        backdropFilter: 'blur(32px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1400,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '2.5rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', boxShadow: '0 8px 16px rgba(0, 113, 227, 0.3)' }}>
           <Cpu size={22} style={{ margin: 'auto' }} />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.04em', background: 'linear-gradient(to right, #1d1d1f, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NearNerd<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>OS</span>
        </h1>
      </div>

      {/* Identity Matrix */}
      <div style={{ margin: '0 1.25rem 2.5rem', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}><ShieldCheck size={60} /></div>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), #00c6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '1rem', boxShadow: '0 4px 12px rgba(0, 113, 227, 0.2)' }}>
          {(userName || '?')[0].toUpperCase()}
        </div>
        <div style={{ minWidth: 0, zIndex: 1 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</p>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{userRole?.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Navigation Matrix */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem' }}>
        <p style={{ padding: '0 1.25rem 0.75rem', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core Orchestration</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); onNavigate?.(); }}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  border: 'none',
                  borderRadius: '14px',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  boxShadow: isActive ? '0 10px 20px rgba(0, 113, 227, 0.15)' : 'none',
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <motion.div layoutId="active-indicator"><ChevronRight size={16} /></motion.div>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer / System Control */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.4)' }}>
        <button
          onClick={() => { setActiveView('settings'); onNavigate?.(); }}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            background: activeView === 'settings' ? 'var(--primary)' : 'white',
            color: activeView === 'settings' ? 'white' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: 800,
            fontSize: '0.85rem',
            marginBottom: '0.75rem',
            boxShadow: activeView === 'settings' ? '0 8px 16px rgba(0, 113, 227, 0.15)' : 'var(--shadow-sm)',
          }}
        >
          <Settings size={18} />
          <span>System Settings</span>
        </button>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            border: '1px solid rgba(217, 45, 32, 0.1)',
            borderRadius: '16px',
            background: 'rgba(217, 45, 32, 0.05)',
            color: 'var(--error)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: 800,
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          <LogOut size={18} />
          <span>Sever Session</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: '12px', background: isSupabaseConfigured ? 'rgba(52, 168, 83, 0.08)' : 'rgba(245, 158, 11, 0.08)', width: 'fit-content', border: '1px solid rgba(0,0,0,0.03)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSupabaseConfigured ? '#34a853' : '#f59e0b', boxShadow: isSupabaseConfigured ? '0 0 8px #34a853' : 'none' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: isSupabaseConfigured ? '#34a853' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isSupabaseConfigured ? 'Cloud Sync Online' : 'Local Sandbox'}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
