/**
 * Centralized formatting helpers for ADVMEN SalesOS
 */

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(Number(val))) return '0';
  return Number(val).toLocaleString('en-IN');
}
