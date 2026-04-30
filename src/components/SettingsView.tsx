import { FormEvent, memo, useEffect, useState } from 'react';
import { Activity, CheckCircle2, Database, Fingerprint, Link, Send, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { UserProfile } from '@/services/AuthService';
import { DEFAULT_CURRENCY } from '@/utils/currency';
import { motion } from 'framer-motion';
import { zapierService } from '@/services/zapierService';

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
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState(() => zapierService.getSettings().webhookUrl);
  const [isZapierEnabled, setIsZapierEnabled] = useState(() => zapierService.getSettings().enabled);
  const [isTestingZapier, setIsTestingZapier] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setName(user?.fullName || '');
      setEmail(user?.email || '');
      setRole(user?.role || '');
    });
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

  const handleZapierSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    zapierService.saveSettings({
      enabled: isZapierEnabled,
      webhookUrl: zapierWebhookUrl,
    });
    setSavedMessage('Zapier connection saved');
    window.setTimeout(() => setSavedMessage(''), 2500);
  };

  const handleZapierTest = async () => {
    setIsTestingZapier(true);
    setSavedMessage('');

    try {
      await zapierService.testConnection(zapierWebhookUrl);
      zapierService.saveSettings({
        enabled: true,
        webhookUrl: zapierWebhookUrl,
      });
      setIsZapierEnabled(true);
      setSavedMessage('Zapier test sent successfully');
      window.setTimeout(() => setSavedMessage(''), 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not reach Zapier';
      setSavedMessage(message);
    } finally {
      setIsTestingZapier(false);
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

        .settings-premium-page .saved-status {
          padding: 0.75rem 1.5rem;
          background: rgba(52, 168, 83, 0.1);
          color: #34a853;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(52, 168, 83, 0.2);
        }

        .settings-premium-page .icon-box {
          padding: 0.5rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-premium-page .icon-blue { background: rgba(0, 113, 227, 0.1); color: var(--primary); }
        .settings-premium-page .icon-orange { background: rgba(255, 149, 0, 0.1); color: #ff9500; }
        .settings-premium-page .icon-red { background: rgba(255, 76, 0, 0.1); color: #ff4c00; }
        .settings-premium-page .icon-green { background: rgba(52, 168, 83, 0.1); color: #34a853; }

        .settings-premium-page .settings-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-premium-page .form-input-readonly {
          background: var(--surface-soft);
          cursor: not-allowed;
        }

        .settings-premium-page .role-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1.25rem;
          background: var(--surface-soft);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .settings-premium-page .role-text {
          font-weight: 800;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .settings-premium-page .full-width-btn {
          width: 100%;
          font-weight: 900;
          margin-top: 1rem;
        }

        .settings-premium-page .info-banner {
          padding: 1.25rem;
          background: rgba(255, 149, 0, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 149, 0, 0.1);
          font-size: 0.85rem;
          color: #856404;
          font-weight: 600;
        }

        .settings-premium-page .info-banner-content {
          display: flex;
          gap: 0.75rem;
        }

        .settings-premium-page .info-banner-icon {
          flex-shrink: 0;
        }

        .settings-premium-page .zapier-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .settings-premium-page .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.9rem 1rem;
          background: var(--surface-soft);
          border-radius: 12px;
          border: 1px solid var(--border);
          cursor: pointer;
        }

        .settings-premium-page .checkbox-input {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
        }

        .settings-premium-page .checkbox-text {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .settings-premium-page .btn-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .settings-premium-page .btn-bold {
          font-weight: 900;
        }

        .settings-premium-page .btn-test {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .settings-premium-page .grid-full {
          grid-column: 1 / -1;
        }

        .settings-premium-page .data-chip-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .settings-premium-page .health-optimized {
          color: #34a853;
        }

        .settings-premium-page .supabase-banner {
          padding: 1.5rem;
          background: rgba(0, 113, 227, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(0, 113, 227, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .settings-premium-page .supabase-banner-text {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
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
            className="saved-status"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={16} aria-hidden="true" /> {savedMessage}
          </motion.div>
        )}
      </header>

      <div className="settings-grid">
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="settings-card"
          aria-labelledby="identity-protocol-title"
        >
          <div className="card-header">
            <div className="icon-box icon-blue" aria-hidden="true">
              <Fingerprint size={20} />
            </div>
            <h2 id="identity-protocol-title">Identity Protocol</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-group">
              <label className="form-label" htmlFor="settings-full-name">FULL IDENTITY NAME</label>
              <input
                id="settings-full-name"
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Alex Rivers"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-email">COMMUNICATION ENDPOINT (EMAIL)</label>
              <input
                id="settings-email"
                className="form-input form-input-readonly"
                type="email"
                value={email}
                readOnly
                aria-readonly="true"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-role-display-box">AUTHORIZATION ROLE</label>
              <div id="settings-role-display-box" className="role-box" role="status" aria-readonly="true">
                 <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
                 <span className="role-text">{role || 'Standard Entity'}</span>
              </div>
            </div>
            <button className="button-primary full-width-btn" type="submit" disabled={isSaving}>
              {isSaving ? 'COMMITING...' : 'COMMIT PROFILE UPDATES'}
            </button>
          </form>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="settings-card"
          aria-labelledby="workspace-params-title"
        >
          <div className="card-header">
            <div className="icon-box icon-orange" aria-hidden="true">
              <Zap size={20} />
            </div>
            <h2 id="workspace-params-title">Workspace Parameters</h2>
          </div>
          
          <div className="settings-form">
            <div className="form-group">
              <label className="form-label" htmlFor="settings-workspace-name">WORKSPACE DESIGNATION</label>
              <input
                id="settings-workspace-name"
                className="form-input"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-currency">FINANCIAL CURRENCY MATRIX</label>
              <select
                id="settings-currency"
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
            <div className="info-banner" role="note">
              <div className="info-banner-content">
                <Activity size={18} className="info-banner-icon" aria-hidden="true" />
                <p>Workspace synchronization is currently anchored to this session coordinate. Data persistence is optimized for current location parameters.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25 }} 
          className="settings-card"
          aria-labelledby="zapier-connection-title"
        >
          <div className="card-header">
            <div className="icon-box icon-red" aria-hidden="true">
              <Link size={20} />
            </div>
            <h2 id="zapier-connection-title">Zapier Connection</h2>
          </div>

          <form onSubmit={handleZapierSubmit} className="zapier-form">
            <div className="form-group">
              <label className="form-label" htmlFor="settings-zapier-webhook">ZAPIER CATCH HOOK URL</label>
              <input
                id="settings-zapier-webhook"
                className="form-input"
                type="url"
                value={zapierWebhookUrl}
                onChange={(event) => setZapierWebhookUrl(event.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
              />
            </div>

            <label className="checkbox-label" htmlFor="settings-zapier-toggle">
              <input
                id="settings-zapier-toggle"
                type="checkbox"
                checked={isZapierEnabled}
                onChange={(event) => setIsZapierEnabled(event.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                Send bill, location, vendor, and document changes to Zapier
              </span>
            </label>

            <div className="btn-grid">
              <button className="button-primary btn-bold" type="submit">
                SAVE ZAPIER
              </button>
              <button
                className="button-secondary btn-bold btn-test"
                type="button"
                onClick={handleZapierTest}
                disabled={isTestingZapier}
                aria-label="Test connection to Zapier"
              >
                <Send size={16} aria-hidden="true" />
                {isTestingZapier ? 'TESTING...' : 'TEST'}
              </button>
            </div>
          </form>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="settings-card grid-full"
          aria-labelledby="neural-data-title"
        >
          <div className="card-header">
            <div className="icon-box icon-green" aria-hidden="true">
              <Database size={20} />
            </div>
            <h2 id="neural-data-title">Neural Data Overview</h2>
          </div>
          
          <div className="data-chip-grid" role="list" aria-label="Workspace metrics">
            <div className="data-chip" role="listitem">
              <span>Indexed Liabilities</span>
              <strong>{billsCount}</strong>
            </div>
            <div className="data-chip" role="listitem">
              <span>Infrastructure Nodes</span>
              <strong>{locationsCount}</strong>
            </div>
            <div className="data-chip" role="listitem">
              <span>Vendor Identities</span>
              <strong>{vendorsCount}</strong>
            </div>
            <div className="data-chip" role="listitem">
              <span>System Health</span>
              <strong className="health-optimized">OPTIMIZED</strong>
            </div>
          </div>

          <div className="supabase-banner" role="alert">
             <ShieldAlert size={24} className="text-primary" aria-hidden="true" />
             <p className="supabase-banner-text">
               Synchronized with Supabase Cloud Infrastructure. If orchestration failures occur, verify your neural schema mapping.
             </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default memo(SettingsView);
