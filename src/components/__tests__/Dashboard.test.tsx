import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Dashboard from '../Dashboard'

const mockBills = [
  { id: '1', name: 'Rent', amount: 5000, dueDate: '2026-05-01', status: 'paid', category: 'Rent', vendor: 'Test Vendor', location: 'HQ' },
  { id: '2', name: 'Utilities', amount: 500, dueDate: '2026-05-05', status: 'pending', category: 'Utilities', vendor: 'Test Vendor', location: 'HQ' },
]

const mockStats = {
  totalPaid: 5000,
  totalPending: 500,
  totalOverdue: 0,
  overdueCount: 0,
}

describe('Dashboard', () => {
  it('renders without crashing', () => {
    const { container } = render(<Dashboard stats={mockStats} bills={mockBills} />)
    expect(container).toBeTruthy()
  })

  it('renders stat cards', () => {
    const { container } = render(<Dashboard stats={mockStats} bills={mockBills} />)
    const statCards = container.querySelectorAll('.glass-card')
    expect(statCards.length).toBeGreaterThan(0)
  })
})
