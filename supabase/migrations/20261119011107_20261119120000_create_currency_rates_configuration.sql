/*
# Create backend-managed currency exchange rates

1. Purpose
- Adds one server-managed source of truth for USD exchange rates and currency metadata.
- The application keeps its existing internal monetary values in BDT and converts them to the active country's currency using USD as the bridge.

2. New Tables
- `currency_rates`
  - `country_code` (text, primary key) — supported country code used by the app.
  - `currency_code` (text, not null) — ISO-style currency code displayed to users.
  - `currency_symbol` (text, not null) — display symbol for the currency.
  - `usd_rate` (numeric, not null) — units of the local currency per 1 USD.
  - `language_codes` (text array, not null) — supported language codes for that country.
  - `updated_at` (timestamptz) — last configuration update time.

3. Security
- Enables row-level security.
- Allows anonymous and signed-in users to read the intentionally public currency configuration.
- Does not grant insert, update, or delete access to browser roles; changes remain server/admin controlled.

4. Important Notes
- Values are seeded with the app's existing supported countries so the current experience remains stable.
- Monetary records remain stored in the existing BDT base; this table controls conversion and display only.
*/

CREATE TABLE IF NOT EXISTS public.currency_rates (
  country_code text PRIMARY KEY,
  currency_code text NOT NULL,
  currency_symbol text NOT NULL,
  usd_rate numeric NOT NULL CHECK (usd_rate > 0),
  language_codes text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.currency_rates TO anon, authenticated;

DROP POLICY IF EXISTS "Public can read currency rates" ON public.currency_rates;
CREATE POLICY "Public can read currency rates"
  ON public.currency_rates FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.currency_rates (country_code, currency_code, currency_symbol, usd_rate, language_codes)
VALUES
  ('BD', 'BDT', '৳', 110, ARRAY['BN']),
  ('IN', 'INR', '₹', 83.5, ARRAY['HI', 'EN']),
  ('PK', 'PKR', '₨', 278, ARRAY['UR', 'EN']),
  ('NP', 'NPR', 'रू', 133, ARRAY['NE', 'EN']),
  ('ID', 'IDR', 'Rp', 15500, ARRAY['ID', 'EN']),
  ('PH', 'PHP', '₱', 56, ARRAY['EN', 'FIL']),
  ('MY', 'MYR', 'RM', 4.5, ARRAY['MS', 'EN']),
  ('SA', 'SAR', 'ر.س', 3.75, ARRAY['AR', 'EN']),
  ('AE', 'AED', 'د.إ', 3.67, ARRAY['AR', 'EN']),
  ('KW', 'KWD', 'د.ك', 0.31, ARRAY['AR', 'EN']),
  ('QA', 'QAR', 'ر.ق', 3.64, ARRAY['AR', 'EN']),
  ('NG', 'NGN', '₦', 1600, ARRAY['EN']),
  ('EG', 'EGP', '£', 48, ARRAY['AR', 'EN']),
  ('ZA', 'ZAR', 'R', 18, ARRAY['EN']),
  ('KE', 'KES', 'KSh', 129, ARRAY['SW', 'EN']),
  ('US', 'USD', '$', 1, ARRAY['EN']),
  ('BR', 'BRL', 'R$', 5.4, ARRAY['PT', 'EN']),
  ('MX', 'MXN', '$', 18, ARRAY['ES', 'EN'])
ON CONFLICT (country_code) DO UPDATE SET
  currency_code = EXCLUDED.currency_code,
  currency_symbol = EXCLUDED.currency_symbol,
  usd_rate = EXCLUDED.usd_rate,
  language_codes = EXCLUDED.language_codes,
  updated_at = now();