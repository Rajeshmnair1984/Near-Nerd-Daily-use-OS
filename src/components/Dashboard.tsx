import { memo, useMemo } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Bill } from "@/types/bill";
import { DashboardStats } from "@/types/common";
import { formatCurrency } from "@/utils/currency";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  trend?: number;
  subtitle?: string;
}

const StatCard = memo(
  ({ title, value, icon: Icon, color, trend, subtitle }: StatCardProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card premium-stat-card stat-card-shell"
      role="listitem"
    >
      <div className="stat-card-bg-icon" aria-hidden="true">
        <Icon size={40} />
      </div>

      <div className="stat-card-header">
        <div
          className="stat-card-icon-box"
          style={{ "--stat-color": color } as React.CSSProperties}
          aria-hidden="true"
        >
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div
            className={`stat-trend-badge ${trend > 0 ? "trend-up" : "trend-down"}`}
            aria-label={`${trend > 0 ? "Upward" : "Downward"} trend of ${Math.abs(trend)}%`}
          >
            {trend > 0 ? (
              <ArrowUpRight size={14} aria-hidden="true" />
            ) : (
              <ArrowDownRight size={14} aria-hidden="true" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div className="stat-content">
        <p className="stat-label-text">{title}</p>
        <h3
          className="stat-value-text"
          aria-label={`${title} value: ${formatCurrency(value)}`}
        >
          {formatCurrency(value)}
        </h3>
        {subtitle && <p className="stat-subtitle-text">{subtitle}</p>}
      </div>
    </motion.div>
  ),
);

interface DashboardProps {
  stats: DashboardStats;
  bills: Bill[];
  loading?: boolean;
}

function Dashboard({ stats, bills, loading }: DashboardProps) {
  const categoryChartData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    bills.forEach((bill) => {
      const category = bill.category || "Uncategorized";
      categoryMap.set(category, (categoryMap.get(category) || 0) + bill.amount);
    });
    return Array.from(categoryMap, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value - a.value,
    );
  }, [bills]);

  const monthlyTrendData = useMemo(() => {
    const months: {
      [key: string]: { paid: number; pending: number; total: number };
    } = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      months[monthKey] = { paid: 0, pending: 0, total: 0 };
    }

    bills.forEach((bill) => {
      const billDate = new Date(bill.date);
      const monthKey = billDate.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (months[monthKey]) {
        months[monthKey].total += bill.amount;
        if (bill.status === "Paid") {
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
          padding: 3.5rem;
          border-radius: 40px;
          border: 1px solid var(--border);
          margin-bottom: 3.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .dashboard-premium-page .page-hero::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          opacity: 0.2;
          z-index: 0;
        }

        .dashboard-premium-page .hero-content h1 {
          font-size: 4rem;
          font-weight: 950;
          letter-spacing: -0.06em;
          line-height: 0.9;
          margin-bottom: 1.25rem;
          background: linear-gradient(to right, var(--text-primary) 20%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          z-index: 1;
          position: relative;
        }

        .dashboard-premium-page .hero-content p {
          font-size: 1.35rem;
          color: var(--text-secondary);
          max-width: 550px;
          font-weight: 600;
          z-index: 1;
          position: relative;
          line-height: 1.4;
        }

        .dashboard-premium-page .hero-eyebrow {
          color: var(--primary);
          font-weight: 950;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .dashboard-premium-page .system-health-box {
          text-align: right;
          z-index: 1;
          position: relative;
        }

        .dashboard-premium-page .system-health-label {
          font-size: 0.8rem;
          font-weight: 900;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.4rem;
        }

        .dashboard-premium-page .system-health-status {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #10b981;
          font-weight: 950;
          font-size: 1.15rem;
        }

        .stat-card-shell {
          padding: 2.25rem;
          flex: 1;
          min-width: 320px;
          position: relative;
          overflow: hidden;
          background: var(--bg-card);
          border-radius: 32px;
          border: 1px solid var(--border);
          transition: var(--transition);
        }

        .stat-card-shell:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }

        .stat-card-bg-icon {
          position: absolute;
          top: -20px;
          right: -20px;
          opacity: 0.02;
          transform: scale(5);
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.75rem;
        }

        .stat-card-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--stat-color, var(--primary))25, var(--stat-color, var(--primary))05);
          color: var(--stat-color, var(--primary));
          border: 1px solid var(--stat-color, var(--primary))30;
        }

        .stat-trend-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          font-weight: 900;
          padding: 0.45rem 1rem;
          border-radius: 100px;
          height: fit-content;
        }

        .trend-up { color: #10b981; background: rgba(16, 185, 129, 0.12); }
        .trend-down { color: #ef4444; background: rgba(239, 68, 68, 0.12); }

        .stat-label-text {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
        }

        .stat-value-text {
          font-size: 2.75rem;
          font-weight: 950;
          letter-spacing: -0.04em;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-subtitle-text {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 0.75rem;
          font-weight: 600;
        }

        .chart-container-premium {
          background: var(--bg-card);
          border-radius: 36px;
          border: 1px solid var(--border);
          padding: 2.5rem;
          box-shadow: var(--shadow-sm);
        }

        .chart-header-premium {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 3rem;
        }

        .chart-header-premium h3 {
          font-size: 1.5rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 1rem;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin: 0;
        }

        .chart-sub-text {
          color: var(--text-secondary);
          font-size: 1rem;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .chart-viewport {
          width: 100%;
          height: 380px;
        }

        .activity-card-premium {
          background: var(--surface-soft);
          border-radius: 24px;
          padding: 1.5rem;
          border: 1px solid var(--border);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1.5rem;
          transition: var(--transition);
          margin-bottom: 1rem;
        }

        .activity-card-premium:hover {
          background: var(--surface);
          border-color: var(--primary);
          transform: translateX(8px);
          box-shadow: var(--shadow-sm);
        }

        .activity-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-primary-text {
          font-weight: 900;
          font-size: 1.05rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .activity-secondary-text {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 700;
        }

        .activity-value-text {
          font-weight: 950;
          color: var(--text-primary);
          font-size: 1.15rem;
        }

        .dashboard-grid-layout {
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
        }

        .stat-grid-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .chart-grid-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
        }

        .activity-grid-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 3.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .section-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 950;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin: 0;
        }

        .priority-intervention-card {
           border-left-width: 8px;
           border-left-style: solid;
        }

        .priority-intervention-overdue {
          border-left-color: var(--error);
        }

        .priority-intervention-pending {
          border-left-color: var(--primary);
        }

        .dashboard-loading-shell {
          padding: 12rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
        }

        .dashboard-loading-title {
          font-weight: 950;
          letter-spacing: 0.2em;
          color: var(--text-secondary);
          font-size: 1rem;
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <span className="hero-eyebrow" aria-hidden="true">
            Neural Overview
          </span>
          <h1>Operational Intelligence</h1>
          <p>
            Orchestrating global infrastructure metrics, upcoming commitments,
            and real-time status telemetry.
          </p>
        </div>
        <div
          className="system-health-box"
          aria-label="Current system health: optimized"
        >
          <p className="system-health-label">System Health</p>
          <div className="system-health-status">
            <ShieldCheck size={24} aria-hidden="true" />
            OPTIMIZED
          </div>
        </div>
      </header>

      {loading ? (
        <div className="dashboard-loading-shell" aria-busy="true">
          <Zap
            size={64}
            className="animate-pulse"
            color="var(--primary)"
            aria-hidden="true"
          />
          <h2 className="dashboard-loading-title">
            SYNCHRONIZING DATA MATRIX...
          </h2>
        </div>
      ) : (
        <div className="dashboard-grid-layout">
          <div
            className="stat-grid-row"
            role="list"
            aria-label="Primary business metrics"
          >
            <StatCard
              title="Liquidity Deployment"
              value={stats.totalPaid}
              icon={CheckCircle2}
              color="#10b981"
              trend={12}
              subtitle="Volume of successfully settled commitments"
            />
            <StatCard
              title="Active Commitments"
              value={stats.totalPending}
              icon={Clock}
              color="#f59e0b"
              trend={-5}
              subtitle="Pending infrastructure settlements"
            />
            <StatCard
              title="Risk Matrix Value"
              value={stats.totalOverdue}
              icon={AlertCircle}
              color="#ef4444"
              trend={8}
              subtitle="Intervention required immediately"
            />
          </div>

          <div className="chart-grid-row">
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="chart-container-premium"
              aria-labelledby="temporal-analytics-title"
            >
              <header className="chart-header-premium">
                <div>
                  <h3 id="temporal-analytics-title">
                    <Activity
                      size={24}
                      className="text-primary"
                      aria-hidden="true"
                    />{" "}
                    Temporal Analytics
                  </h3>
                  <p className="chart-sub-text">
                    Inter-coordinate financial flow telemetry
                  </p>
                </div>
                <PieChart
                  size={24}
                  className="text-secondary"
                  aria-hidden="true"
                />
              </header>
              <div
                className="chart-viewport"
                role="img"
                aria-label="Area chart showing comparative paid vs pending volumes over a 6-month temporal coordinate."
              >
                <ResponsiveContainer>
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient
                        id="colorPaid"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorPending"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(0,0,0,0.05)"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      fontWeight={700}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      fontWeight={700}
                      dx={-10}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "20px",
                        boxShadow: "var(--shadow-lg)",
                        padding: "1rem",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="paid"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorPaid)"
                      strokeWidth={4}
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorPending)"
                      strokeWidth={4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="chart-container-premium"
              aria-labelledby="allocation-intelligence-title"
            >
              <header className="chart-header-premium">
                <div>
                  <h3 id="allocation-intelligence-title">
                    <BarChart3
                      size={24}
                      className="text-primary"
                      aria-hidden="true"
                    />{" "}
                    Allocation Matrix
                  </h3>
                  <p className="chart-sub-text">
                    Strategic resource distribution telemetry
                  </p>
                </div>
                <LayoutDashboard
                  size={24}
                  className="text-secondary"
                  aria-hidden="true"
                />
              </header>
              <div
                className="chart-viewport"
                role="img"
                aria-label="Bar chart illustrating resource allocation across distinct operational categories."
              >
                <ResponsiveContainer>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(0,0,0,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      fontWeight={700}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      fontWeight={700}
                      dx={-10}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "20px",
                        boxShadow: "var(--shadow-lg)",
                        padding: "1rem",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[12, 12, 4, 4]}
                      barSize={50}
                      fill="var(--primary)"
                    >
                      {categoryChartData.map((_entry, index) => (
                        <rect key={`cell-${index}`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          </div>

          <div className="activity-grid-row">
            <section aria-labelledby="activity-stream-title">
              <header className="section-header">
                <div
                  className="section-icon-box"
                  style={{
                    background: "rgba(0, 113, 227, 0.1)",
                    color: "var(--primary)",
                  }}
                >
                  <Activity size={24} aria-hidden="true" />
                </div>
                <h3 className="section-title" id="activity-stream-title">
                  Activity Telemetry
                </h3>
              </header>
              <div role="list" aria-label="Recent system events">
                {bills
                  .sort(
                    (a, b) =>
                      new Date(b.created_at || b.date).getTime() -
                      new Date(a.created_at || a.date).getTime(),
                  )
                  .slice(0, 5)
                  .map((bill) => (
                    <article
                      key={bill.id}
                      className="activity-card-premium"
                      role="listitem"
                      aria-labelledby={`activity-title-${bill.id}`}
                    >
                      <div
                        className={`activity-icon-box ${bill.status === "Paid" ? "status-paid" : "status-pending"}`}
                        style={{
                          background:
                            bill.status === "Paid"
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(0, 113, 227, 0.12)",
                          color:
                            bill.status === "Paid"
                              ? "#10b981"
                              : "var(--primary)",
                        }}
                      >
                        {bill.status === "Paid" ? (
                          <CheckCircle2 size={24} aria-hidden="true" />
                        ) : (
                          <Receipt size={24} aria-hidden="true" />
                        )}
                      </div>
                      <div className="activity-info-area">
                        <p
                          className="activity-primary-text"
                          id={`activity-title-${bill.id}`}
                        >
                          {bill.status === "Paid"
                            ? "Settlement Synchronized"
                            : "New Commitment Indexed"}
                        </p>
                        <p className="activity-secondary-text">
                          {bill.charge_name} • Coordinate: {bill.date}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          className="activity-value-text"
                          aria-label={`Impact volume: ${formatCurrency(bill.amount)}`}
                        >
                          {formatCurrency(bill.amount)}
                        </p>
                      </div>
                    </article>
                  ))}
              </div>
            </section>

            <section aria-labelledby="priority-interventions-title">
              <header className="section-header">
                <div
                  className="section-icon-box"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "var(--error)",
                  }}
                >
                  <AlertCircle size={24} aria-hidden="true" />
                </div>
                <h3 className="section-title" id="priority-interventions-title">
                  Priority Interventions
                </h3>
              </header>
              <div role="list" aria-label="Critical administrative actions">
                {bills
                  .filter((b) => b.status !== "Paid")
                  .slice(0, 5)
                  .map((bill) => (
                    <article
                      key={bill.id}
                      className={`activity-card-premium priority-intervention-card ${bill.status === "Overdue" ? "priority-intervention-overdue" : "priority-intervention-pending"}`}
                      role="listitem"
                      aria-labelledby={`priority-title-${bill.id}`}
                    >
                      <div className="activity-info-area">
                        <p
                          className="activity-primary-text"
                          id={`priority-title-${bill.id}`}
                        >
                          {bill.charge_name}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginTop: "0.25rem",
                          }}
                        >
                          <Calendar
                            size={16}
                            className="text-secondary"
                            aria-hidden="true"
                          />
                          <span className="activity-secondary-text">
                            TIMELINE: {bill.date}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          className="activity-value-text"
                          style={{ fontSize: "1.25rem" }}
                          aria-label={`Risk impact: ${formatCurrency(bill.amount)}`}
                        >
                          {formatCurrency(bill.amount)}
                        </p>
                        <span
                          className={`status-badge status-${bill.status.toLowerCase()}`}
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 950,
                            marginTop: "0.4rem",
                            display: "inline-block",
                          }}
                        >
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
