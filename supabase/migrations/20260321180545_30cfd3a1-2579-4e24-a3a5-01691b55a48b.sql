
-- 1. Fix profiles: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. Fix notifications: restrict INSERT so users can only create notifications for themselves
-- Admin/system notifications handled via SECURITY DEFINER function
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Fix wallets: remove self-update ability, only admins can update
DROP POLICY IF EXISTS "Admins can update wallets" ON public.wallets;
CREATE POLICY "Only admins can update wallets"
  ON public.wallets FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Create SECURITY DEFINER function for system notifications (cross-user)
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _title text,
  _message text,
  _type text DEFAULT 'info',
  _link text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (_user_id, _title, _message, _type, _link);
END;
$$;

-- 5. Add therapist to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'therapist';
