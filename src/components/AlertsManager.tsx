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
      `}</style>

      <header className="page-hero">
        <div className="hero-content">
          <p className="eyebrow">Neural Monitoring</p>
          <h1>Threat Intel Matrix</h1>
          <p>Real-time synchronization of upcoming liabilities, expiring intel, and system interventions.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="metric-badge" style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={18} className="text-primary" />
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Threats</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 900 }}>{alerts.length}</p>
            </div>
          </div>
        </div>
      </header>

      <section>
        {loading ? (
          <div className="empty-state" style={{ padding: '8rem' }}>
            <Zap size={48} className="animate-pulse" color="var(--primary)" />
            <h2 style={{ marginTop: '1.5rem', fontWeight: 900 }}>SCANNING THREAT VECTORS...</h2>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state" style={{ padding: '8rem', background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border)' }}>
            <BellRing size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h2 style={{ fontWeight: 950 }}>ALL CLEAR</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>The operational matrix is fully optimized. No pending threats detected.</p>
          </div>
        ) : (
          <div className="threat-matrix">
            <AnimatePresence>
              {alerts.map((alert, index) => {
                const Icon = alert.icon
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="premium-alert-card"
                  >
                    <div className="alert-severity-indicator" style={{ background: alert.color }} />
                    
                    <div className="alert-icon-box" style={{ background: `${alert.color}10`, color: alert.color, border: `1px solid ${alert.color}20` }}>
                      <Icon size={24} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{alert.title}</h3>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, padding: '0.25rem 0.6rem', background: `${alert.color}15`, color: alert.color, borderRadius: '4px', textTransform: 'uppercase' }}>
                          {alert.severity} PRIORITY
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>{alert.description}</p>
                    </div>

                    <button className="action-trigger" style={{ background: alert.color, color: 'white', boxShadow: `0 8px 16px ${alert.color}30` }}>
                      {alert.actionItem} <ArrowRight size={14} />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--surface-soft)', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ShieldAlert size={20} className="text-secondary" />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          This matrix represents prioritized operational interventions. System audits are performed every 24 hours to identify new threat vectors.
        </p>
      </div>
    </div>
  )
}

export default memo(AlertsManager)
