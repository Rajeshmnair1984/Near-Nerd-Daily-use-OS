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
});
