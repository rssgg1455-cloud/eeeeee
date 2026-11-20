import type { DepositMethod } from '@/types';

export const CASH_OUT_RATE_PER_1000: Record<DepositMethod, number> = {
  'bKash Personal': 18.5,
  'Nagad Personal': 14.5,
  'Rocket Personal': 18.5,
  'Upay Personal': 15.0,
  'Binance Pay': 0,
};

export const BINANCE_PAY_ID = '1175217211';
export const BINANCE_USD_TO_BDT = 110;

export function cashOutCharge(amount: number, method: DepositMethod): number {
  return (amount / 1000) * (CASH_OUT_RATE_PER_1000[method] ?? 0);
}
