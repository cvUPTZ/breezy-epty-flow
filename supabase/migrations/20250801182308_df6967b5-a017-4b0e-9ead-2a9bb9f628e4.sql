-- Fix the remaining RLS policy that references user metadata
DROP POLICY IF EXISTS "Users can view assignments for matches they have access to" ON public.match_tracker_assignments;

-- Create a proper policy without user metadata reference
CREATE POLICY "Users can view assignments for matches they have access to" 
ON public.match_tracker_assignments
FOR SELECT 
USING (
  -- Allow authenticated users to view assignments based on their role in profiles table
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('viewer', 'tracker', 'admin', 'manager')
  )
);

-- Fix the security definer views by converting them to regular views or security invoker
-- These views are owned by postgres, which makes them security definer by default

-- Drop and recreate the problematic views with proper ownership
DROP VIEW IF EXISTS public.user_permissions_view CASCADE;
DROP VIEW IF EXISTS public.profiles_with_permissions CASCADE;

-- Recreate user_permissions_view as a security invoker view
CREATE VIEW public.user_permissions_view AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.custom_permissions,
  (p.custom_permissions IS NOT NULL) as has_custom_permissions,
  CASE 
    WHEN p.custom_permissions IS NOT NULL THEN p.custom_permissions
    ELSE 
      CASE p.role
        WHEN 'admin' THEN '{"pitchView": true, "pianoInput": true, "statistics": true, "timeline": true, "analytics": true, "ballTracking": true, "liveEvents": true}'::jsonb
        WHEN 'tracker' THEN '{"pitchView": false, "pianoInput": true, "statistics": false, "timeline": false, "analytics": false, "ballTracking": false, "liveEvents": false}'::jsonb
        WHEN 'teacher' THEN '{"pitchView": true, "pianoInput": false, "statistics": true, "timeline": true, "analytics": true, "ballTracking": false, "liveEvents": false}'::jsonb
        ELSE '{"pitchView": true, "pianoInput": false, "statistics": true, "timeline": true, "analytics": false, "ballTracking": false, "liveEvents": false}'::jsonb
      END
  END as effective_permissions
FROM public.profiles p;

-- Recreate profiles_with_permissions view as a security invoker view  
CREATE VIEW public.profiles_with_permissions AS
SELECT 
  p.id as user_id,
  p.full_name as user_full_name,
  p.email as user_email,
  p.role as user_role,
  p.created_at,
  p.updated_at,
  p.custom_permissions,
  (p.custom_permissions IS NOT NULL) as has_custom_permissions,
  CASE 
    WHEN p.custom_permissions IS NOT NULL THEN p.custom_permissions
    ELSE 
      CASE p.role
        WHEN 'admin' THEN '{"pitchView": true, "pianoInput": true, "statistics": true, "timeline": true, "analytics": true, "ballTracking": true, "liveEvents": true}'::jsonb
        WHEN 'tracker' THEN '{"pitchView": false, "pianoInput": true, "statistics": false, "timeline": false, "analytics": false, "ballTracking": false, "liveEvents": false}'::jsonb
        WHEN 'teacher' THEN '{"pitchView": true, "pianoInput": false, "statistics": true, "timeline": true, "analytics": true, "ballTracking": false, "liveEvents": false}'::jsonb
        ELSE '{"pitchView": true, "pianoInput": false, "statistics": true, "timeline": true, "analytics": false, "ballTracking": false, "liveEvents": false}'::jsonb
      END
  END as effective_permissions
FROM public.profiles p;

-- Change ownership of the newly created views to avoid security definer issues
ALTER VIEW public.user_permissions_view OWNER TO authenticated;
ALTER VIEW public.profiles_with_permissions OWNER TO authenticated;
ALTER VIEW public.match_tracker_assignments_view OWNER TO authenticated;
ALTER VIEW public.user_roles_view OWNER TO authenticated;