/*
# Leaderboard ranking and profile pictures

Adds the data needed for the leaderboard page: an optional profile picture per user, and a function that ranks every user by total earnings.

1. Modified Tables
- `profiles`: new nullable column `avatar_url` (text) for a user's profile picture. Existing rows are unaffected.

2. New Functions
- `get_leaderboard()`: returns every user ranked by lifetime earnings, highest first. Each row contains only:
  - `rank` (position, 1 = top earner)
  - `display_name` (full name, or "Worker" when no name is set)
  - `avatar_url` (profile picture, may be empty)
  - `lifetime_earnings` (total earnings)
  - `is_me` (true for the signed-in user's own row)
  Email addresses, balances and other private fields are never returned.

3. Security
- `get_leaderboard()` runs with the owner's rights so it can rank all users, while returning only the fields above.
- Execute permission is removed from the public and anonymous roles and granted only to signed-in users.

4. Notes
- Ties in earnings are ordered by account creation date so each user gets a stable, unique position.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  rank bigint,
  display_name text,
  avatar_url text,
  lifetime_earnings numeric,
  is_me boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ranked.position,
    ranked.display_name,
    ranked.avatar_url,
    ranked.lifetime_earnings,
    ranked.id = auth.uid() AS is_me
  FROM (
    SELECT
      row_number() OVER (ORDER BY p.lifetime_earnings DESC, p.created_at ASC, p.id ASC) AS position,
      COALESCE(NULLIF(btrim(p.full_name), ''), 'Worker') AS display_name,
      p.avatar_url,
      p.lifetime_earnings,
      p.id
    FROM profiles p
  ) ranked
  ORDER BY ranked.position;
$$;

REVOKE EXECUTE ON FUNCTION public.get_leaderboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
