import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  LayoutDashboard,
  PieChart,
  BarChart3,
  Calendar,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Bill } from '@/types/bill';
import { DashboardStats } from '@/types/common';
import { formatCurrency } from '@/utils/currency';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  trend?: number;
  subtitle?: string;
}

const StatCard = memo(({ title, value, icon: Icon, color, trend, subtitle }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card premium-stat-card stat-card-shell"
  >
    <div className="stat-card-bg-icon">
      <Icon size={40} aria-hidden="true" />
    </div>
    
    <div className="stat-card-header">
      <div
        className="stat-card-icon-box"
        style={{
          background: `linear-gradient(135deg, ${color}20, ${color}05)`,
          color: color,
          border: `1px solid ${color}30`,
        }}
      >
        <Icon size={24} aria-hidden="true" />
      </div>
      {trend !== undefined && (
        <div
          className={`stat-trend-badge ${trend > 0 ? 'trend-up' : 'trend-down'}`}
          title={`${trend > 0 ? 'Increase' : 'Decrease'} of ${Math.abs(trend)}%`}
        >
          {trend > 0 ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowDownRight size={14} aria-hidden="true" />}
          <span aria-label={`${Math.abs(trend)} percent`}>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    
    <div className="stat-content">
      <p className="stat-label-text">
        {title}
      </p>
      <h3 className="stat-value-text">
        {formatCurrency(value)}
      </h3>
      {subtitle && (
        <p className="stat-subtitle-text">
          {subtitle}
        </p>
      )}
    </div>
  </motion.div>
));

interface DashboardProps {
  stats: DashboardStats;
  bills: Bill[];
  loading?: boolean;
}

function Dashboard({ stats, bills, loading }: DashboardProps) {
  const categoryChartData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    bills.forEach((bill) => {
      const category = bill.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + bill.amount);
    });
    return Array.from(categoryMap, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [bills]);

  const monthlyTrendData = useMemo(() => {
    const months: { [key: string]: { paid: number; pending: number; total: number } } = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      months[monthKey] = { paid: 0, pending: 0, total: 0 };
    }

    bills.forEach((bill) => {
      const billDate = new Date(bill.date);
      const monthKey = billDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (months[monthKey]) {
        months[monthKey].total += bill.amount;
        if (bill.status === 'Paid') {
          months[monthKey].paid += bill.amount;
        } else {
          months[monthKey].pending += bill.amount;
        }
      }
    });

    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data,
    }));
  }, [bills]);

  return (
    <div className="page-shell dashboard-premium-page">
      <style>{`
        .dashboard-premium-page .page-hero {
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-soft) 100%);
          padding: 3rem;
          border-radius: 32px;
          border: 1px solid var(--border);
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .dashboard-premium-page .page-hero::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          opacity: 0.15;
          z-index: 0;
        }

        .dashboard-premium-page .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 950;
          letter-spacing: -0.05em;
          line-height: 0.95;
          margin-bottom: 1rem;
          background: linear-gradient(to right, var(--text-primary) 30%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          z-index: 1;
          position: relative;
        }

        .dashboard-premium-page .hero-content p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 500px;
          font-weight: 500;
          z-index: 1;
          position: relative;
        }

        .dashboard-premium-page .hero-eyebrow {
          color: var(--primary);
          font-weight: 900;
        }

        .dashboard-premium-page .hero-meta {
          display: flex;
          gap: 1rem;
          z-index: 1;
        }

        .dashboard-premium-page .system-health-box {
          text-align: right;
        }

        .dashboard-premium-page .system-health-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .dashboard-premium-page .system-health-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-weight: 900;
        }

        .stat-card-shell {
          padding: 1.75rem;
          flex: 1;
          min-width: 280px;
          position: relative;
          overflow: hidden;
        }

        .stat-card-bg-icon {
          position: absolute;
          top: -10px;
          right: -10px;
          opacity: 0.03;
          transform: scale(4);
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .stat-card-icon-box {
          padding: 0.85rem;
          border-radius: 16px;
        }

        .stat-trend-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          height: fit-content;
        }

        .trend-up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .trend-down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

        .stat-label-text {
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .stat-value-text {
          font-size: 2.25rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .stat-subtitle-text {
          color: var(--text-secondary);
          font-size: 0.75rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        .chart-container-premium {
          background: var(--bg-card);
          border-radius: 28px;
          border: 1px solid var(--border);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .chart-header-premium {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
        }

        .chart-header-premium h3 {
          font-size: 1.15rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .chart-sub-text {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .chart-viewport {
          width: 100%;
          height: 350px;
        }

        .activity-card-premium {
          background: var(--surface-soft);
          border-radius: 20px;
          padding: 1.25rem;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: var(--transition);
          margin-bottom: 0.75rem;
        }

        .activity-card-premium:hover {
          background: var(--surface);
          border-color: var(--primary);
          transform: translateX(4px);
        }

        .activity-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-info-area {
          flex: 1;
        }

        .activity-primary-text {
          font-weight: 800;
          font-size: 0.9rem;
        }

        .activity-secondary-text {
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .activity-value-text {
          font-weight: 900;
          color: var(--text-primary);
        }

        .dashboard-grid-layout {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .stat-grid-row {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .chart-grid-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 1.5rem;
        }

        .activity-grid-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .section-icon-box {
          padding: 0.5rem;
          border-radius: 10px;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 900;
        }

        .intervention-card {
          padding: 0;
        }

        .intervention-item {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .priority-value-area {
          text-align: right;
        }

        .priority-amount {
          font-weight: 900;
          font-size: 1.15rem;
        }

        .priority-status-badge {
          font-size: 0.6rem;
          font-weight: 900;
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">COMMAND CENTER</p>
          <h1>Operational Intelligence</h1>
          <p>Global oversight of locations, commitments, and critical infrastructure metrics.</p>
        </div>
        <div className="hero-meta">
          <div className="system-health-box">
            <p className="system-health-label">System Health</p>
            <div className="system-health-status">
              <ShieldCheck size={18} aria-hidden="true" />
              OPTIMIZED
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="empty-state" style={{ padding: '8rem' }}>
          <Zap size={48} className="animate-pulse" color="var(--primary)" aria-hidden="true" />
          <h2 style={{ marginTop: '1.5rem', fontWeight: 900 }}>ORCHESTRATING DATA MATRIX...</h2>
        </div>
      ) : (
        <div className="dashboard-grid-layout">
          <div className="stat-grid-row">
            <StatCard
              title="Liquidity Deployment"
              value={stats.totalPaid}
              icon={CheckCircle2}
              color="#10b981"
              trend={12}
              subtitle="Monthly settlement volume"
            />
            <StatCard
              title="Active Commitments"
              value={stats.totalPending}
              icon={Clock}
              color="#f59e0b"
              trend={-5}
              subtitle="Awaiting orchestration"
            />
            <StatCard
              title="High Risk Matrix"
              value={stats.totalOverdue}
              icon={AlertCircle}
              color="#ef4444"
              trend={8}
              subtitle="Critical attention required"
            />
          </div>

          <div className="chart-grid-row">
            <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="chart-container-premium">
              <header className="chart-header-premium">
                <div>
                  <h3><Activity size={20} className="text-primary" aria-hidden="true" /> Temporal Analytics</h3>
                  <p className="chart-sub-text">Financial flow across temporal coordinates</p>
                </div>
                <PieChart size={20} className="text-secondary" aria-hidden="true" />
              </header>
              <div className="chart-viewport">
                <ResponsiveContainer>
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11} fontWeight={600} />
                    <YAxis axisLine={false} tickLine={false} fontSize={11} fontWeight={600} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Area type="monotone" dataKey="paid" stroke="#10b981" fillOpacity={1} fill="url(#colorPaid)" strokeWidth={3} />
                    <Area type="monotone" dataKey="pending" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPending)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="chart-container-premium">
              <header className="chart-header-premium">
                <div>
                  <h3><BarChart3 size={20} className="text-primary" aria-hidden="true" /> Allocation Intelligence</h3>
                  <p className="chart-sub-text">Resource distribution by category matrix</p>
                </div>
                <LayoutDashboard size={20} className="text-secondary" aria-hidden="true" />
              </header>
              <div className="chart-viewport">
                <ResponsiveContainer>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fontWeight={600} />
                    <YAxis axisLine={false} tickLine={false} fontSize={11} fontWeight={600} />
                    <Tooltip 
                       contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                      {categoryChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgba(0, 113, 227, 0.4)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          </div>

          <div className="activity-grid-row">
            <section>
              <header className="section-header">
                 <div className="section-icon-box" style={{ background: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)' }}>
                   <Activity size={20} aria-hidden="true" />
                 </div>
                 <h3 className="section-title">Neural Activity Stream</h3>
              </header>
              <div role="list">
                {bills
                  .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
                  .slice(0, 5)
                  .map((bill) => (
                  <article key={bill.id} className="activity-card-premium" role="listitem">
                    <div className="activity-icon-box" style={{ 
                      background: bill.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 113, 227, 0.1)',
                      color: bill.status === 'Paid' ? '#10b981' : 'var(--primary)',
                      border: bill.status === 'Paid' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(0, 113, 227, 0.2)'
                    }}>
                      {bill.status === 'Paid' ? <CheckCircle2 size={20} aria-hidden="true" /> : <Receipt size={20} aria-hidden="true" />}
                    </div>
                    <div className="activity-info-area">
                      <p className="activity-primary-text">
                        {bill.status === 'Paid' ? 'Settle Orchestration' : 'New Commitment Indexed'}
                      </p>
                      <p className="activity-secondary-text">
                        {bill.charge_name} • {bill.date}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="activity-value-text">{formatCurrency(bill.amount)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <header className="section-header">
                 <div className="section-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                   <AlertCircle size={20} aria-hidden="true" />
                 </div>
                 <h3 className="section-title">Priority Interventions</h3>
              </header>
              <div className="intervention-item" role="list">
                {bills
                  .filter((b) => b.status !== 'Paid')
                  .slice(0, 5)
                  .map((bill) => (
                  <article key={bill.id} className="activity-card-premium" role="listitem" style={{ borderLeft: `6px solid ${bill.status === 'Overdue' ? 'var(--error)' : 'var(--primary)'}` }}>
                    <div className="activity-info-area">
                      <p className="activity-value-text" style={{ fontSize: '1rem' }}>{bill.charge_name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <Calendar size={14} className="text-secondary" aria-hidden="true" />
                        <span className="activity-secondary-text" style={{ fontWeight: 700 }}>DUE: {bill.date}</span>
                      </div>
                    </div>
                    <div className="priority-value-area">
                      <p className="priority-amount">{formatCurrency(bill.amount)}</p>
                      <span className={`status-badge status-${bill.status.toLowerCase()} priority-status-badge`}>
                        {bill.status.toUpperCase()}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Dashboard);
