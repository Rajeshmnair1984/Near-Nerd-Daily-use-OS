import { useState, memo, useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Bill } from '@/types/bill';

interface CalendarViewProps {
  bills: Bill[];
  loading?: boolean;
}

function CalendarView({ bills, loading }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const billsByDate = useMemo(() => {
    const map = new Map<string, Bill[]>();
    bills.forEach((bill) => {
      const key = bill.date;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(bill);
    });
    return map;
  }, [bills]);

  const renderHeader = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '0 2rem',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          style={{
            padding: '0.5rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          style={{
            padding: '0.5rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem',
        padding: '0 2rem',
      }}
    >
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          style={{
            textAlign: 'center',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            padding: '0.75rem',
          }}
        >
          {day}
        </div>
      ))}
    </div>
  );

  const renderCells = () => (
    <div
      className="calendar-body"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.5rem',
        padding: '0 2rem',
      }}
    >
      {calendarDays.map((day, index) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayBills = billsByDate.get(dayStr) || [];
        const isCurrentMonth = isSameMonth(day, currentMonth);

        return (
          <div
            key={index}
            className="calendar-cell"
            style={{
              minHeight: '120px',
              padding: '0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              background: isCurrentMonth
                ? 'rgba(255, 255, 255, 0.92)'
                : 'rgba(249, 250, 251, 0.7)',
              opacity: isCurrentMonth ? 1 : 0.5,
            }}
          >
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: isCurrentMonth
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
              }}
            >
              {format(day, 'd')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {dayBills.slice(0, 2).map((bill) => (
                <div
                  key={bill.id}
                  style={{
                    fontSize: '0.625rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    background:
                      bill.status === 'Paid'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(99, 102, 241, 0.2)',
                    color:
                      bill.status === 'Paid'
                        ? 'var(--status-paid)'
                        : 'var(--primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={`${bill.charge_name}: $${bill.amount}`}
                >
                  ${bill.amount}
                </div>
              ))}
              {dayBills.length > 2 && (
                <div
                  style={{
                    fontSize: '0.625rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                  }}
                >
                  +{dayBills.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '100vh' }}>
      <header className="page-hero" style={{ padding: '0 2.5rem' }}>
        <div>
        <p className="eyebrow">Schedule</p>
        <h1>
          Calendar
        </h1>
        <p>
          View your bills and due dates in a calendar format.
        </p>
        </div>
      </header>

      <div className="panel" style={{ margin: '2rem', padding: '2rem' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading calendar...
          </div>
        ) : bills.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No due dates to show yet.
          </div>
        ) : (
          <>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </>
        )}
      </div>
    </div>
  );
}

export default memo(CalendarView);
