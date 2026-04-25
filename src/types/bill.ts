export type BillStatus = 'Paid' | 'Pending' | 'Overdue';

export interface Bill {
  id: string;
  charge_name: string;
  amount: number;
  date: string;
  location_id: string;
  category: string;
  status: BillStatus;
  is_recurring?: boolean;
  created_at?: string;
}

export interface CreateBillInput {
  charge_name: string;
  amount: number;
  date: string;
  location_id: string;
  category: string;
  status?: BillStatus;
  is_recurring?: boolean;
}

export interface UpdateBillInput {
  charge_name?: string;
  amount?: number;
  date?: string;
  location_id?: string;
  category?: string;
  status?: BillStatus;
  is_recurring?: boolean;
}
