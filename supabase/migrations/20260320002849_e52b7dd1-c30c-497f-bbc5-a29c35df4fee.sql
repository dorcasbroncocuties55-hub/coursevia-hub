
-- Fix 1: Enable RLS on payment_confirmations and add policies
ALTER TABLE public.payment_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own confirmations"
ON public.payment_confirmations FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own confirmations"
ON public.payment_confirmations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update confirmations"
ON public.payment_confirmations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete confirmations"
ON public.payment_confirmations FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Replace user_roles INSERT policy to prevent admin self-assignment
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;

CREATE POLICY "Users can insert limited roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND role IN ('learner', 'coach', 'creator')
);

-- Fix 3: Allow admins to view all user_roles (needed for admin dashboard)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 4: Allow admins to manage user_roles
CREATE POLICY "Admins can insert any role"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix 5: Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Fix 6: Add admin SELECT policy for profiles join on verification_requests
-- (the existing join verification_requests -> profiles uses user_id, need a FK or manual join)

-- Fix 7: Add video_progress and course_progress tables
CREATE TABLE IF NOT EXISTS public.video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  watched_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own video progress"
ON public.video_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own video progress"
ON public.video_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video progress"
ON public.video_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.course_lessons(id) ON DELETE SET NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own course progress"
ON public.course_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own course progress"
ON public.course_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress"
ON public.course_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
