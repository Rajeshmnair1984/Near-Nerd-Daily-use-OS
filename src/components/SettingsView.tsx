import { FormEvent, memo, useEffect, useState } from 'react';
import { Database, ShieldCheck, SlidersHorizontal, UserRound, Zap, Bell, Fingerprint, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import { UserProfile } from '@/services/AuthService';
import { DEFAULT_CURRENCY } from '@/utils/currency';
import { motion } from 'framer-motion';

interface SettingsViewProps {
  user: UserProfile | null;
  onUpdateUser: (updates: Partial<UserProfile>) => Promise<void>;
  billsCount: number;
  locationsCount: number;
  vendorsCount: number;
}

function SettingsView({
  user,
  onUpdateUser,
  billsCount,
  locationsCount,
  vendorsCount,
}: SettingsViewProps) {
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [workspaceName, setWorkspaceName] = useState('NearNerd Operations');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [savedMessage, setSavedMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.fullName || '');
    setEmail(user?.email || '');
    setRole(user?.role || '');
  }, [user]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSavedMessage('');

    try {
      await onUpdateUser({
        fullName: name.trim() || null,
      });
      setSavedMessage('Settings saved successfully');
      window.setTimeout(() => setSavedMessage(''), 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save settings';
      setSavedMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-shell settings-premium-page">
      <style>{`
        .settings-premium-page .page-hero {
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-soft) 100%);
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          margin-bottom: 2.5rem;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 2rem;
        }

        .settings-premium-page .hero-content h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          background: linear-gradient(to right, var(--text-primary), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .settings-premium-page .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .settings-premium-page .settings-card {
          background: var(--bg-card);
          border-radius: 24px;
          border: 1px solid var(--border);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .settings-premium-page .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .settings-premium-page .card-header h2 {
          font-size: 1.1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .settings-premium-page .data-chip {
          padding: 1.25rem;
          background: var(--surface-soft);
          border-radius: 16px;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .settings-premium-page .data-chip span {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .settings-premium-page .data-chip strong {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--primary);
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">System Configuration</p>
          <h1>Control Center</h1>
          <p>Orchestrate your identity, workspace parameters, and system-wide operational health.</p>
        </div>
        {savedMessage && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ padding: '0.75rem 1.5rem', background: 'rgba(52, 168, 83, 0.1)', color: '#34a853', borderRadius: '100px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(52, 168, 83, 0.2)' }}
          >
            <CheckCircle2 size={16} /> {savedMessage}
          </motion.div>
        )}
      </header>

      <div className="settings-grid">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="settings-card">
          <div className="card-header">
            <div style={{ padding: '0.5rem', background: 'rgba(0, 113, 227, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
              <Fingerprint size={20} />
            </div>
            <h2>Identity Protocol</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">FULL IDENTITY NAME</label>
              <input
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Alex Rivers"
              />
            </div>
            <div className="form-group">
              <label className="form-label">COMMUNICATION ENDPOINT (EMAIL)</label>
              <input
                className="form-input"
                type="email"
                value={email}
                readOnly
                style={{ background: 'var(--surface-soft)', cursor: 'not-allowed' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">AUTHORIZATION ROLE</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.25rem', background: 'var(--surface-soft)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                 <ShieldCheck size={18} className="text-primary" />
                 <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{role || 'Standard Entity'}</span>
              </div>
            </div>
            <button className="button-primary" type="submit" disabled={isSaving} style={{ width: '100%', fontWeight: 900, marginTop: '1rem' }}>
              {isSaving ? 'COMMITING...' : 'COMMIT PROFILE UPDATES'}
            </button>
          </form>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="settings-card">
          <div className="card-header">
            <div style={{ padding: '0.5rem', background: 'rgba(255, 149, 0, 0.1)', borderRadius: '10px', color: '#ff9500' }}>
              <Zap size={20} />
            </div>
            <h2>Workspace Parameters</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">WORKSPACE DESIGNATION</label>
              <input
                className="form-input"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">FINANCIAL CURRENCY MATRIX</label>
              <select
                className="form-select"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div style={{ padding: '1.25rem', background: 'rgba(255, 149, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 149, 0, 0.1)', fontSize: '0.85rem', color: '#856404', fontWeight: 600 }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Activity size={18} style={{ flexShrink: 0 }} />
                <p>Workspace synchronization is currently anchored to this session coordinate. Data persistence is optimized for current location parameters.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="settings-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div style={{ padding: '0.5rem', background: 'rgba(52, 168, 83, 0.1)', borderRadius: '10px', color: '#34a853' }}>
              <Database size={20} />
            </div>
            <h2>Neural Data Overview</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="data-chip">
              <span>Indexed Liabilities</span>
              <strong>{billsCount}</strong>
            </div>
            <div className="data-chip">
              <span>Infrastructure Nodes</span>
              <strong>{locationsCount}</strong>
            </div>
            <div className="data-chip">
              <span>Vendor Identities</span>
              <strong>{vendorsCount}</strong>
            </div>
            <div className="data-chip">
              <span>System Health</span>
              <strong style={{ color: '#34a853' }}>OPTIMIZED</strong>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(0, 113, 227, 0.05)', borderRadius: '16px', border: '1px solid rgba(0, 113, 227, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <ShieldAlert size={24} className="text-primary" />
             <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
               Synchronized with Supabase Cloud Infrastructure. If orchestration failures occur, verify your neural schema mapping.
             </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default memo(SettingsView);
