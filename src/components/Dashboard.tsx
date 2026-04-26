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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
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
      {formatCurrency(value)}
    </h3>
  </motion.div>
));

interface DashboardProps {
  stats: DashboardStats;
  bills: Bill[];
  loading?: boolean;
}

function Dashboard({ stats, bills, loading }: DashboardProps) {
  const categoryChartData = (() => {
    const categoryMap = new Map<string, number>();
    bills.forEach((bill) => {
      const category = bill.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + bill.amount);
    });
    return Array.from(categoryMap, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  })();

  // Monthly trend data
  const monthlyTrendData = (() => {
    const months: { [key: string]: { paid: number; pending: number } } = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      months[monthKey] = { paid: 0, pending: 0 };
    }

    bills.forEach((bill) => {
      const billDate = new Date(bill.date);
      const monthKey = billDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (months[monthKey]) {
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
  })();

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
      ) : (
        <>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard
          title="Paid This Month"
          value={stats.totalPaid}
          icon={CheckCircle2}
          color="#10b981"
        />
        <StatCard
          title="Total Pending"
          value={stats.totalPending}
          icon={Clock}
          color="#f59e0b"
        />
        <StatCard
          title="Overdue Amount"
          value={stats.totalOverdue}
          icon={AlertCircle}
          color="#ef4444"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{ padding: '1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 600 }}>6-Month Trend</h3>
            <TrendingUp size={20} color="var(--text-secondary)" />
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
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
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="paid"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Paid"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Pending"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{ padding: '1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 600 }}>Expense Distribution</h3>
            <TrendingUp size={20} color="var(--text-secondary)" />
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={categoryChartData}>
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
                  {categoryChartData.map((entry, index) => (
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

      </div>

      {bills.length > 0 && (
        <div style={{ display: 'block' }}>
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
                    <p style={{ fontWeight: 700 }}>{formatCurrency(bill.amount)}</p>
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
      )}
        </>
      )}
    </div>
  );
}

export default memo(Dashboard);
