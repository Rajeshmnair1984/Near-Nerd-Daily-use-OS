export type BillStatus = 'Paid' | 'Pending' | 'Overdue';

export interface Bill {
  id: string;
  charge_name: string;
  amount: number;
  date: string;
  location_id: string;
  category: string;
  status: BillStatus;
  created_at?: string;
}

export interface CreateBillInput {
  charge_name: string;
  amount: number;
  date: string;
  location_id: string;
  category: string;
  status?: BillStatus;
}

export interface UpdateBillInput {
  charge_name?: string;
  amount?: number;
  date?: string;
  location_id?: string;
  category?: string;
  status?: BillStatus;
}
