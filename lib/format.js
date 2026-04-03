export const fmt = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: n >= 1000 ? 0 : 2 }).format(n);
export const fmtK = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M€' : n >= 1e3 ? Math.round(n / 1e3) + 'k€' : fmt(n);
export const fmtP = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

export const REV_TYPES = ['Loyer', 'Dividende', 'Intérêts', 'Staking / Yield', 'Coupon', 'Autre'];
