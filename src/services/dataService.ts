import { isSupabaseConfigured, supabase } from './supabaseClient';
import { Bill, CreateBillInput, UpdateBillInput } from '@/types/bill';
import { Location, CreateLocationInput } from '@/types/location';
import { DashboardStats, ApiError } from '@/types/common';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DataService {
  private billsCache: CacheEntry<Bill[]> | null = null;
  private locationsCache: CacheEntry<Location[]> | null = null;

  private isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CACHE_DURATION;
  }

  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private saveToLocalStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
    }
  }

  async getLocations(): Promise<Location[]> {
    // Check memory cache
    if (this.isCacheValid(this.locationsCache)) {
      return this.locationsCache!.data;
    }

    // Check localStorage
    const cached = this.getFromLocalStorage<Location[]>('locations_cache');
    if (cached) {
      this.locationsCache = { data: cached, timestamp: Date.now() };
      return cached;
    }

    if (!isSupabaseConfigured) {
      return [];
    }

    // Fetch from Supabase
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      this.locationsCache = { data: data || [], timestamp: Date.now() };
      this.saveToLocalStorage('locations_cache', data || []);
      return data || [];
    } catch (error) {
      const cached = this.getFromLocalStorage<Location[]>('locations_cache');
      if (cached) {
        console.warn('Failed to fetch locations, using cached data');
        return cached;
      }
      throw this.handleError(error, 'Failed to fetch locations');
    }
  }

  async getBills(): Promise<Bill[]> {
    // Check memory cache
    if (this.isCacheValid(this.billsCache)) {
      return this.billsCache!.data;
    }

    // Check localStorage
    const cached = this.getFromLocalStorage<Bill[]>('bills_cache');
    if (cached) {
      this.billsCache = { data: cached, timestamp: Date.now() };
      return cached;
    }

    if (!isSupabaseConfigured) {
      return [];
    }

    // Fetch from Supabase
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      this.billsCache = { data: data || [], timestamp: Date.now() };
      this.saveToLocalStorage('bills_cache', data || []);
      return data || [];
    } catch (error) {
      const cached = this.getFromLocalStorage<Bill[]>('bills_cache');
      if (cached) {
        console.warn('Failed to fetch bills, using cached data');
        return cached;
      }
      throw this.handleError(error, 'Failed to fetch bills');
    }
  }

  async addBill(bill: CreateBillInput): Promise<Bill> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to save bills.');
    }

    try {
      const { data, error } = await supabase
        .from('bills')
        .insert([bill])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const newBill = data?.[0];
      if (newBill) {
        this.invalidateCache();
      }
      return newBill;
    } catch (error) {
      throw this.handleError(error, 'Failed to add bill');
    }
  }

  async updateBillStatus(id: string, status: string): Promise<Bill> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to update bills.');
    }

    try {
      const { data, error } = await supabase
        .from('bills')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const updated = data?.[0];
      if (updated) {
        // Logic for recurring bills
        if (status === 'Paid' && updated.is_recurring) {
          const nextDate = new Date(updated.date);
          nextDate.setMonth(nextDate.getMonth() + 1);
          
          const { error: nextError } = await supabase
            .from('bills')
            .insert([{
              ...updated,
              id: undefined,
              status: 'Pending',
              date: nextDate.toISOString().split('T')[0],
              created_at: undefined
            }]);
          
          if (nextError) console.error('Error creating next recurring bill:', nextError);
        }
        this.invalidateCache();
      }
      return updated;
    } catch (error) {
      throw this.handleError(error, 'Failed to update bill status');
    }
  }

  async updateBill(id: string, billData: UpdateBillInput): Promise<Bill> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to update bills.');
    }

    try {
      const { data, error } = await supabase
        .from('bills')
        .update(billData)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const updated = data?.[0];
      if (updated) {
        this.invalidateCache();
      }
      return updated;
    } catch (error) {
      throw this.handleError(error, 'Failed to update bill');
    }
  }

  async deleteBill(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to delete bills.');
    }

    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      this.invalidateCache();
    } catch (error) {
      throw this.handleError(error, 'Failed to delete bill');
    }
  }

  async getBillById(id: string): Promise<Bill | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return data || null;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch bill');
    }
  }

  getDashboardStats(bills: Bill[]): DashboardStats {
    if (!bills || bills.length === 0) {
      return { totalPaid: 0, totalPending: 0, totalOverdue: 0, overdueCount: 0 };
    }

    const paid = bills
      .filter((b) => b.status === 'Paid')
      .reduce((acc, b) => acc + b.amount, 0);

    const pending = bills
      .filter((b) => b.status === 'Pending')
      .reduce((acc, b) => acc + b.amount, 0);

    const overdue = bills.filter((b) => b.status === 'Overdue');
    const overdueTotal = overdue.reduce((acc, b) => acc + b.amount, 0);

    return {
      totalPaid: paid,
      totalPending: pending,
      totalOverdue: overdueTotal,
      overdueCount: overdue.length,
    };
  }

  private invalidateCache(): void {
    this.billsCache = null;
    this.locationsCache = null;
    localStorage.removeItem('bills_cache');
    localStorage.removeItem('locations_cache');
  }

  private handleError(error: unknown, fallbackMessage: string): ApiError {
    if (error instanceof Error) {
      return {
        code: 'ERROR',
        message: error.message || fallbackMessage,
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: fallbackMessage,
    };
  }
}

export const dataService = new DataService();
