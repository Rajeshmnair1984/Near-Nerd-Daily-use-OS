import { memo, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Bill } from '@/types/bill';
import { formatCurrency } from '@/utils/currency';

interface CalendarViewProps {
  bills: Bill[];
  loading?: boolean;
}

function CalendarView({ bills, loading }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(monthEnd),
  });

  const billsByDate = useMemo(() => {
    const map = new Map<string, Bill[]>();
    bills.forEach((bill) => {
      if (!map.has(bill.date)) {
        map.set(bill.date, []);
      }
      map.get(bill.date)!.push(bill);
    });
    return map;
  }, [bills]);

  const monthBills = useMemo(
    () =>
      bills
        .filter((bill) => isSameMonth(parseISO(bill.date), currentMonth))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [bills, currentMonth]
  );

  const monthlyTotal = monthBills.reduce((total, bill) => total + Number(bill.amount), 0);
  const unpaidCount = monthBills.filter((bill) => bill.status !== 'Paid').length;
  const nextDueBills = monthBills.filter((bill) => bill.status !== 'Paid').slice(0, 5);

  return (
    <div className="page-shell">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Schedule</p>
          <h1>Calendar</h1>
          <p>See the month ahead, due dates, and payment pressure without digging through rows.</p>
        </div>
      </header>

      <div className="metric-strip">
        <div>
          <span>This month</span>
          <strong>{monthBills.length}</strong>
        </div>
        <div>
          <span>Unpaid items</span>
          <strong>{unpaidCount}</strong>
        </div>
        <div>
          <span>Scheduled total</span>
          <strong>{formatCurrency(monthlyTotal)}</strong>
        </div>
      </div>

      <section className="calendar-layout">
        <div className="panel calendar-panel">
          <div className="calendar-header">
            <div>
              <p className="eyebrow">Month View</p>
              <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
            </div>
            <div className="calendar-actions">
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft size={20} />
              </button>
              <button className="button-secondary" onClick={() => setCurrentMonth(new Date())}>
                Today
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading calendar...</div>
          ) : bills.length === 0 ? (
            <div className="empty-state calendar-empty">
              <CalendarDays size={50} />
              <p>No bill dates yet. Add bills and they will appear here automatically.</p>
            </div>
          ) : (
            <>
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {calendarDays.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayBills = billsByDate.get(key) || [];
                  const current = isSameMonth(day, currentMonth);
                  const total = dayBills.reduce((sum, bill) => sum + Number(bill.amount), 0);

                  return (
                    <article
                      key={key}
                      className={`calendar-cell ${current ? '' : 'muted'} ${isToday(day) ? 'today' : ''}`}
                    >
                      <div className="calendar-date-row">
                        <span>{format(day, 'd')}</span>
                        {dayBills.length > 0 && <strong>{formatCurrency(total)}</strong>}
                      </div>
                      <div className="calendar-events">
                        {dayBills.slice(0, 3).map((bill) => (
                          <div
                            key={bill.id}
                            className={`calendar-event status-${bill.status.toLowerCase()}`}
                            title={`${bill.charge_name}: ${formatCurrency(bill.amount)}`}
                          >
                            <span>{bill.charge_name}</span>
                            <strong>{formatCurrency(bill.amount)}</strong>
                          </div>
                        ))}
                        {dayBills.length > 3 && (
                          <span className="calendar-more">+{dayBills.length - 3} more</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <aside className="panel agenda-panel">
          <div className="agenda-title">
            <Clock size={18} />
            <h2>Next Due</h2>
          </div>
          {nextDueBills.length === 0 ? (
            <div className="agenda-empty">No unpaid bills scheduled this month.</div>
          ) : (
            <div className="agenda-list">
              {nextDueBills.map((bill) => (
                <article key={bill.id} className="agenda-item">
                  <div>
                    <strong>{bill.charge_name}</strong>
                    <span>{format(parseISO(bill.date), 'MMM d')} · {bill.category}</span>
                  </div>
                  <p>
                    <span>CAD</span>
                    {formatCurrency(bill.amount)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

export default memo(CalendarView);
