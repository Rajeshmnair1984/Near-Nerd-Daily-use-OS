export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export interface DashboardStats {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  overdueCount: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
