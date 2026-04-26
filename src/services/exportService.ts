import { Bill } from '@/types/bill';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';

interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
}

export const exportService = {
  /**
   * Export bills to CSV format
   */
  exportBillsToCSV(bills: Bill[], options: ExportOptions = {}) {
    const {
      filename = 'bills',
      includeTimestamp = true,
    } = options;

    const timestamp = includeTimestamp
      ? `_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`
      : '';
    const csvFilename = `${filename}${timestamp}.csv`;

    const headers = [
      'Bill Name',
      'Category',
      'Amount',
      'Due Date',
      'Status',
      'Location ID',
      'Vendor ID',
      'Is Recurring',
      'Created At',
    ];

    const rows = bills.map((bill) => [
      escapeCSVField(bill.charge_name),
      escapeCSVField(bill.category),
      bill.amount.toString(),
      bill.date,
      bill.status,
      bill.location_id || '',
      bill.vendor_id || '',
      bill.is_recurring ? 'Yes' : 'No',
      bill.created_at || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    downloadFile(csv, csvFilename, 'text/csv');
  },

  /**
   * Export bills summary to CSV (totals by status, category, etc.)
   */
  exportBillsSummaryToCSV(bills: Bill[], options: ExportOptions = {}) {
    const {
      filename = 'bills_summary',
      includeTimestamp = true,
    } = options;

    const timestamp = includeTimestamp
      ? `_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`
      : '';
    const csvFilename = `${filename}${timestamp}.csv`;

    const statusTotals = bills.reduce(
      (acc, bill) => {
        const status = bill.status;
        acc[status] = (acc[status] || 0) + bill.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const categoryTotals = bills.reduce(
      (acc, bill) => {
        const category = bill.category;
        acc[category] = (acc[category] || 0) + bill.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const recurringCount = bills.filter((bill) => bill.is_recurring).length;
    const paidCount = bills.filter((bill) => bill.status === 'Paid').length;
    const pendingCount = bills.filter((bill) => bill.status === 'Pending').length;
    const overdueCount = bills.filter((bill) => bill.status === 'Overdue').length;

    const summaryLines = [
      'BILL SUMMARY REPORT',
      `Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`,
      '',
      'OVERVIEW',
      `Total Bills,${bills.length}`,
      `Total Amount,${formatCurrency(totalAmount)}`,
      `Recurring Bills,${recurringCount}`,
      '',
      'BY STATUS',
      `Paid,${paidCount},${formatCurrency(statusTotals['Paid'] || 0)}`,
      `Pending,${pendingCount},${formatCurrency(statusTotals['Pending'] || 0)}`,
      `Overdue,${overdueCount},${formatCurrency(statusTotals['Overdue'] || 0)}`,
      '',
      'BY CATEGORY',
      ...Object.entries(categoryTotals).map(
        ([category, amount]) => `${escapeCSVField(category)},${formatCurrency(amount)}`
      ),
    ].join('\n');

    downloadFile(summaryLines, csvFilename, 'text/csv');
  },

  /**
   * Export data as generic CSV
   */
  exportAsCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    columns: (keyof T)[],
    options: ExportOptions = {}
  ) {
    const {
      includeTimestamp = true,
    } = options;

    const timestamp = includeTimestamp
      ? `_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`
      : '';
    const csvFilename = `${filename}${timestamp}.csv`;

    const headers = columns.map((col) => String(col));
    const rows = data.map((row) =>
      columns.map((col) => {
        const value = row[col];
        return escapeCSVField(String(value ?? ''));
      })
    );

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    downloadFile(csv, csvFilename, 'text/csv');
  },

  /**
   * Export bills to a formatted text report
   */
  exportBillsToText(bills: Bill[], options: ExportOptions = {}) {
    const {
      filename = 'bills_report',
      includeTimestamp = true,
    } = options;

    const timestamp = includeTimestamp
      ? `_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`
      : '';
    const textFilename = `${filename}${timestamp}.txt`;

    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidCount = bills.filter((bill) => bill.status === 'Paid').length;
    const pendingCount = bills.filter((bill) => bill.status === 'Pending').length;
    const overdueCount = bills.filter((bill) => bill.status === 'Overdue').length;

    const lines = [
      'BILL MANAGEMENT REPORT',
      '='.repeat(60),
      `Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`,
      '',
      'SUMMARY',
      '-'.repeat(60),
      `Total Bills: ${bills.length}`,
      `Total Amount: ${formatCurrency(totalAmount)}`,
      `Paid: ${paidCount} | Pending: ${pendingCount} | Overdue: ${overdueCount}`,
      `Recurring Bills: ${bills.filter((b) => b.is_recurring).length}`,
      '',
      'BILL DETAILS',
      '-'.repeat(60),
      ...bills.map(
        (bill) =>
          `${bill.charge_name} (${bill.category})
  Amount: ${formatCurrency(bill.amount)} | Status: ${bill.status} | Due: ${bill.date}${
            bill.is_recurring ? ' | Recurring' : ''
          }`
      ),
      '',
      '='.repeat(60),
      `End of Report`,
    ].join('\n');

    downloadFile(lines, textFilename, 'text/plain');
  },
};

/**
 * Escape CSV field values to handle commas and quotes
 */
function escapeCSVField(field: string): string {
  if (!field) return '';
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Download file by creating a blob and triggering download
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
