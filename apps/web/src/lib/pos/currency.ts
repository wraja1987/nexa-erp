export function formatMoney(minor: number, currency: string = 'GBP'): string {
  const major = Math.round(minor) / 100
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(major)
}



