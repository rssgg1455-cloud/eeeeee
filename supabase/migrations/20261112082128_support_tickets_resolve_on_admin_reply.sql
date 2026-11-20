/*
# Support tickets: resolve on admin reply, reopen on user reply

Makes the admin support queue show only tickets that are waiting for an admin, so the pending count drops as soon as an admin replies.

1. Behaviour changes
- Admin reply: a ticket's status becomes 'resolved' instead of 'open' when an admin sends a reply.
- Admin ticket list: returns only tickets with status 'open' (waiting for an admin). Resolved tickets leave the list.
- User reply: when a user writes again on a resolved ticket, the ticket is set back to 'open' so it returns to the queue.
- Existing data: tickets whose most recent message is from an admin are set to 'resolved' so the counter is correct immediately.

2. Modified functions
- `admin_reply(p_ticket, p_body)`: same signature; sets status to 'resolved'.
- `admin_list_tickets()`: same return shape; filters to status 'open'.

3. New trigger
- `support_messages` insert of a non-admin message reopens the parent ticket if it is not already open.

4. Security
- All functions keep their existing admin checks. The new trigger function runs with owner rights, is not callable by API roles, and sets search_path explicitly.
*/

CREATE OR REPLACE FUNCTION public.admin_reply(p_ticket uuid, p_body text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized.');
  END IF;
  IF p_body IS NULL OR btrim(p_body) = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Message cannot be empty.');
  END IF;
  INSERT INTO support_messages (ticket_id, sender, body, is_admin)
  VALUES (p_ticket, 'Admin', p_body, true);
  UPDATE support_tickets SET updated_at = now(), status = 'resolved' WHERE id = p_ticket;
  RETURN jsonb_build_object('success', true, 'message', 'Reply sent.');
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_list_tickets()
RETURNS TABLE(id uuid, user_id uuid, user_name text, subject text, status text, created_at timestamp with time zone, updated_at timestamp with time zone, last_message text, last_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
SELECT t.id, t.user_id, t.user_name, t.subject, t.status, t.created_at, t.updated_at,
  (SELECT m.body FROM support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
  (SELECT m.created_at FROM support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS last_at
FROM support_tickets t
WHERE public.is_platform_admin() AND t.status = 'open'
ORDER BY t.updated_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.reopen_ticket_on_user_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT NEW.is_admin THEN
    UPDATE support_tickets SET status = 'open', updated_at = now()
    WHERE id = NEW.ticket_id AND status <> 'open';
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.reopen_ticket_on_user_message() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS reopen_ticket_on_user_message ON support_messages;
CREATE TRIGGER reopen_ticket_on_user_message
AFTER INSERT ON support_messages
FOR EACH ROW EXECUTE FUNCTION public.reopen_ticket_on_user_message();

UPDATE support_tickets t
SET status = 'resolved'
WHERE t.status = 'open'
  AND (
    SELECT m.is_admin FROM support_messages m
    WHERE m.ticket_id = t.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) = true;
