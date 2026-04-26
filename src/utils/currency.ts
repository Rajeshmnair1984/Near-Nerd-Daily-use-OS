export const DEFAULT_CURRENCY = 'CAD';
export const DEFAULT_LOCALE = 'en-CA';

export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
  }).format(Number(value) || 0);
}
