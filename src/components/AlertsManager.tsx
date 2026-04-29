import { memo, useMemo, FC } from 'react'
import { AlertCircle, Clock, FileText, RefreshCw, Zap, ShieldAlert, ArrowRight, Activity, BellRing } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bill } from '@/types/bill'
import { DocumentRecord } from '@/types/document'
import { formatCurrency } from '@/utils/currency'

interface AlertsManagerProps {
  bills: Bill[]
  documents: DocumentRecord[]
  loading?: boolean
}

interface Alert {
  id: string
  type: 'overdue' | 'dueSoon' | 'missingDoc' | 'renewal'
  title: string
  description: string
  icon: React.ComponentType<{ size: number }>
  color: string
  actionItem: string
  severity: 'high' | 'medium' | 'low'
}

const AlertsManager: FC<AlertsManagerProps> = ({ bills, documents, loading }) => {
  const alerts = useMemo<Alert[]>(() => {
    const allAlerts: Alert[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Overdue bills
    bills.filter(b => b.status === 'Overdue').forEach(bill => {
      allAlerts.push({
        id: `overdue-${bill.id}`,
        type: 'overdue',
        title: `Overdue Payment: ${bill.charge_name}`,
        description: `Settlement coordinate: ${bill.date} • Impact: ${formatCurrency(bill.amount)}`,
        icon: AlertCircle,
        color: '#ef4444',
        actionItem: 'SETTLE IMMEDIATELY',
        severity: 'high'
      })
    })

    // Bills due within next 7 days
    bills.filter(b => b.status === 'Pending').forEach(bill => {
      const dueDate = new Date(bill.date)
      dueDate.setHours(0, 0, 0, 0)
      if (dueDate > today && dueDate <= nextWeek) {
        allAlerts.push({
          id: `dueSoon-${bill.id}`,
          type: 'dueSoon',
          title: `Imminent Commitment: ${bill.charge_name}`,
          description: `Timeline coordinate: ${bill.date} • Volume: ${formatCurrency(bill.amount)}`,
          icon: Clock,
          color: '#f59e0b',
          actionItem: 'ORCHESTRATE PAYMENT',
          severity: 'medium'
        })
      }
    })

    // Missing or needs review documents
    documents.filter(d => d.status === 'Needs Review').forEach(doc => {
      allAlerts.push({
        id: `doc-${doc.id}`,
        type: 'missingDoc',
        title: `Vault Review Required: ${doc.title}`,
        description: `Intel Category: ${doc.category}${doc.owner ? ` • Entity: ${doc.owner}` : ''}`,
        icon: FileText,
        color: '#0071e3',
        actionItem: 'VERIFY INTEL',
        severity: 'medium'
      })
    })

    // Document renewals coming up
    documents.filter(d => d.renewal_date).forEach(doc => {
      const renewalDate = new Date(doc.renewal_date!)
      renewalDate.setHours(0, 0, 0, 0)
      const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilRenewal <= 30 && daysUntilRenewal > 0) {
        allAlerts.push({
          id: `renewal-${doc.id}`,
          type: 'renewal',
          title: `Vault Renewal Approaching: ${doc.title}`,
          description: `Renewal coordinate: ${doc.renewal_date} • ${daysUntilRenewal} days remaining`,
          icon: RefreshCw,
          color: '#34a853',
          actionItem: 'EXTEND CLEARANCE',
          severity: 'low'
        })
      }
    })

    return allAlerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    }).slice(0, 15)
  }, [bills, documents])

  return (
    <div className="page-shell alerts-premium-page">
      <style>{`
        .alerts-premium-page .page-hero {
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

        .alerts-premium-page .hero-content h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          background: linear-gradient(to right, var(--text-primary), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .alerts-premium-page .threat-matrix {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .alerts-premium-page .premium-alert-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid var(--border);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1.5rem;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .alerts-premium-page .premium-alert-card:hover {
          transform: translateX(4px);
          box-shadow: var(--shadow-sm);
        }

        .alerts-premium-page .alert-severity-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }

        .alerts-premium-page .alert-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .alerts-premium-page .action-trigger {
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: var(--transition);
          cursor: pointer;
          border: none;
        }

        .alerts-premium-page .header-metric-box {
          display: flex;
          gap: 1rem;
        }

        .alerts-premium-page .metric-badge-premium {
          padding: 0.75rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .alerts-premium-page .metric-badge-label {
          font-size: 0.6rem;
          font-weight: 900;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .alerts-premium-page .metric-badge-value {
          font-size: 1.25rem;
          font-weight: 900;
        }

        .alerts-premium-page .loading-state-padding {
          padding: 8rem;
        }

        .alerts-premium-page .loading-title {
          margin-top: 1.5rem;
          font-weight: 900;
        }

        .alerts-premium-page .empty-state-card {
          padding: 8rem;
          background: var(--bg-card);
          border-radius: 32px;
          border: 1px solid var(--border);
        }

        .alerts-premium-page .empty-state-icon {
          opacity: 0.1;
          margin-bottom: 1.5rem;
        }

        .alerts-premium-page .empty-state-title {
          font-weight: 950;
        }

        .alerts-premium-page .empty-state-sub {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .alerts-premium-page .alert-card-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .alerts-premium-page .alert-card-title {
          font-weight: 900;
          font-size: 1.1rem;
          letter-spacing: -0.02em;
        }

        .alerts-premium-page .severity-badge {
          font-size: 0.65rem;
          font-weight: 900;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .alerts-premium-page .alert-card-desc {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .alerts-premium-page .footer-banner {
          margin-top: 2.5rem;
          padding: 1.5rem;
          background: var(--surface-soft);
          border-radius: 20px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .alerts-premium-page .footer-banner-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">Neural Monitoring</p>
          <h1>Threat Intel Matrix</h1>
          <p>Real-time synchronization of upcoming liabilities, expiring intel, and system interventions.</p>
        </div>
        <div className="header-metric-box">
          <div className="metric-badge-premium">
            <Activity size={18} className="text-primary" />
            <div>
              <p className="metric-badge-label">Active Threats</p>
              <p className="metric-badge-value">{alerts.length}</p>
            </div>
          </div>
        </div>
      </header>

      <section>
        {loading ? (
          <div className="empty-state loading-state-padding">
            <Zap size={48} className="animate-pulse" color="var(--primary)" />
            <h2 className="loading-title">SCANNING THREAT VECTORS...</h2>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state empty-state-card">
            <BellRing size={64} className="empty-state-icon" />
            <h2 className="empty-state-title">ALL CLEAR</h2>
            <p className="empty-state-sub">The operational matrix is fully optimized. No pending threats detected.</p>
          </div>
        ) : (
          <div className="threat-matrix" role="list">
            <AnimatePresence>
              {alerts.map((alert, index) => {
                const Icon = alert.icon
                return (
                  <motion.article
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="premium-alert-card"
                    role="listitem"
                  >
                    <div className="alert-severity-indicator" style={{ background: alert.color }} />
                    
                    <div className="alert-icon-box" style={{ background: `${alert.color}10`, color: alert.color, border: `1px solid ${alert.color}20` }}>
                      <Icon size={24} aria-hidden="true" />
                    </div>

                    <div>
                      <div className="alert-card-title-row">
                        <h3 className="alert-card-title">{alert.title}</h3>
                        <span className="severity-badge" style={{ background: `${alert.color}15`, color: alert.color }}>
                          {alert.severity} PRIORITY
                        </span>
                      </div>
                      <p className="alert-card-desc">{alert.description}</p>
                    </div>

                    <button 
                      className="action-trigger" 
                      style={{ background: alert.color, color: 'white', boxShadow: `0 8px 16px ${alert.color}30` }}
                      title={`Execute action: ${alert.actionItem} for ${alert.title}`}
                    >
                      {alert.actionItem} <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      <div className="footer-banner">
        <ShieldAlert size={20} className="text-secondary" />
        <p className="footer-banner-text">
          This matrix represents prioritized operational interventions. System audits are performed every 24 hours to identify new threat vectors.
        </p>
      </div>
    </div>
  )
}

export default memo(AlertsManager)
