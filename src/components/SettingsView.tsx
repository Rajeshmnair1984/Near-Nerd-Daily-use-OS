import { FormEvent, memo, useState } from 'react';
import { Database, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';
import { User } from '@/types/user';
import { DEFAULT_CURRENCY } from '@/utils/currency';

interface SettingsViewProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
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
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [workspaceName, setWorkspaceName] = useState('NearNerd Operations');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [savedMessage, setSavedMessage] = useState('');

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdateUser({
      id: user?.id || '1',
      name: name.trim() || 'Raj Admin',
      email: email.trim(),
      role: role.trim() || 'Super Manager',
    });
    setSavedMessage('Settings saved');
    window.setTimeout(() => setSavedMessage(''), 2500);
  };

  return (
    <div className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Control Center</p>
          <h1>Settings</h1>
          <p>Manage your profile, workspace defaults, and operational data health.</p>
        </div>
        {savedMessage && <span className="settings-saved">{savedMessage}</span>}
      </header>

      <section className="settings-layout">
        <form className="panel settings-panel" onSubmit={handleProfileSubmit}>
          <div className="settings-card-title">
            <UserRound size={20} />
            <h2>Profile</h2>
          </div>
          <label className="form-group">
            <span className="form-label">Name</span>
            <input
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Email</span>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Role</span>
            <input
              className="form-input"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </label>
          <button className="button-primary" type="submit">
            Save Profile
          </button>
        </form>

        <div className="panel settings-panel">
          <div className="settings-card-title">
            <SlidersHorizontal size={20} />
            <h2>Workspace</h2>
          </div>
          <label className="form-group">
            <span className="form-label">Workspace Name</span>
            <input
              className="form-input"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Currency</span>
            <select
              className="form-select"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
          <div className="settings-note">
            Workspace preferences stay local for now and keep the interface consistent while data tables are being set up.
          </div>
        </div>

        <div className="panel settings-panel settings-wide">
          <div className="settings-card-title">
            <Database size={20} />
            <h2>Data Overview</h2>
          </div>
          <div className="settings-stats">
            <div>
              <span>Bills</span>
              <strong>{billsCount}</strong>
            </div>
            <div>
              <span>Locations</span>
              <strong>{locationsCount}</strong>
            </div>
            <div>
              <span>Vendors</span>
              <strong>{vendorsCount}</strong>
            </div>
          </div>
          <div className="settings-health">
            <ShieldCheck size={18} />
            <span>App is ready. If saving fails, run the latest Supabase schema from this project.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default memo(SettingsView);
