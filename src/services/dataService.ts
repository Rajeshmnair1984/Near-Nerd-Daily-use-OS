import { isSupabaseConfigured, supabase } from './supabaseClient';
import { Bill, CreateBillInput, UpdateBillInput } from '@/types/bill';
import { CreateDocumentInput, DocumentRecord } from '@/types/document';
import { Location, CreateLocationInput } from '@/types/location';
import { CreateVendorInput, UpdateVendorInput, Vendor } from '@/types/vendor';
import { DashboardStats, ApiError } from '@/types/common';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  org_id: string;
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'USER';
  full_name: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DataService {
  private billsCache: CacheEntry<Bill[]> | null = null;
  private locationsCache: CacheEntry<Location[]> | null = null;
  private vendorsCache: CacheEntry<Vendor[]> | null = null;
  private documentsCache: CacheEntry<DocumentRecord[]> | null = null;

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

  async addLocation(location: CreateLocationInput): Promise<Location> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to save locations.');
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([location])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const newLocation = data?.[0];
      if (newLocation) {
        this.invalidateCache();
      }
      return newLocation;
    } catch (error) {
      throw this.handleError(error, 'Failed to add location');
    }
  }

  async deleteLocation(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to delete locations.');
    }

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      this.invalidateCache();
    } catch (error) {
      throw this.handleError(error, 'Failed to delete location');
    }
  }

  async getVendors(): Promise<Vendor[]> {
    if (this.isCacheValid(this.vendorsCache)) {
      return this.vendorsCache!.data;
    }

    const cached = this.getFromLocalStorage<Vendor[]>('vendors_cache');
    if (cached) {
      this.vendorsCache = { data: cached, timestamp: Date.now() };
      return cached;
    }

    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      this.vendorsCache = { data: data || [], timestamp: Date.now() };
      this.saveToLocalStorage('vendors_cache', data || []);
      return data || [];
    } catch (error) {
      const cached = this.getFromLocalStorage<Vendor[]>('vendors_cache');
      if (cached) {
        console.warn('Failed to fetch vendors, using cached data');
        return cached;
      }
      throw this.handleError(error, 'Failed to fetch vendors');
    }
  }

  async getDocuments(): Promise<DocumentRecord[]> {
    if (this.isCacheValid(this.documentsCache)) {
      return this.documentsCache!.data;
    }

    const cached = this.getFromLocalStorage<DocumentRecord[]>('documents_cache');
    if (cached) {
      this.documentsCache = { data: cached, timestamp: Date.now() };
      return cached;
    }

    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      this.documentsCache = { data: data || [], timestamp: Date.now() };
      this.saveToLocalStorage('documents_cache', data || []);
      return data || [];
    } catch (error) {
      const cached = this.getFromLocalStorage<DocumentRecord[]>('documents_cache');
      if (cached) {
        console.warn('Failed to fetch documents, using cached data');
        return cached;
      }
      throw this.handleError(error, 'Failed to fetch documents');
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

  async addVendor(vendor: CreateVendorInput): Promise<Vendor> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to save vendors.');
    }

    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([{ ...vendor, status: vendor.status || 'Active' }])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const newVendor = data?.[0];
      if (newVendor) {
        this.invalidateCache();
      }
      return newVendor;
    } catch (error) {
      throw this.handleError(error, 'Failed to add vendor');
    }
  }

  async addDocument(document: CreateDocumentInput): Promise<DocumentRecord> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to save documents.');
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{ ...document, status: document.status || 'Active' }])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const newDocument = data?.[0];
      if (newDocument) {
        this.invalidateCache();
      }
      return newDocument;
    } catch (error) {
      throw this.handleError(error, 'Failed to add document');
    }
  }

  async deleteDocument(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to delete documents.');
    }

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      this.invalidateCache();
    } catch (error) {
      throw this.handleError(error, 'Failed to delete document');
    }
  }

  async updateVendor(id: string, vendor: UpdateVendorInput): Promise<Vendor> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to update vendors.');
    }

    try {
      const { data, error } = await supabase
        .from('vendors')
        .update(vendor)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const updatedVendor = data?.[0];
      if (updatedVendor) {
        this.invalidateCache();
      }
      return updatedVendor;
    } catch (error) {
      throw this.handleError(error, 'Failed to update vendor');
    }
  }

  async deleteVendor(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to delete vendors.');
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      this.invalidateCache();
    } catch (error) {
      throw this.handleError(error, 'Failed to delete vendor');
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

  async createOrganization(name: string, domain: string, adminEmail: string): Promise<Organization> {
    try {
      // 1. Create Organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name, domain }])
        .select()
        .single();

      if (orgError) throw orgError;

      // 2. Trigger Supabase Auth Invite (this sends the email)
      // Note: This requires the Service Role Key or a Supabase Edge Function
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(adminEmail, {
        data: { 
          org_id: org.id,
          role: 'ORG_ADMIN'
        }
      });

      if (inviteError) console.warn('Invite sent but check service role key permissions:', inviteError.message);

      return org;
    } catch (error) {
      throw this.handleError(error, 'Failed to create organization');
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    const { data, error } = await supabase.from('organizations').select('*');
    if (error) throw error;
    return data || [];
  }

  private invalidateCache(): void {
    this.billsCache = null;
    this.locationsCache = null;
    this.vendorsCache = null;
    this.documentsCache = null;
    localStorage.removeItem('bills_cache');
    localStorage.removeItem('locations_cache');
    localStorage.removeItem('vendors_cache');
    localStorage.removeItem('documents_cache');
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
