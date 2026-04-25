import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
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
} from 'recharts';
import { Bill } from '@/types/bill';
import { DashboardStats } from '@/types/common';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  trend?: number;
}

const StatCard = memo(({ title, value, icon: Icon, color, trend }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card"
    style={{ padding: '1.5rem', flex: 1, minWidth: '240px' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div
        style={{
          background: `${color}15`,
          padding: '0.75rem',
          borderRadius: '12px',
          color: color,
        }}
      >
        <Icon size={24} />
      </div>
      {trend && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: trend > 0 ? '#10b981' : '#ef4444',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
      {title}
    </p>
    <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
      ${value.toLocaleString()}
    </h3>
  </motion.div>
));

interface DashboardProps {
  stats: DashboardStats;
  bills: Bill[];
  loading?: boolean;
}

function Dashboard({ stats, bills, loading }: DashboardProps) {
  const chartData = [
    {
      name: 'Rent',
      value: bills
        .filter((b) => b.category === 'Rent')
        .reduce((acc, b) => acc + b.amount, 0),
    },
    {
      name: 'Utilities',
      value: bills
        .filter((b) => b.category === 'Utilities')
        .reduce((acc, b) => acc + b.amount, 0),
    },
    {
      name: 'Insurance',
      value: bills
        .filter((b) => b.category === 'Insurance')
        .reduce((acc, b) => acc + b.amount, 0),
    },
    {
      name: 'Other',
      value: bills
        .filter((b) => !['Rent', 'Utilities', 'Insurance'].includes(b.category))
        .reduce((acc, b) => acc + b.amount, 0),
    },
  ];

  return (
    <div className="page-shell">
      <header className="page-hero">
        <div>
        <p className="eyebrow">NearNerd</p>
        <h1>
          Operational Overview
        </h1>
        <p>
          Welcome back! Here's what's happening across your locations today.
        </p>
        </div>
      </header>

      {loading ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading your operational overview...
        </div>
      ) : bills.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No bills yet. Add your first bill to populate the dashboard.
        </div>
      ) : (
        <>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard
          title="Paid This Month"
          value={stats.totalPaid}
          icon={CheckCircle2}
          color="#10b981"
          trend={12}
        />
        <StatCard
          title="Total Pending"
          value={stats.totalPending}
          icon={Clock}
          color="#f59e0b"
          trend={-5}
        />
        <StatCard
          title="Overdue Amount"
          value={stats.totalOverdue}
          icon={AlertCircle}
          color="#ef4444"
          trend={2}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{ padding: '1.5rem', height: '400px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 600 }}>Expense Distribution</h3>
            <TrendingUp size={20} color="var(--text-secondary)" />
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? 'var(--primary)' : '#818cf8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card"
          style={{ padding: '1.5rem' }}
        >
          <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Proactive Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bills
              .filter((b) => b.status !== 'Paid')
              .slice(0, 4)
              .map((bill) => (
                <div
                  key={bill.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${
                      bill.status === 'Overdue'
                        ? 'var(--status-overdue)'
                        : 'var(--status-pending)'
                    }`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {bill.charge_name}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      Due: {bill.date}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700 }}>${bill.amount}</p>
                    <span
                      className={`status-badge status-${bill.status.toLowerCase()}`}
                    >
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
        </>
      )}
    </div>
  );
}

export default memo(Dashboard);
