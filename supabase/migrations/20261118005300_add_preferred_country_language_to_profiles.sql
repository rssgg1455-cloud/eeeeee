/*
# Add preferred_country and preferred_language to profiles

1. Purpose
   New users select their country and language during signup. These columns
   store those preferences so the app can restore them on future logins.

2. Columns added
   - `preferred_country` (text, nullable) — ISO-style country code (e.g. 'BD', 'IN')
   - `preferred_language` (text, nullable) — language code (e.g. 'BN', 'HI')

3. Security
   No new policies needed — profiles already has RLS with owner-scoped
   SELECT and UPDATE policies. The new columns are covered by the existing
   UPDATE grant since it is not column-restricted.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_country text,
  ADD COLUMN IF NOT EXISTS preferred_language text;