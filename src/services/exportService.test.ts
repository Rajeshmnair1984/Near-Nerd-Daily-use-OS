import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportService } from './exportService';
import { Bill } from '@/types/bill';

describe('exportService', () => {
  let mockUrl: string;
  let mockLink: HTMLAnchorElement;

  beforeEach(() => {
    mockUrl = 'blob:mock-url';

    vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    mockLink = document.createElement('a');
    vi.spyOn(mockLink, 'click');
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild');
    vi.spyOn(document.body, 'removeChild');
  });

  describe('exportBillsToCSV', () => {
    it('should export bills to CSV format', () => {
      const bills: Bill[] = [
        {
          id: '1',
          charge_name: 'Electricity Bill',
          category: 'Utilities',
          amount: 150.5,
          date: '2026-04-20',
          status: 'Paid',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: true,
          created_at: '2026-01-01T00:00:00Z',
        },
      ];

      exportService.exportBillsToCSV(bills, { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toContain('bills');
    });

    it('should include all required headers', () => {
      const bills: Bill[] = [
        {
          id: '1',
          charge_name: 'Test Bill',
          category: 'Test',
          amount: 100,
          date: '2026-04-20',
          status: 'Pending',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: false,
          created_at: '2026-01-01T00:00:00Z',
        },
      ];

      exportService.exportBillsToCSV(bills, { includeTimestamp: false });

      const callArgs = (URL.createObjectURL as unknown as { mock: { calls: Blob[][] } }).mock.calls[0];
      const blob = callArgs[0];
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle bills with special characters', () => {
      const bills: Bill[] = [
        {
          id: '1',
          charge_name: 'Bill with "quotes" and, commas',
          category: 'Test Category',
          amount: 100,
          date: '2026-04-20',
          status: 'Paid',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: false,
          created_at: '2026-01-01T00:00:00Z',
        },
      ];

      exportService.exportBillsToCSV(bills, { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should include timestamp in filename by default', () => {
      const bills: Bill[] = [];

      exportService.exportBillsToCSV(bills);

      expect(mockLink.download).toContain('bills_');
    });

    it('should exclude timestamp when specified', () => {
      const bills: Bill[] = [];

      exportService.exportBillsToCSV(bills, { includeTimestamp: false });

      expect(mockLink.download).toBe('bills.csv');
    });

    it('should use custom filename', () => {
      const bills: Bill[] = [];

      exportService.exportBillsToCSV(bills, { filename: 'custom', includeTimestamp: false });

      expect(mockLink.download).toBe('custom.csv');
    });
  });

  describe('exportBillsSummaryToCSV', () => {
    it('should export bills summary with status breakdown', () => {
      const bills: Bill[] = [
        {
          id: '1',
          charge_name: 'Bill 1',
          category: 'Utilities',
          amount: 100,
          date: '2026-04-20',
          status: 'Paid',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: false,
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          charge_name: 'Bill 2',
          category: 'Utilities',
          amount: 200,
          date: '2026-04-25',
          status: 'Pending',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: true,
          created_at: '2026-01-02T00:00:00Z',
        },
      ];

      exportService.exportBillsSummaryToCSV(bills, { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toContain('bills_summary');
    });

    it('should correctly calculate status totals', () => {
      const bills: Bill[] = [
        {
          id: '1',
          charge_name: 'Bill 1',
          category: 'Utilities',
          amount: 150,
          date: '2026-04-20',
          status: 'Paid',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: false,
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          charge_name: 'Bill 2',
          category: 'Supplies',
          amount: 250,
          date: '2026-04-25',
          status: 'Paid',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: false,
          created_at: '2026-01-02T00:00:00Z',
        },
      ];

      exportService.exportBillsSummaryToCSV(bills, { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toBe('bills_summary.csv');
    });

    it('should count recurring bills correctly', () => {
      const bills: Bill[] = [
        {
          id: '1',
          charge_name: 'Bill 1',
          category: 'Utilities',
          amount: 100,
          date: '2026-04-20',
          status: 'Paid',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: true,
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          charge_name: 'Bill 2',
          category: 'Utilities',
          amount: 200,
          date: '2026-04-25',
          status: 'Pending',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: true,
          created_at: '2026-01-02T00:00:00Z',
        },
        {
          id: '3',
          charge_name: 'Bill 3',
          category: 'Supplies',
          amount: 50,
          date: '2026-04-30',
          status: 'Overdue',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: false,
          created_at: '2026-01-03T00:00:00Z',
        },
      ];

      exportService.exportBillsSummaryToCSV(bills, { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportAsCSV', () => {
    it('should export generic data with specified columns', () => {
      const data = [
        { id: '1', name: 'Item 1', value: 100 },
        { id: '2', name: 'Item 2', value: 200 },
      ];

      exportService.exportAsCSV(data, 'test', ['id', 'name', 'value'], { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toBe('test.csv');
    });

    it('should handle missing data values', () => {
      const data = [
        { id: '1', name: 'Item 1', value: 100 },
        { id: '2', name: 'Item 2' } as { id: string; name: string; value: number },
      ];

      exportService.exportAsCSV(data, 'test', ['id', 'name', 'value'], { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should respect column order', () => {
      const data = [{ a: '1', b: '2', c: '3' }];

      exportService.exportAsCSV(data, 'test', ['c', 'a', 'b'], { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportBillsToText', () => {
    it('should export bills to formatted text', () => {
      const bills: Bill[] = [
        {
          id: '1',
          charge_name: 'Electricity',
          category: 'Utilities',
          amount: 150.5,
          date: '2026-04-20',
          status: 'Paid',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: true,
          created_at: '2026-01-01T00:00:00Z',
        },
      ];

      exportService.exportBillsToText(bills, { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toBe('bills_report.txt');
    });

    it('should include bill summary information', () => {
      const bills: Bill[] = [
        {
          id: '1',
          charge_name: 'Bill 1',
          category: 'Utilities',
          amount: 100,
          date: '2026-04-20',
          status: 'Paid',
          location_id: 'loc-1',
          vendor_id: 'vendor-1',
          is_recurring: false,
          created_at: '2026-01-01T00:00:00Z',
        },
      ];

      exportService.exportBillsToText(bills, { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle empty bills array', () => {
      const bills: Bill[] = [];

      exportService.exportBillsToText(bills, { includeTimestamp: false });

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should use custom filename', () => {
      const bills: Bill[] = [];

      exportService.exportBillsToText(bills, { filename: 'custom', includeTimestamp: false });

      expect(mockLink.download).toBe('custom.txt');
    });
  });

  describe('file download', () => {
    it('should create blob with correct mime type for CSV', () => {
      vi.clearAllMocks();
      const bills: Bill[] = [];

      exportService.exportBillsToCSV(bills, { includeTimestamp: false });

      const createBlobCall = (URL.createObjectURL as unknown as { mock: { calls: Blob[][] } }).mock.calls[0];
      const blob = createBlobCall[0];
      expect(blob.type).toBe('text/csv');
    });

    it('should create blob with correct mime type for text', () => {
      vi.clearAllMocks();
      const bills: Bill[] = [];

      exportService.exportBillsToText(bills, { includeTimestamp: false });

      const createBlobCall = (URL.createObjectURL as unknown as { mock: { calls: Blob[][] } }).mock.calls[0];
      const blob = createBlobCall[0];
      expect(blob.type).toBe('text/plain');
    });

    it('should trigger download', () => {
      vi.clearAllMocks();
      const bills: Bill[] = [];

      exportService.exportBillsToCSV(bills, { includeTimestamp: false });

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should revoke object URL after download', () => {
      vi.clearAllMocks();
      const bills: Bill[] = [];

      exportService.exportBillsToCSV(bills, { includeTimestamp: false });

      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
  });
});
