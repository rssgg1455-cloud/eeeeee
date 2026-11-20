/*
# Registered user count for the Home page

Adds a function that returns how many accounts are registered in the app, so the Home page can show a live total instead of a fixed number.

1. New Functions
- `get_registered_user_count()`: returns a single whole number, the count of rows in the profiles table (one per registered account).

2. Security
- The function runs with owner rights so it can count all accounts, but returns only the number. No user details are exposed.
- Execute permission is removed from the public and anonymous roles and granted only to signed-in users.
*/

CREATE OR REPLACE FUNCTION public.get_registered_user_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM public.profiles;
$$;

REVOKE EXECUTE ON FUNCTION public.get_registered_user_count() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_registered_user_count() TO authenticated;
