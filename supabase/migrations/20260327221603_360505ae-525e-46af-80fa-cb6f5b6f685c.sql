
-- Additional tables and functions referenced by the zip code

-- video_purchases table
CREATE TABLE IF NOT EXISTS public.video_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL DEFAULT 0,
  owner_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);
ALTER TABLE public.video_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own video purchases" ON public.video_purchases FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert video purchases" ON public.video_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- custom_offers table
CREATE TABLE IF NOT EXISTS public.custom_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  title text,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own offers" ON public.custom_offers FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create offers" ON public.custom_offers FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own offers" ON public.custom_offers FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  label text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges viewable by everyone" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "System can insert badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- ensure_my_profile_and_role RPC
CREATE OR REPLACE FUNCTION public.ensure_my_profile_and_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _meta jsonb;
  _full_name text;
  _avatar text;
  _role text;
BEGIN
  IF _user_id IS NULL THEN RETURN; END IF;

  SELECT raw_user_meta_data INTO _meta FROM auth.users WHERE id = _user_id;
  _full_name := COALESCE(_meta->>'full_name', _meta->>'name', '');
  _avatar := COALESCE(_meta->>'avatar_url', _meta->>'picture', '');
  _role := COALESCE(_meta->>'requested_role', 'learner');

  INSERT INTO public.profiles (user_id, full_name, avatar_url, email, role, onboarding_completed)
  VALUES (_user_id, _full_name, _avatar, (SELECT email FROM auth.users WHERE id = _user_id), _role, false)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.wallets (user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role::app_role)
  ON CONFLICT DO NOTHING;
END;
$$;

-- complete_onboarding RPC
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  _role text DEFAULT 'learner',
  _specialization_type text DEFAULT NULL,
  _specialization_slug text DEFAULT NULL,
  _primary_category_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  UPDATE public.profiles SET
    role = _role,
    onboarding_completed = true,
    specialization_type = _specialization_type,
    specialization_slug = _specialization_slug,
    primary_category_id = _primary_category_id
  WHERE user_id = _user_id;

  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role::app_role)
  ON CONFLICT DO NOTHING;

  IF _role IN ('coach', 'therapist') THEN
    INSERT INTO public.coach_profiles (user_id) VALUES (_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- approve_booking_completion RPC
CREATE OR REPLACE FUNCTION public.approve_booking_completion(_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _booking record;
BEGIN
  SELECT * INTO _booking FROM public.bookings WHERE id = _booking_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;

  IF _booking.learner_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.bookings SET status = 'completed' WHERE id = _booking_id;
END;
$$;

-- Add offer_id to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS offer_id uuid;
