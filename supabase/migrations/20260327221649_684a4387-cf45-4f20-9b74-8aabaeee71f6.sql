
-- Add missing columns and update functions

-- video_purchases needs status
ALTER TABLE public.video_purchases ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Profiles needs more columns for extended onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_description text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages text[];

-- messages needs message_type column
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text';

-- Replace complete_onboarding with extended version
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_role text DEFAULT 'learner',
  p_full_name text DEFAULT NULL,
  p_display_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_profession text DEFAULT NULL,
  p_experience text DEFAULT NULL,
  p_certification text DEFAULT NULL,
  p_specialization_type text DEFAULT NULL,
  p_specialization_slug text DEFAULT NULL,
  p_business_name text DEFAULT NULL,
  p_business_email text DEFAULT NULL,
  p_business_phone text DEFAULT NULL,
  p_business_website text DEFAULT NULL,
  p_business_address text DEFAULT NULL,
  p_business_description text DEFAULT NULL,
  p_profile_photo_url text DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_languages text[] DEFAULT NULL,
  p_primary_category_id uuid DEFAULT NULL,
  p_booking_price numeric DEFAULT NULL
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
    role = p_role,
    full_name = COALESCE(p_full_name, full_name),
    display_name = COALESCE(p_display_name, display_name),
    phone = COALESCE(p_phone, phone),
    country = COALESCE(p_country, country),
    city = COALESCE(p_city, city),
    bio = COALESCE(p_bio, bio),
    profession = COALESCE(p_profession, profession),
    experience = COALESCE(p_experience, experience),
    certification = COALESCE(p_certification, certification),
    specialization_type = p_specialization_type,
    specialization_slug = p_specialization_slug,
    business_name = p_business_name,
    business_email = p_business_email,
    business_phone = p_business_phone,
    business_website = p_business_website,
    business_address = p_business_address,
    business_description = p_business_description,
    profile_photo_url = COALESCE(p_profile_photo_url, profile_photo_url),
    gender = COALESCE(p_gender, gender),
    languages = COALESCE(p_languages, languages),
    primary_category_id = p_primary_category_id,
    booking_price = COALESCE(p_booking_price, booking_price),
    onboarding_completed = true,
    updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, p_role::app_role)
  ON CONFLICT DO NOTHING;

  IF p_role IN ('coach', 'therapist') THEN
    INSERT INTO public.coach_profiles (user_id) VALUES (_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Replace ensure_my_profile_and_role to accept optional param
CREATE OR REPLACE FUNCTION public.ensure_my_profile_and_role(p_requested_role text DEFAULT NULL)
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
  _role := COALESCE(p_requested_role, _meta->>'requested_role', 'learner');

  INSERT INTO public.profiles (user_id, full_name, avatar_url, email, role, onboarding_completed)
  VALUES (_user_id, _full_name, _avatar, (SELECT email FROM auth.users WHERE id = _user_id), _role, false)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.wallets (user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role::app_role)
  ON CONFLICT DO NOTHING;
END;
$$;
