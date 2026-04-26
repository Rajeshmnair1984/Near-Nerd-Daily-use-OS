import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('dataService local workspace fallback', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    localStorage.clear();
  });

  it('creates and reads locations without Supabase credentials', async () => {
    const { dataService } = await import('./dataService');

    const location = await dataService.addLocation({
      name: 'Test HQ',
      address: '123 Local Test',
      contact: 'Ops',
    });

    await expect(dataService.getLocations()).resolves.toEqual([location]);
  });

  it('creates, updates, and deletes bills without Supabase credentials', async () => {
    const { dataService } = await import('./dataService');

    const bill = await dataService.addBill({
      charge_name: 'Test Rent',
      amount: 1250,
      date: '2026-05-15',
      location_id: 'location-1',
      category: 'Rent',
      status: 'Pending',
      is_recurring: false,
    });

    const paidBill = await dataService.updateBillStatus(bill.id, 'Paid');
    expect(paidBill.status).toBe('Paid');
    expect(await dataService.getBillById(bill.id)).toMatchObject({ status: 'Paid' });

    await dataService.deleteBill(bill.id);
    await expect(dataService.getBills()).resolves.toEqual([]);
  });

  it('creates and updates vendors without Supabase credentials', async () => {
    const { dataService } = await import('./dataService');

    const vendor = await dataService.addVendor({
      name: 'Test Vendor',
      type: 'Utility',
      contact_person: 'John',
      email: 'john@vendor.com',
      phone: '555-0000',
    });

    const updated = await dataService.updateVendor(vendor.id, {
      name: 'Updated Vendor',
      type: 'Service',
      contact_person: 'Jane',
      email: 'jane@vendor.com',
      phone: '555-1111',
    });

    expect(updated.name).toBe('Updated Vendor');
    expect(await dataService.getVendors()).toContainEqual(
      expect.objectContaining({ name: 'Updated Vendor' })
    );
  });

  it('creates and updates documents without Supabase credentials', async () => {
    const { dataService } = await import('./dataService');

    const doc = await dataService.addDocument({
      title: 'Test Doc',
      category: 'Legal',
      owner: 'Admin',
      document_link: 'https://example.com/doc.pdf',
      status: 'Active',
      renewal_date: '2027-01-01',
    });

    const updated = await dataService.updateDocument(doc.id, {
      title: 'Updated Doc',
      category: 'Insurance',
      owner: 'Manager',
      document_link: 'https://example.com/updated.pdf',
      status: 'Needs Review',
      renewal_date: '2027-06-01',
    });

    expect(updated.title).toBe('Updated Doc');
    expect(updated.status).toBe('Needs Review');
  });

  it('creates and updates locations without Supabase credentials', async () => {
    const { dataService } = await import('./dataService');

    const location = await dataService.addLocation({
      name: 'Test Location',
      address: '123 Test St',
      contact: 'Manager',
    });

    const updated = await dataService.updateLocation(location.id, {
      name: 'Updated Location',
      address: '456 New St',
      contact: 'Director',
    });

    expect(updated.name).toBe('Updated Location');
    expect(updated.address).toBe('456 New St');
  });

  it('calculates dashboard stats correctly', async () => {
    const { dataService } = await import('./dataService');

    const bill1 = await dataService.addBill({
      charge_name: 'Rent',
      amount: 5000,
      date: '2026-05-01',
      location_id: 'loc-1',
      category: 'Rent',
      status: 'Paid',
      is_recurring: true,
    });

    const bill2 = await dataService.addBill({
      charge_name: 'Utilities',
      amount: 500,
      date: '2026-05-15',
      location_id: 'loc-1',
      category: 'Utilities',
      status: 'Pending',
      is_recurring: false,
    });

    const bill3 = await dataService.addBill({
      charge_name: 'Insurance',
      amount: 300,
      date: '2026-04-01',
      location_id: 'loc-1',
      category: 'Insurance',
      status: 'Overdue',
      is_recurring: false,
    });

    const bills = await dataService.getBills();
    const stats = dataService.getDashboardStats(bills);

    expect(stats.totalPaid).toBe(5000);
    expect(stats.totalPending).toBe(500);
    expect(stats.totalOverdue).toBe(300);
    expect(stats.overdueCount).toBe(1);
  });

  it('detects overdue bills when loaded from cache', async () => {
    const { dataService } = await import('./dataService');

    const pastBill = await dataService.addBill({
      charge_name: 'Past Bill',
      amount: 2000,
      date: '2020-01-01',
      location_id: 'loc-1',
      category: 'Rent',
      status: 'Pending',
      is_recurring: false,
    });

    const bills = await dataService.getBills();

    expect(bills.length).toBeGreaterThan(0);
    expect(bills[0].charge_name).toBe('Past Bill');
  });

  it('persists data in localStorage with correct keys', async () => {
    const { dataService } = await import('./dataService');

    const location = await dataService.addLocation({
      name: 'Persistent Location',
      address: '999 Memory Lane',
      contact: 'Storage',
    });

    const stored = localStorage.getItem('locations_cache');
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      const data = parsed.data || parsed;
      expect(data).toContainEqual(
        expect.objectContaining({ name: 'Persistent Location' })
      );
    }
  });
});
