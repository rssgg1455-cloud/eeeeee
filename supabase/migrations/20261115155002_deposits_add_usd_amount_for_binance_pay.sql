/*
# Binance Pay deposits: store the USD amount

Lets deposit requests paid through Binance Pay keep the original dollar amount next to the Taka amount that gets credited.

1. Modified Tables
- `deposits`: new nullable column `usd_amount` (numeric). It is filled only for Binance Pay requests and stays empty for mobile wallet requests.

2. How amounts work
- `amount` continues to hold the Taka value that is credited to the wallet when an admin approves, so approval and balances need no changes.
- For Binance Pay, `amount` is the dollar amount multiplied by the exchange rate (1 USD = 110 Taka).

3. Security
- No new policies or grants are needed. The column is covered by the existing deposits access rules.
*/

ALTER TABLE deposits ADD COLUMN IF NOT EXISTS usd_amount numeric;
