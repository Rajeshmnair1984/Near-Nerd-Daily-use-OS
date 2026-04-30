import { memo, useMemo, FC } from "react";
import {
  AlertCircle,
  Clock,
  FileText,
  RefreshCw,
  Zap,
  ShieldAlert,
  ArrowRight,
  Activity,
  BellRing,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Bill } from "@/types/bill";
import { DocumentRecord } from "@/types/document";
import { formatCurrency } from "@/utils/currency";

interface AlertsManagerProps {
  bills: Bill[];
  documents: DocumentRecord[];
  loading?: boolean;
}

interface Alert {
  id: string;
  type: "overdue" | "dueSoon" | "missingDoc" | "renewal";
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  actionItem: string;
  severity: "high" | "medium" | "low";
}

const AlertsManager: FC<AlertsManagerProps> = ({
  bills,
  documents,
  loading,
}) => {
  const alerts = useMemo<Alert[]>(() => {
    const allAlerts: Alert[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Overdue bills
    bills
      .filter((b) => b.status === "Overdue")
      .forEach((bill) => {
        allAlerts.push({
          id: `overdue-${bill.id}`,
          type: "overdue",
          title: `Overdue Payment: ${bill.charge_name}`,
          description: `Settlement coordinate: ${bill.date} • Impact: ${formatCurrency(bill.amount)}`,
          icon: AlertCircle,
          color: "#ef4444",
          actionItem: "SETTLE IMMEDIATELY",
          severity: "high",
        });
      });

    // Bills due within next 7 days
    bills
      .filter((b) => b.status === "Pending")
      .forEach((bill) => {
        const dueDate = new Date(bill.date);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate > today && dueDate <= nextWeek) {
          allAlerts.push({
            id: `dueSoon-${bill.id}`,
            type: "dueSoon",
            title: `Imminent Commitment: ${bill.charge_name}`,
            description: `Timeline coordinate: ${bill.date} • Volume: ${formatCurrency(bill.amount)}`,
            icon: Clock,
            color: "#f59e0b",
            actionItem: "ORCHESTRATE PAYMENT",
            severity: "medium",
          });
        }
      });

    // Missing or needs review documents
    documents
      .filter((d) => d.status === "Needs Review")
      .forEach((doc) => {
        allAlerts.push({
          id: `doc-${doc.id}`,
          type: "missingDoc",
          title: `Vault Review Required: ${doc.title}`,
          description: `Intel Category: ${doc.category}${doc.owner ? ` • Entity: ${doc.owner}` : ""}`,
          icon: FileText,
          color: "#0071e3",
          actionItem: "VERIFY INTEL",
          severity: "medium",
        });
      });

    // Document renewals coming up
    documents
      .filter((d) => d.renewal_date)
      .forEach((doc) => {
        const renewalDate = new Date(doc.renewal_date!);
        renewalDate.setHours(0, 0, 0, 0);
        const daysUntilRenewal = Math.ceil(
          (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntilRenewal <= 30 && daysUntilRenewal > 0) {
          allAlerts.push({
            id: `renewal-${doc.id}`,
            type: "renewal",
            title: `Vault Renewal Approaching: ${doc.title}`,
            description: `Renewal coordinate: ${doc.renewal_date} • ${daysUntilRenewal} days remaining`,
            icon: RefreshCw,
            color: "#34a853",
            actionItem: "EXTEND CLEARANCE",
            severity: "low",
          });
        }
      });

    return allAlerts
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return (
          severityOrder[a.severity as keyof typeof severityOrder] -
          severityOrder[b.severity as keyof typeof severityOrder]
        );
      })
      .slice(0, 15);
  }, [bills, documents]);

  return (
    <div className="page-shell alerts-premium-page">
      <style>{`
        .alerts-premium-page .page-hero {
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-soft) 100%);
          padding: 3rem;
          border-radius: 32px;
          border: 1px solid var(--border);
          margin-bottom: 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .alerts-premium-page .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -0.05em;
          background: linear-gradient(to right, var(--text-primary), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.75rem;
          line-height: 1;
        }

        .alerts-premium-page .hero-content p {
          color: var(--text-secondary);
          font-size: 1.15rem;
          max-width: 600px;
        }

        .alerts-premium-page .threat-matrix {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .alerts-premium-page .premium-alert-card {
          background: var(--bg-card);
          border-radius: 24px;
          padding: 1.75rem 2rem;
          border: 1px solid var(--border);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 2rem;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .alerts-premium-page .premium-alert-card:hover {
          transform: translateX(8px);
          border-color: var(--alert-color-border);
          box-shadow: 0 10px 30px var(--alert-color-glow);
        }

        .alerts-premium-page .alert-severity-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          background: var(--alert-color);
        }

        .alerts-premium-page .alert-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--alert-color-soft);
          color: var(--alert-color);
          border: 1px solid var(--alert-color-border);
        }

        .alerts-premium-page .action-trigger {
          padding: 0.8rem 1.5rem;
          border-radius: 14px;
          font-size: 0.8rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: var(--transition);
          cursor: pointer;
          border: none;
          background: var(--alert-color);
          color: white;
          box-shadow: 0 8px 20px var(--alert-color-glow);
          letter-spacing: 0.05em;
        }

        .alerts-premium-page .action-trigger:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .alerts-premium-page .header-metric-box {
          display: flex;
          gap: 1.5rem;
        }

        .alerts-premium-page .metric-badge-premium {
          padding: 1rem 1.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
        }

        .alerts-premium-page .metric-badge-label {
          font-size: 0.7rem;
          font-weight: 900;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.2rem;
        }

        .alerts-premium-page .metric-badge-value {
          font-size: 1.75rem;
          font-weight: 950;
          color: var(--text-primary);
          line-height: 1;
        }

        .alerts-premium-page .loading-state-padding {
          padding: 10rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .alerts-premium-page .loading-title {
          font-weight: 950;
          letter-spacing: 0.2em;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .alerts-premium-page .empty-state-card {
          padding: 10rem 0;
          background: var(--bg-card);
          border-radius: 40px;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
        }

        .alerts-premium-page .empty-state-icon {
          opacity: 0.15;
          color: var(--success);
          margin-bottom: 1rem;
        }

        .alerts-premium-page .empty-state-title {
          font-size: 2.5rem;
          font-weight: 950;
          letter-spacing: -0.04em;
          color: var(--text-primary);
        }

        .alerts-premium-page .empty-state-sub {
          color: var(--text-secondary);
          font-size: 1.25rem;
          max-width: 500px;
        }

        .alerts-premium-page .alert-card-title-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .alerts-premium-page .alert-card-title {
          font-weight: 900;
          font-size: 1.35rem;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin: 0;
        }

        .alerts-premium-page .severity-badge {
          font-size: 0.7rem;
          font-weight: 900;
          padding: 0.35rem 0.85rem;
          border-radius: 8px;
          text-transform: uppercase;
          background: var(--alert-color-ghost);
          color: var(--alert-color);
          letter-spacing: 0.05em;
        }

        .alerts-premium-page .alert-card-desc {
          color: var(--text-secondary);
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .alerts-premium-page .footer-banner {
          margin-top: 4rem;
          padding: 2rem;
          background: var(--surface-soft);
          border-radius: 24px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .alerts-premium-page .footer-banner-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin: 0;
          line-height: 1.6;
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">Neural Surveillance</p>
          <h1>Critical Matrix</h1>
          <p>
            Real-time orchestration of operational interventions, upcoming
            liabilities, and expiring security clearances.
          </p>
        </div>
        <div className="header-metric-box">
          <div
            className="metric-badge-premium"
            role="status"
            aria-label={`${alerts.length} active threats identified`}
          >
            <Activity size={24} className="text-primary" aria-hidden="true" />
            <div>
              <p className="metric-badge-label">Active Threats</p>
              <p className="metric-badge-value">{alerts.length}</p>
            </div>
          </div>
        </div>
      </header>

      <section aria-label="System Alerts Matrix">
        {loading ? (
          <div className="loading-state-padding" aria-busy="true">
            <Zap
              size={64}
              className="animate-pulse"
              color="var(--primary)"
              aria-hidden="true"
            />
            <h2 className="loading-title">SYNCHRONIZING THREAT VECTORS...</h2>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state-card" role="status">
            <BellRing
              size={80}
              className="empty-state-icon"
              aria-hidden="true"
            />
            <h2 className="empty-state-title">Operational Clarity</h2>
            <p className="empty-state-sub">
              The system matrix is fully optimized. No pending interventions
              required at this coordinate.
            </p>
          </div>
        ) : (
          <div
            className="threat-matrix"
            role="list"
            aria-label="Prioritized interventions"
          >
            <AnimatePresence>
              {alerts.map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <motion.article
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="premium-alert-card"
                    role="listitem"
                    aria-labelledby={`alert-title-${alert.id}`}
                    style={
                      {
                        "--alert-color": alert.color,
                        "--alert-color-soft": `${alert.color}10`,
                        "--alert-color-border": `${alert.color}20`,
                        "--alert-color-ghost": `${alert.color}15`,
                        "--alert-color-glow": `${alert.color}30`,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className="alert-severity-indicator"
                      aria-hidden="true"
                    />

                    <div className="alert-icon-box">
                      <Icon size={28} aria-hidden="true" />
                    </div>

                    <div className="alert-content-wrap">
                      <div className="alert-card-title-row">
                        <h3
                          className="alert-card-title"
                          id={`alert-title-${alert.id}`}
                        >
                          {alert.title}
                        </h3>
                        <span className="severity-badge">
                          {alert.severity} PRIORITY
                        </span>
                      </div>
                      <p className="alert-card-desc">{alert.description}</p>
                    </div>

                    <button
                      type="button"
                      className="action-trigger"
                      aria-label={`Execute intervention: ${alert.actionItem} for ${alert.title}`}
                    >
                      <span>{alert.actionItem}</span>
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      <footer className="footer-banner">
        <ShieldAlert size={28} className="text-secondary" aria-hidden="true" />
        <p className="footer-banner-text">
          System interventions are prioritized by neural risk factors. Automated
          audits are performed every 12 hours to maintain operational integrity
          across all data endpoints.
        </p>
      </footer>
    </div>
  );
};

export default memo(AlertsManager);
