import { memo, useMemo, FC } from 'react'
import { AlertCircle, Clock, FileText, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
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
        title: `Overdue: ${bill.charge_name}`,
        description: `Due: ${bill.date} • Amount: ${formatCurrency(bill.amount)}`,
        icon: AlertCircle,
        color: '#ef4444',
        actionItem: 'Pay immediately'
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
          title: `Due soon: ${bill.charge_name}`,
          description: `Due: ${bill.date} • Amount: ${formatCurrency(bill.amount)}`,
          icon: Clock,
          color: '#f59e0b',
          actionItem: 'Schedule payment'
        })
      }
    })

    // Missing or needs review documents
    documents.filter(d => d.status === 'Needs Review').forEach(doc => {
      allAlerts.push({
        id: `doc-${doc.id}`,
        type: 'missingDoc',
        title: `Document needs review: ${doc.title}`,
        description: `Category: ${doc.category}${doc.owner ? ` • Owner: ${doc.owner}` : ''}`,
        icon: FileText,
        color: '#f59e0b',
        actionItem: 'Review document'
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
          title: `Renewal coming: ${doc.title}`,
          description: `Renews: ${doc.renewal_date} • ${daysUntilRenewal} days remaining`,
          icon: RefreshCw,
          color: '#06b6d4',
          actionItem: 'Renew soon'
        })
      }
    })

    return allAlerts.slice(0, 12)
  }, [bills, documents])

  return (
    <div className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Alerts & Notifications</h1>
          <p>Stay on top of upcoming payments, renewals, and document reviews.</p>
        </div>
      </header>

      <section className="panel bill-panel">
        {loading ? (
          <div className="empty-state">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>All clear! No pending items or upcoming due dates.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.map((alert) => {
              const Icon = alert.icon
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1.25rem',
                    background: 'white',
                    border: `2px solid ${alert.color}20`,
                    borderLeft: `4px solid ${alert.color}`,
                    borderRadius: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      background: `${alert.color}15`,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      color: alert.color,
                      flex: 0,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {alert.title}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      {alert.description}
                    </p>
                    <button
                      style={{
                        background: alert.color,
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {alert.actionItem}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default memo(AlertsManager)
