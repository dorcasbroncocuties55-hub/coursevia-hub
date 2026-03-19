
-- Fix overly permissive INSERT policies

-- Notifications: only authenticated users or admins can insert
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin logs: only admins can insert
DROP POLICY "System can insert logs" ON public.admin_logs;
CREATE POLICY "Admins can insert logs" ON public.admin_logs 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Content access: only admins can grant access
DROP POLICY "System can grant access" ON public.content_access;
CREATE POLICY "Admins can grant access" ON public.content_access 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
