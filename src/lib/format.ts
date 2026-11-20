// Centralized BDT → USDT exchange rate. ALL amounts in the database and app
// state are stored in BDT; this rate converts them to USDT for display.
// 1 USDT = 124.43 BDT  →  usdtAmount = bdtAmount / 124.43
export const BDT_TO_USDT_RATE = 124.43;
export const USDT_TO_BDT_RATE = BDT_TO_USDT_RATE;

/** Convert a stored BDT amount to USDT for display. */
export function bdtToUsdt(bdtAmount: number): number {
  return Math.round((bdtAmount / BDT_TO_USDT_RATE) * 100) / 100;
}

/** Convert a USDT display amount back to BDT for storage. */
export function usdtToBdt(usdtAmount: number): number {
  return Math.round(usdtAmount * USDT_TO_BDT_RATE * 100) / 100;
}

/** Format a stored BDT amount as a USDT currency string: "$4.02". */
export const bdt = (bdtAmount: number): string => {
  const usdt = bdtToUsdt(bdtAmount);
  return `$ ${usdt.toFixed(2)}`;
};

/** Format a stored BDT amount as a plain USDT number string (no symbol): "4.02". */
export const bdtPlain = (bdtAmount: number): string => {
  const usdt = bdtToUsdt(bdtAmount);
  const str = usdt.toFixed(2);
  return str === '' ? '0' : str;
};

// 100 Coins = 1 BDT (stored). Display equivalent is via bdtToUsdt.
export const COINS_PER_BDT = 100;

export const coinsToBdt = (coins: number): number => coins / COINS_PER_BDT;

export const coinsToBdtDisplay = (coins: number): string => bdt(coinsToBdt(coins));

/** Format a USDT value (already converted) with the "$" symbol. */
export function formatUsdt(usdtAmount: number): string {
  return `$ ${formatUsdtPlain(usdtAmount)}`;
}

/** Format a USDT value (already converted) as a plain number string. */
export function formatUsdtPlain(usdtAmount: number): string {
  const abs = Math.abs(usdtAmount);
  let decimals = 2;
  if (abs >= 1000) decimals = 0;
  else if (abs === 0) decimals = 0;
  let str = usdtAmount.toFixed(decimals);
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  str = parts.join('.');
  if (str.endsWith('.00')) str = str.slice(0, -3);
  return str || '0';
}

/**
 * Format a BDT amount as a USDT currency string using the global rate.
 * (Kept for backward compatibility with older call sites.)
 */
export function formatLocal(bdtAmount: number, _symbol: string, _converted: number): string {
  return bdt(bdtAmount);
}

export function formatLocalPlain(_bdtAmount: number, converted: number): string {
  return formatUsdtPlain(converted);
}

export function copy(text: string): void {
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    /* ignore */
  }
}

export function uid(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function genWorkId(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `WID-${n}`;
}
