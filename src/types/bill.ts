export type BillStatus = 'Paid' | 'Pending' | 'Overdue'
export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'once'

export interface Bill {
  id: string
  charge_name: string
  amount: number
  date: string
  location_id: string
  category: string
  status: BillStatus
  is_recurring?: boolean
  vendor_id?: string
  invoice_number?: string
  payment_method?: string
  notes?: string
  due_date?: string
  paid_date?: string
  gst_amount?: number
  pst_amount?: number
  subtotal?: number
  tax_total?: number
  recurring_frequency?: RecurringFrequency
  recurring_end_date?: string
  created_at?: string
}

export interface CreateBillInput {
  charge_name: string
  amount: number
  date: string
  location_id: string
  category: string
  status?: BillStatus
  is_recurring?: boolean
  vendor_id?: string
  invoice_number?: string
  payment_method?: string
  notes?: string
  due_date?: string
  paid_date?: string
  gst_amount?: number
  pst_amount?: number
  subtotal?: number
  tax_total?: number
  recurring_frequency?: RecurringFrequency
  recurring_end_date?: string
}

export interface UpdateBillInput {
  charge_name?: string
  amount?: number
  date?: string
  location_id?: string
  category?: string
  status?: BillStatus
  is_recurring?: boolean
  vendor_id?: string
  invoice_number?: string
  payment_method?: string
  notes?: string
  due_date?: string
  paid_date?: string
  gst_amount?: number
  pst_amount?: number
  subtotal?: number
  tax_total?: number
  recurring_frequency?: RecurringFrequency
  recurring_end_date?: string
}
