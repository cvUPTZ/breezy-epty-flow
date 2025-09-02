-- Phase 1: Critical Database Security Fixes

-- 1. Fix auth.users exposure in views
-- Drop problematic views that expose auth.users data
DROP VIEW IF EXISTS public.user_roles_view CASCADE;
DROP VIEW IF EXISTS public.assignment_logs_with_details CASCADE;
DROP VIEW IF EXISTS public.notifications_with_matches CASCADE;
DROP VIEW IF EXISTS public.profiles_with_permissions CASCADE;

-- 2. Recreate user_roles_view securely (only essential data)
CREATE VIEW public.user_roles_view AS
SELECT 
    ur.user_id,
    ur.role,
    ur.created_at as role_assigned_at,
    p.email
FROM public.user_roles ur
LEFT JOIN public.profiles p ON ur.user_id = p.id;

-- Enable RLS on the new view
ALTER VIEW public.user_roles_view SET (security_invoker = true);

-- 3. Fix Security Definer functions with mutable search paths
-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  -- Fixed search path
AS $$
DECLARE
  role_value TEXT;
BEGIN
  -- Get role from user_roles table
  SELECT role::text INTO role_value
  FROM public.user_roles
  WHERE user_id = user_id_param
  LIMIT 1;
  
  -- Fallback to profiles table if not found
  IF role_value IS NULL THEN
    SELECT role INTO role_value
    FROM public.profiles
    WHERE id = user_id_param;
  END IF;
  
  RETURN COALESCE(role_value, 'user');
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error fetching user role for user_id %: %', user_id_param, SQLERRM;
    RETURN 'user';
END;
$$;

-- Update get_user_permissions function  
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  -- Fixed search path
AS $$
DECLARE
  user_record RECORD;
  default_permissions JSONB;
BEGIN
  -- Get user role and custom permissions
  SELECT role, custom_permissions INTO user_record
  FROM public.profiles WHERE id = user_id;
  
  -- If custom permissions exist, return them
  IF user_record.custom_permissions IS NOT NULL THEN
    RETURN user_record.custom_permissions;
  END IF;
  
  -- Return role defaults
  CASE user_record.role
    WHEN 'admin' THEN
      default_permissions := '{
        "pitchView": true,
        "pianoInput": true,
        "statistics": true,
        "timeline": true,
        "analytics": true,
        "ballTracking": true,
        "liveEvents": true
      }'::jsonb;
    WHEN 'tracker' THEN
      default_permissions := '{
        "pitchView": false,
        "pianoInput": true,
        "statistics": false,
        "timeline": false,
        "analytics": false,
        "ballTracking": false,
        "liveEvents": false
      }'::jsonb;
    WHEN 'teacher' THEN
      default_permissions := '{
        "pitchView": true,
        "pianoInput": false,
        "statistics": true,
        "timeline": true,
        "analytics": true,
        "ballTracking": false,
        "liveEvents": false
      }'::jsonb;
    ELSE 
      default_permissions := '{
        "pitchView": true,
        "pianoInput": false,
        "statistics": true,
        "timeline": true,
        "analytics": false,
        "ballTracking": false,
        "liveEvents": false
      }'::jsonb;
  END CASE;
  
  RETURN default_permissions;
END;
$$;

-- 4. Secure profile email access - restrict to admins only
DROP POLICY IF EXISTS "Profiles: Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Admins can view all profiles" ON public.profiles;

CREATE POLICY "Profiles: Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Profiles: Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

-- 5. Secure references table - remove public read access
DROP POLICY IF EXISTS "References: Public can read" ON public.references;

CREATE POLICY "References: Authenticated users can read" 
ON public.references 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

-- 6. Fix overly permissive timeline_events policy
DROP POLICY IF EXISTS "TimelineEvents: Authenticated can read" ON public.timeline_events;

CREATE POLICY "TimelineEvents: Users can view relevant events" 
ON public.timeline_events 
FOR SELECT 
USING (
  auth.role() = 'authenticated'::text AND 
  (user_id = auth.uid() OR is_admin())
);

-- 7. Add missing NOT NULL constraints for security-critical columns
ALTER TABLE public.match_tracker_assignments 
ALTER COLUMN tracker_user_id SET NOT NULL;

ALTER TABLE public.notifications 
ALTER COLUMN user_id SET NOT NULL;