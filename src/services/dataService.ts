import { isSupabaseConfigured, supabase } from './supabaseClient';
import { Bill, CreateBillInput, UpdateBillInput } from '@/types/bill';
import { CreateDocumentInput, DocumentRecord } from '@/types/document';
import { Location, CreateLocationInput } from '@/types/location';
import { CreateVendorInput, UpdateVendorInput, Vendor } from '@/types/vendor';
import { DashboardStats, ApiError } from '@/types/common';
import { zapierService } from './zapierService';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  org_id: string;
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'USER';
  full_name: string;
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to determine if a bill is overdue
function isOverdue(bill: Bill): boolean {
  // If explicitly marked as Overdue, return true
  if (bill.status === 'Overdue') return true

  // If bill is already Paid, it's not overdue
  if (bill.status === 'Paid') return false

  // Check if due_date is in the past
  if (bill.due_date) {
    const dueDate = new Date(bill.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  return false
}

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

  private handleFetchError<T>(error: unknown, cacheKey: string, fallbackData: T): T {
    if (isSupabaseConfigured) {
      throw new Error(`Failed to fetch ${cacheKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    const cached = this.getFromLocalStorage<T>(cacheKey);
    if (cached) {
      console.warn(`Failed to fetch ${cacheKey}, using cached data`);
      return cached;
    }
    console.warn(`Failed to fetch ${cacheKey}, using fallback`);
    return fallbackData;
  }

  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const parsed = JSON.parse(item);

      // Check if stored data has a TTL
      if (parsed && typeof parsed === 'object' && 'data' in parsed && 'timestamp' in parsed) {
        if (Date.now() - parsed.timestamp > CACHE_DURATION) {
          localStorage.removeItem(key);
          return null;
        }
        return parsed.data;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private saveToLocalStorage<T>(key: string, data: T): void {
    try {
      const cacheEntry = { data, timestamp: Date.now() };
      localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
    }
  }

  private getLocalRecords<T>(key: string): T[] {
    return this.getFromLocalStorage<T[]>(key) || [];
  }

  private saveLocalRecords<T>(key: string, records: T[]): void {
    this.saveToLocalStorage(key, records);
  }

  private createLocalRecord<T extends object>(record: T): T & { id: string; created_at: string } {
    return {
      ...record,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
  }

  private notifyZapier<T>(
    resource: 'bill' | 'location' | 'vendor' | 'document',
    action: 'created' | 'updated' | 'deleted' | 'status_changed',
    record?: T,
    metadata?: Record<string, unknown>
  ): void {
    void zapierService.sendEvent({
      resource,
      action,
      record,
      recordId: record && typeof record === 'object' && 'id' in record ? String(record.id) : undefined,
      metadata,
    }).catch((error) => {
      console.warn('Zapier notification failed:', error);
    });
  }

  private updateLocalRecord<T extends { id: string }>(key: string, id: string, patch: Partial<T>): T {
    const records = this.getLocalRecords<T>(key);
    const record = records.find((item) => item.id === id);

    if (!record) {
      throw new Error('Record not found');
    }

    const updated = { ...record, ...patch };
    this.saveLocalRecords(
      key,
      records.map((item) => (item.id === id ? updated : item))
    );
    return updated;
  }

  private deleteLocalRecord<T extends { id: string }>(key: string, id: string): void {
    this.saveLocalRecords(
      key,
      this.getLocalRecords<T>(key).filter((item) => item.id !== id)
    );
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
      return this.getLocalRecords<Location>('locations_cache');
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
      if (isSupabaseConfigured) {
        throw new Error(`Failed to fetch locations: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      const cached = this.getFromLocalStorage<Location[]>('locations_cache');
      if (cached) {
        console.warn('Failed to fetch locations, using cached data');
        return cached;
      }
      console.warn('Failed to fetch locations, using local workspace.', error);
      return [];
    }
  }

  async getBills(): Promise<Bill[]> {
    // Check memory cache
    if (this.isCacheValid(this.billsCache)) {
      return this.applyOverdueDetection(this.billsCache!.data)
    }

    // Check localStorage
    const cached = this.getFromLocalStorage<Bill[]>('bills_cache')
    if (cached) {
      const bills = this.applyOverdueDetection(cached)
      this.billsCache = { data: bills, timestamp: Date.now() }
      return bills
    }

    if (!isSupabaseConfigured) {
      return this.applyOverdueDetection(this.getLocalRecords<Bill>('bills_cache'))
    }

    // Fetch from Supabase
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('date', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      const bills = this.applyOverdueDetection(data || [])
      this.billsCache = { data: bills, timestamp: Date.now() }
      this.saveToLocalStorage('bills_cache', bills)
      return bills
    } catch (error) {
      if (isSupabaseConfigured) {
        throw new Error(`Failed to fetch bills: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      const cached = this.getFromLocalStorage<Bill[]>('bills_cache')
      if (cached) {
        console.warn('Failed to fetch bills, using cached data')
        return this.applyOverdueDetection(cached)
      }
      console.warn('Failed to fetch bills, using local workspace.', error)
      return []
    }
  }

  private applyOverdueDetection(bills: Bill[]): Bill[] {
    return bills.map((bill) => {
      if (bill.status !== 'Paid' && isOverdue(bill)) {
        return { ...bill, status: 'Overdue' as const }
      }
      return bill
    })
  }

  async addLocation(location: CreateLocationInput): Promise<Location> {
    if (!isSupabaseConfigured) {
      const newLocation = this.createLocalRecord(location);
      this.saveLocalRecords('locations_cache', [...this.getLocalRecords<Location>('locations_cache'), newLocation]);
      this.invalidateCache(false);
      this.notifyZapier('location', 'created', newLocation);
      return newLocation;
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
        this.notifyZapier('location', 'created', newLocation);
      }
      return newLocation;
    } catch (error) {
      console.warn('Failed to add location in Supabase, saving locally instead.', error);
      const newLocation = this.createLocalRecord(location);
      this.saveLocalRecords('locations_cache', [...this.getLocalRecords<Location>('locations_cache'), newLocation]);
      this.invalidateCache(false);
      this.notifyZapier('location', 'created', newLocation);
      return newLocation;
    }
  }

  async updateLocation(id: string, location: CreateLocationInput): Promise<Location> {
    if (!isSupabaseConfigured) {
      const updatedLocation = this.updateLocalRecord<Location>('locations_cache', id, location as Partial<Location>);
      this.invalidateCache(false);
      this.notifyZapier('location', 'updated', updatedLocation);
      return updatedLocation;
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .update(location)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const updatedLocation = data?.[0];
      if (updatedLocation) {
        this.invalidateCache();
        this.notifyZapier('location', 'updated', updatedLocation);
      }
      return updatedLocation;
    } catch (error) {
      console.warn('Failed to update location in Supabase, updating local record instead.', error);
      const updatedLocation = this.updateLocalRecord<Location>('locations_cache', id, location as Partial<Location>);
      this.invalidateCache(false);
      this.notifyZapier('location', 'updated', updatedLocation);
      return updatedLocation;
    }
  }

  async deleteLocation(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      this.deleteLocalRecord<Location>('locations_cache', id);
      this.invalidateCache(false);
      this.notifyZapier('location', 'deleted', undefined, { recordId: id });
      return;
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
      this.notifyZapier('location', 'deleted', undefined, { recordId: id });
    } catch (error) {
      console.warn('Failed to delete location in Supabase, deleting local record instead.', error);
      this.deleteLocalRecord<Location>('locations_cache', id);
      this.invalidateCache(false);
      this.notifyZapier('location', 'deleted', undefined, { recordId: id });
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
      return this.getLocalRecords<Vendor>('vendors_cache');
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
      if (isSupabaseConfigured) {
        throw new Error(`Failed to fetch vendors: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      const cached = this.getFromLocalStorage<Vendor[]>('vendors_cache');
      if (cached) {
        console.warn('Failed to fetch vendors, using cached data');
        return cached;
      }
      console.warn('Failed to fetch vendors, using local workspace.', error);
      return [];
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
      return this.getLocalRecords<DocumentRecord>('documents_cache');
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
      if (isSupabaseConfigured) {
        throw new Error(`Failed to fetch documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      const cached = this.getFromLocalStorage<DocumentRecord[]>('documents_cache');
      if (cached) {
        console.warn('Failed to fetch documents, using cached data');
        return cached;
      }
      console.warn('Failed to fetch documents, using local workspace.', error);
      return [];
    }
  }

  async addBill(bill: CreateBillInput): Promise<Bill> {
    if (!isSupabaseConfigured) {
      const newBill = this.createLocalRecord(bill) as Bill;
      this.saveLocalRecords('bills_cache', [...this.getLocalRecords<Bill>('bills_cache'), newBill]);
      this.invalidateCache(false);
      this.notifyZapier('bill', 'created', newBill);
      return newBill;
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
        this.notifyZapier('bill', 'created', newBill);
      }
      return newBill;
    } catch (error) {
      console.warn('Failed to add bill in Supabase, saving locally instead.', error);
      const newBill = this.createLocalRecord(bill) as Bill;
      this.saveLocalRecords('bills_cache', [...this.getLocalRecords<Bill>('bills_cache'), newBill]);
      this.invalidateCache(false);
      this.notifyZapier('bill', 'created', newBill);
      return newBill;
    }
  }

  async addVendor(vendor: CreateVendorInput): Promise<Vendor> {
    if (!isSupabaseConfigured) {
      const newVendor = this.createLocalRecord({ ...vendor, status: vendor.status || 'Active' }) as Vendor;
      this.saveLocalRecords('vendors_cache', [...this.getLocalRecords<Vendor>('vendors_cache'), newVendor]);
      this.invalidateCache(false);
      this.notifyZapier('vendor', 'created', newVendor);
      return newVendor;
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
        this.notifyZapier('vendor', 'created', newVendor);
      }
      return newVendor;
    } catch (error) {
      console.warn('Failed to add vendor in Supabase, saving locally instead.', error);
      const newVendor = this.createLocalRecord({ ...vendor, status: vendor.status || 'Active' }) as Vendor;
      this.saveLocalRecords('vendors_cache', [...this.getLocalRecords<Vendor>('vendors_cache'), newVendor]);
      this.invalidateCache(false);
      this.notifyZapier('vendor', 'created', newVendor);
      return newVendor;
    }
  }

  async addDocument(document: CreateDocumentInput): Promise<DocumentRecord> {
    if (!isSupabaseConfigured) {
      const newDocument = this.createLocalRecord({ ...document, status: document.status || 'Active' }) as DocumentRecord;
      this.saveLocalRecords('documents_cache', [...this.getLocalRecords<DocumentRecord>('documents_cache'), newDocument]);
      this.invalidateCache(false);
      this.notifyZapier('document', 'created', newDocument);
      return newDocument;
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
        this.notifyZapier('document', 'created', newDocument);
      }
      return newDocument;
    } catch (error) {
      console.warn('Failed to add document in Supabase, saving locally instead.', error);
      const newDocument = this.createLocalRecord({ ...document, status: document.status || 'Active' }) as DocumentRecord;
      this.saveLocalRecords('documents_cache', [...this.getLocalRecords<DocumentRecord>('documents_cache'), newDocument]);
      this.invalidateCache(false);
      this.notifyZapier('document', 'created', newDocument);
      return newDocument;
    }
  }

  async updateDocument(id: string, document: CreateDocumentInput): Promise<DocumentRecord> {
    if (!isSupabaseConfigured) {
      const updatedDocument = this.updateLocalRecord<DocumentRecord>('documents_cache', id, document as Partial<DocumentRecord>);
      this.invalidateCache(false);
      this.notifyZapier('document', 'updated', updatedDocument);
      return updatedDocument;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .update(document)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      const updatedDocument = data?.[0];
      if (updatedDocument) {
        this.invalidateCache();
        this.notifyZapier('document', 'updated', updatedDocument);
      }
      return updatedDocument;
    } catch (error) {
      console.warn('Failed to update document in Supabase, updating local record instead.', error);
      const updatedDocument = this.updateLocalRecord<DocumentRecord>('documents_cache', id, document as Partial<DocumentRecord>);
      this.invalidateCache(false);
      this.notifyZapier('document', 'updated', updatedDocument);
      return updatedDocument;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      this.deleteLocalRecord<DocumentRecord>('documents_cache', id);
      this.invalidateCache(false);
      this.notifyZapier('document', 'deleted', undefined, { recordId: id });
      return;
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
      this.notifyZapier('document', 'deleted', undefined, { recordId: id });
    } catch (error) {
      console.warn('Failed to delete document in Supabase, deleting local record instead.', error);
      this.deleteLocalRecord<DocumentRecord>('documents_cache', id);
      this.invalidateCache(false);
      this.notifyZapier('document', 'deleted', undefined, { recordId: id });
    }
  }

  async updateVendor(id: string, vendor: UpdateVendorInput): Promise<Vendor> {
    if (!isSupabaseConfigured) {
      const updatedVendor = this.updateLocalRecord<Vendor>('vendors_cache', id, vendor as Partial<Vendor>);
      this.invalidateCache(false);
      this.notifyZapier('vendor', 'updated', updatedVendor);
      return updatedVendor;
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
        this.notifyZapier('vendor', 'updated', updatedVendor);
      }
      return updatedVendor;
    } catch (error) {
      console.warn('Failed to update vendor in Supabase, updating local record instead.', error);
      const updatedVendor = this.updateLocalRecord<Vendor>('vendors_cache', id, vendor as Partial<Vendor>);
      this.invalidateCache(false);
      this.notifyZapier('vendor', 'updated', updatedVendor);
      return updatedVendor;
    }
  }

  async deleteVendor(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      this.deleteLocalRecord<Vendor>('vendors_cache', id);
      this.invalidateCache(false);
      this.notifyZapier('vendor', 'deleted', undefined, { recordId: id });
      return;
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
      this.notifyZapier('vendor', 'deleted', undefined, { recordId: id });
    } catch (error) {
      console.warn('Failed to delete vendor in Supabase, deleting local record instead.', error);
      this.deleteLocalRecord<Vendor>('vendors_cache', id);
      this.invalidateCache(false);
      this.notifyZapier('vendor', 'deleted', undefined, { recordId: id });
    }
  }

  async updateBillStatus(id: string, status: string): Promise<Bill> {
    if (!isSupabaseConfigured) {
      const updatedBill = this.updateLocalRecord<Bill>('bills_cache', id, { status } as Partial<Bill>);
      this.createNextLocalRecurringBill(updatedBill);
      this.invalidateCache(false);
      this.notifyZapier('bill', 'status_changed', updatedBill, { status });
      return updatedBill;
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
        this.notifyZapier('bill', 'status_changed', updated, { status });
      }
      return updated;
    } catch (error) {
      console.warn('Failed to update bill status in Supabase, updating local record instead.', error);
      const updatedBill = this.updateLocalRecord<Bill>('bills_cache', id, { status } as Partial<Bill>);
      this.createNextLocalRecurringBill(updatedBill);
      this.invalidateCache(false);
      this.notifyZapier('bill', 'status_changed', updatedBill, { status });
      return updatedBill;
    }
  }

  async updateBill(id: string, billData: UpdateBillInput): Promise<Bill> {
    if (!isSupabaseConfigured) {
      const updatedBill = this.updateLocalRecord<Bill>('bills_cache', id, billData as Partial<Bill>);
      this.invalidateCache(false);
      this.notifyZapier('bill', 'updated', updatedBill);
      return updatedBill;
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
        this.notifyZapier('bill', 'updated', updated);
      }
      return updated;
    } catch (error) {
      console.warn('Failed to update bill in Supabase, updating local record instead.', error);
      const updatedBill = this.updateLocalRecord<Bill>('bills_cache', id, billData as Partial<Bill>);
      this.invalidateCache(false);
      this.notifyZapier('bill', 'updated', updatedBill);
      return updatedBill;
    }
  }

  async deleteBill(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      this.deleteLocalRecord<Bill>('bills_cache', id);
      this.invalidateCache(false);
      this.notifyZapier('bill', 'deleted', undefined, { recordId: id });
      return;
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
      this.notifyZapier('bill', 'deleted', undefined, { recordId: id });
    } catch (error) {
      console.warn('Failed to delete bill in Supabase, deleting local record instead.', error);
      this.deleteLocalRecord<Bill>('bills_cache', id);
      this.invalidateCache(false);
      this.notifyZapier('bill', 'deleted', undefined, { recordId: id });
    }
  }

  async getBillById(id: string): Promise<Bill | null> {
    if (!isSupabaseConfigured) {
      return this.getLocalRecords<Bill>('bills_cache').find((bill) => bill.id === id) || null;
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
      return { totalPaid: 0, totalPending: 0, totalOverdue: 0, overdueCount: 0 }
    }

    const paid = bills
      .filter((b) => b.status === 'Paid')
      .reduce((acc, b) => acc + b.amount, 0)

    const pending = bills
      .filter((b) => b.status === 'Pending' && !isOverdue(b))
      .reduce((acc, b) => acc + b.amount, 0)

    const overdue = bills.filter((b) => isOverdue(b))
    const overdueTotal = overdue.reduce((acc, b) => acc + b.amount, 0)

    return {
      totalPaid: paid,
      totalPending: pending,
      totalOverdue: overdueTotal,
      overdueCount: overdue.length,
    }
  }

  async createOrganization(name: string, slug: string, adminEmail: string): Promise<Organization> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${supabaseUrl}/functions/v1/create-organization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ name, slug, adminEmail }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create organization';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Edge Function error response:', errorData);
        } catch (e) {
          // If response is not JSON, it might be a 404 HTML page or other text
          const text = await response.text();
          console.error('Edge Function raw response:', text);
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.organization;
    } catch (error) {
      throw this.handleError(error, 'Failed to create organization');
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    const { data, error } = await supabase.from('organizations').select('*');
    if (error) throw error;
    return data || [];
  }

  private createNextLocalRecurringBill(bill: Bill): void {
    if (bill.status !== 'Paid' || !bill.is_recurring) {
      return;
    }

    const nextDate = new Date(bill.date);
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextBill = this.createLocalRecord({
      ...bill,
      id: undefined,
      status: 'Pending',
      date: nextDate.toISOString().split('T')[0],
      created_at: undefined,
    }) as Bill;

    this.saveLocalRecords('bills_cache', [...this.getLocalRecords<Bill>('bills_cache'), nextBill]);
  }

  async uploadDocumentFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    if (!isSupabaseConfigured) {
      onProgress?.(100);
      return URL.createObjectURL(file);
    }

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
      const filePath = `documents/${fileName}`;

      onProgress?.(30);

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      onProgress?.(80);

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      onProgress?.(100);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.warn('Failed to upload document to Supabase Storage, using local blob URL instead.', error);
      onProgress?.(100);
      return URL.createObjectURL(file);
    }
  }

  private invalidateCache(clearStorage = true): void {
    this.billsCache = null;
    this.locationsCache = null;
    this.vendorsCache = null;
    this.documentsCache = null;
    if (!clearStorage) {
      return;
    }
    localStorage.removeItem('bills_cache');
    localStorage.removeItem('locations_cache');
    localStorage.removeItem('vendors_cache');
    localStorage.removeItem('documents_cache');
  }

  private handleError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(fallbackMessage);
  }
}

export const dataService = new DataService();
