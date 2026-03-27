
-- =========================================================
-- CONSOLIDATED MIGRATION: Platform upgrade from zip
-- =========================================================

-- 1) Admin bootstrap function
CREATE OR REPLACE FUNCTION public.is_admin_bootstrap_open()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  wants_admin BOOLEAN := COALESCE(NEW.raw_user_meta_data->>'requested_role', '') = 'admin';
  allow_admin_bootstrap BOOLEAN := FALSE;
BEGIN
  allow_admin_bootstrap := wants_admin AND public.is_admin_bootstrap_open();
  INSERT INTO public.profiles (user_id, full_name, avatar_url, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE WHEN allow_admin_bootstrap THEN TRUE ELSE FALSE END
  );
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN allow_admin_bootstrap THEN 'admin'::public.app_role ELSE 'learner'::public.app_role END
  ) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2) Profile columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'learner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profession text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certification text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS booking_price numeric DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_slug text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization_slug text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_category_id uuid;

-- 3) Category columns
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS role_type text;

-- 4) Video columns
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS preview_seconds integer DEFAULT 5;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS owner_role text DEFAULT 'creator';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT true;

-- 5) Booking columns
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_link text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS session_starts_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS session_ends_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS session_opens_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS provider_id uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS session_room_url text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS provider_type text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_type text DEFAULT 'scheduled';

-- 6) Wallet columns
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS pending_balance numeric DEFAULT 0;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS available_balance numeric DEFAULT 0;

-- 7) Subscription columns
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS amount numeric DEFAULT 10;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payment_provider text DEFAULT 'paystack';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paystack_customer_code text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paystack_plan_code text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paystack_subscription_code text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paystack_email_token text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS last_payment_reference text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 8) Payment columns
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider text DEFAULT 'paystack';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS reference text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_customer_code text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_plan_code text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_subscription_code text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_email_token text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 9) Messages index
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON public.messages(receiver_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_participants_created_at ON public.messages(sender_id, receiver_id, created_at DESC);

-- 10) Bank accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bank_name text,
  account_name text,
  account_number text,
  swift_code text,
  country text,
  currency text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Users can view own bank accounts') THEN
    CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Users can insert own bank accounts') THEN
    CREATE POLICY "Users can insert own bank accounts" ON public.bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Users can update own bank accounts') THEN
    CREATE POLICY "Users can update own bank accounts" ON public.bank_accounts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Users can delete own bank accounts') THEN
    CREATE POLICY "Users can delete own bank accounts" ON public.bank_accounts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 11) Purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL DEFAULT 0,
  owner_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchases' AND policyname = 'Users can view own purchases') THEN
    CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchases' AND policyname = 'Users can insert own purchases') THEN
    CREATE POLICY "Users can insert own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 12) Unified content system
CREATE TABLE IF NOT EXISTS public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  owner_role text,
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  content_type text NOT NULL CHECK (content_type IN ('single_video','episode_series','course')),
  thumbnail_url text,
  price numeric NOT NULL DEFAULT 0,
  category_id uuid,
  preview_seconds integer NOT NULL DEFAULT 5,
  is_published boolean NOT NULL DEFAULT true,
  video_storage_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.content_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  video_storage_path text,
  episode_number integer NOT NULL DEFAULT 1,
  duration_seconds integer NOT NULL DEFAULT 0,
  is_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.content_episodes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.content_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL DEFAULT 0,
  owner_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);
ALTER TABLE public.content_purchases ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.content_feedback_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  learner_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.content_feedback_requests ENABLE ROW LEVEL SECURITY;

-- Content RLS policies
DROP POLICY IF EXISTS "Public can view published content items" ON public.content_items;
CREATE POLICY "Public can view published content items" ON public.content_items FOR SELECT USING (is_published = true OR auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can insert content items" ON public.content_items;
CREATE POLICY "Owners can insert content items" ON public.content_items FOR INSERT WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can update content items" ON public.content_items;
CREATE POLICY "Owners can update content items" ON public.content_items FOR UPDATE USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can delete content items" ON public.content_items;
CREATE POLICY "Owners can delete content items" ON public.content_items FOR DELETE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Public can view episodes for published items" ON public.content_episodes;
CREATE POLICY "Public can view episodes for published items" ON public.content_episodes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = content_episodes.content_id AND (ci.is_published = true OR ci.owner_id = auth.uid()))
);
DROP POLICY IF EXISTS "Owners can manage episodes" ON public.content_episodes;
CREATE POLICY "Owners can manage episodes" ON public.content_episodes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = content_episodes.content_id AND ci.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view own content purchases" ON public.content_purchases;
CREATE POLICY "Users can view own content purchases" ON public.content_purchases FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert content purchases" ON public.content_purchases;
CREATE POLICY "Users can insert content purchases" ON public.content_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can view feedback" ON public.content_feedback_requests;
CREATE POLICY "Owners can view feedback" ON public.content_feedback_requests FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = learner_id);
DROP POLICY IF EXISTS "Users can create feedback" ON public.content_feedback_requests;
CREATE POLICY "Users can create feedback" ON public.content_feedback_requests FOR INSERT WITH CHECK (auth.uid() = learner_id);

-- 13) Billing plans
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL UNIQUE,
  name text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  interval text NOT NULL DEFAULT 'monthly',
  currency text NOT NULL DEFAULT 'NGN',
  provider text NOT NULL DEFAULT 'paystack',
  provider_plan_code text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active billing plans" ON public.billing_plans;
CREATE POLICY "Public can view active billing plans" ON public.billing_plans FOR SELECT USING (active = true);

-- 14) Session reminders
CREATE TABLE IF NOT EXISTS public.session_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  remind_at timestamptz NOT NULL,
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.session_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own reminders" ON public.session_reminders;
CREATE POLICY "Users can view own reminders" ON public.session_reminders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own reminders" ON public.session_reminders;
CREATE POLICY "Users can create own reminders" ON public.session_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 15) Indexes
CREATE INDEX IF NOT EXISTS idx_categories_role_type ON public.categories(role_type);
CREATE INDEX IF NOT EXISTS idx_profiles_specialization_slug ON public.profiles(specialization_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_category_id ON public.profiles(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_session_reminders_booking ON public.session_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);

-- 16) Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', false, 1073741824, ARRAY['video/mp4','video/webm','video/quicktime','video/x-msvideo','video/mpeg'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('thumbnails', 'thumbnails', true, 10485760, ARRAY['image/png','image/jpeg','image/jpg','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
DROP POLICY IF EXISTS "Users can upload private videos" ON storage.objects;
CREATE POLICY "Users can upload private videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can read own private videos" ON storage.objects;
CREATE POLICY "Users can read own private videos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'videos' AND owner_id::text = auth.uid()::text);
DROP POLICY IF EXISTS "Users can update own private videos" ON storage.objects;
CREATE POLICY "Users can update own private videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos' AND owner_id::text = auth.uid()::text) WITH CHECK (bucket_id = 'videos' AND owner_id::text = auth.uid()::text);
DROP POLICY IF EXISTS "Users can delete own private videos" ON storage.objects;
CREATE POLICY "Users can delete own private videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos' AND owner_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can upload thumbnails" ON storage.objects;
CREATE POLICY "Users can upload thumbnails" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'thumbnails' AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Public can view thumbnails" ON storage.objects;
CREATE POLICY "Public can view thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
DROP POLICY IF EXISTS "Users can update own thumbnails" ON storage.objects;
CREATE POLICY "Users can update own thumbnails" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'thumbnails' AND owner_id::text = auth.uid()::text) WITH CHECK (bucket_id = 'thumbnails' AND owner_id::text = auth.uid()::text);
DROP POLICY IF EXISTS "Users can delete own thumbnails" ON storage.objects;
CREATE POLICY "Users can delete own thumbnails" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'thumbnails' AND owner_id::text = auth.uid()::text);

-- 17) Check user exists function
CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(user_email text)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(user_email));
$$;

-- 18) Profiles public view for provider pages
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
