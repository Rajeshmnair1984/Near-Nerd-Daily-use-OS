import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
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
    className="glass-card premium-stat-card"
    style={{ 
      padding: '1.75rem', 
      flex: 1, 
      minWidth: '280px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.03, transform: 'scale(4)' }}>
      <Icon size={40} />
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${color}20, ${color}05)`,
          padding: '0.85rem',
          borderRadius: '16px',
          color: color,
          border: `1px solid ${color}30`,
        }}
      >
        <Icon size={24} />
      </div>
      {trend && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: trend > 0 ? '#10b981' : '#ef4444',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '0.35rem 0.75rem',
            background: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '100px',
            height: 'fit-content'
          }}
        >
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    
    <div className="stat-content">
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
        {title}
      </p>
      <h3 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        {formatCurrency(value)}
      </h3>
      {subtitle && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}>
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
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 900 }}>COMMAND CENTER</p>
          <h1>Operational Intelligence</h1>
          <p>Global oversight of locations, commitments, and critical infrastructure metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', zIndex: 1 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>System Health</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 900 }}>
              <ShieldCheck size={18} />
              OPTIMIZED
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="empty-state" style={{ padding: '8rem' }}>
          <Zap size={48} className="animate-pulse" color="var(--primary)" />
          <h2 style={{ marginTop: '1.5rem', fontWeight: 900 }}>ORCHESTRATING DATA MATRIX...</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="chart-container-premium">
              <div className="chart-header-premium">
                <div>
                  <h3><Activity size={20} className="text-primary" /> Temporal Analytics</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Financial flow across temporal coordinates</p>
                </div>
                <PieChart size={20} className="text-secondary" />
              </div>
              <div style={{ width: '100%', height: '350px' }}>
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
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="chart-container-premium">
              <div className="chart-header-premium">
                <div>
                  <h3><BarChart3 size={20} className="text-primary" /> Allocation Intelligence</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Resource distribution by category matrix</p>
                </div>
                <LayoutDashboard size={20} className="text-secondary" />
              </div>
              <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fontWeight={600} />
                    <YAxis axisLine={false} tickLine={false} fontSize={11} fontWeight={600} />
                    <Tooltip 
                       contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgba(0, 113, 227, 0.4)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                 <div style={{ padding: '0.5rem', background: 'rgba(0, 113, 227, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
                   <Activity size={20} />
                 </div>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Neural Activity Stream</h3>
              </div>
              <div>
                {bills
                  .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
                  .slice(0, 5)
                  .map((bill) => (
                  <div key={bill.id} className="activity-card-premium">
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '12px', 
                      background: bill.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 113, 227, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: bill.status === 'Paid' ? '#10b981' : 'var(--primary)',
                      border: bill.status === 'Paid' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(0, 113, 227, 0.2)'
                    }}>
                      {bill.status === 'Paid' ? <CheckCircle2 size={20} /> : <Receipt size={20} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                        {bill.status === 'Paid' ? 'Settle Orchestration' : 'New Commitment Indexed'}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {bill.charge_name} • {bill.date}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{formatCurrency(bill.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                 <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', color: 'var(--error)' }}>
                   <AlertCircle size={20} />
                 </div>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Priority Interventions</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bills
                  .filter((b) => b.status !== 'Paid')
                  .slice(0, 5)
                  .map((bill) => (
                  <div key={bill.id} className="activity-card-premium" style={{ borderLeft: `6px solid ${bill.status === 'Overdue' ? 'var(--error)' : 'var(--primary)'}` }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-primary)' }}>{bill.charge_name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <Calendar size={14} className="text-secondary" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>DUE: {bill.date}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 900, fontSize: '1.15rem' }}>{formatCurrency(bill.amount)}</p>
                      <span className={`status-badge status-${bill.status.toLowerCase()}`} style={{ fontSize: '0.6rem', fontWeight: 900 }}>
                        {bill.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
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
