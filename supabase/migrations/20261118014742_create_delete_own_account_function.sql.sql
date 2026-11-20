/*
# Delete Own Account Function

## Purpose
Allows an authenticated user to permanently delete their own account,
removing themselves from Supabase Auth and cascading all associated data.

## What Gets Deleted
Deleting the row from `auth.users` triggers `ON DELETE CASCADE` on:
- `profiles` (id REFERENCES auth.users(id) ON DELETE CASCADE)
  - Which cascades to: jobs, deposits, withdrawals, proofs, transactions,
    kyc_submissions, support_tickets, app_ratings, partner_keys, referrals
  - `referred_by` and `support_messages.sender_id` are SET NULL

## Security
- SECURITY DEFINER function owned by `postgres` (can modify auth.users)
- Only deletes the calling user's own auth row (auth.uid())
- REVOKE EXECUTE from PUBLIC/anon; GRANT only to authenticated
- Returns success/error JSON
*/

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated.');
  END IF;

  -- Delete from auth.users; CASCADE removes profiles + all user data
  DELETE FROM auth.users WHERE id = v_uid;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Account not found.');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Account deleted successfully.');
END;
$$;

ALTER FUNCTION public.delete_own_account() OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
