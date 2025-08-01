-- Fix SECURITY DEFINER views by dropping and recreating with proper ownership
-- These are the 4 critical ERROR-level issues from the linter

-- Drop all problematic views
DROP VIEW IF EXISTS public.user_permissions_view CASCADE;
DROP VIEW IF EXISTS public.profiles_with_permissions CASCADE;
DROP VIEW IF EXISTS public.match_tracker_assignments_view CASCADE;
DROP VIEW IF EXISTS public.user_roles_view CASCADE;

-- Recreate views with SECURITY INVOKER (not DEFINER) and proper ownership
-- Create user_permissions_view as a simple view without SECURITY DEFINER
CREATE VIEW public.user_permissions_view 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.custom_permissions,
  (p.custom_permissions IS NOT NULL) as has_custom_permissions,
  public.get_user_effective_permissions(p.id) as effective_permissions
FROM public.profiles p;

-- Create profiles_with_permissions view
CREATE VIEW public.profiles_with_permissions
WITH (security_invoker = true) AS
SELECT 
  p.id as user_id,
  p.full_name as user_full_name,
  p.email as user_email,
  p.role as user_role,
  p.created_at,
  p.updated_at,
  p.custom_permissions,
  (p.custom_permissions IS NOT NULL) as has_custom_permissions,
  public.get_user_effective_permissions(p.id) as effective_permissions
FROM public.profiles p;

-- Create match_tracker_assignments_view
CREATE VIEW public.match_tracker_assignments_view
WITH (security_invoker = true) AS
SELECT 
  mta.*,
  p.email as tracker_email
FROM public.match_tracker_assignments mta
LEFT JOIN public.profiles p ON p.id = mta.tracker_user_id;

-- Create user_roles_view
CREATE VIEW public.user_roles_view
WITH (security_invoker = true) AS
SELECT 
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at as role_assigned_at,
  p.created_at as user_created_at
FROM public.user_roles ur
LEFT JOIN auth.users au ON au.id = ur.user_id
LEFT JOIN public.profiles p ON p.id = ur.user_id;

-- Fix SECURITY DEFINER functions by adding SET search_path = ''
-- These are the WARN-level issues from the linter

-- Update functions that are missing search_path protection
ALTER FUNCTION public.get_user_permissions(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_effective_permissions(uuid) SET search_path = '';
ALTER FUNCTION public.reset_user_permissions_to_defaults(uuid) SET search_path = '';
ALTER FUNCTION public.update_user_metadata(uuid, jsonb) SET search_path = '';
ALTER FUNCTION public.add_user_role(uuid, user_role) SET search_path = '';
ALTER FUNCTION public.remove_user_role(uuid, user_role) SET search_path = '';
ALTER FUNCTION public.user_has_role(uuid, user_role) SET search_path = '';
ALTER FUNCTION public.get_user_roles(uuid) SET search_path = '';
ALTER FUNCTION public.assign_user_role(uuid, user_role) SET search_path = '';
ALTER FUNCTION public.get_tracker_profiles() SET search_path = '';
ALTER FUNCTION public.get_tracker_users() SET search_path = '';

-- Create RLS policies for the views
ALTER VIEW public.user_permissions_view SET (security_invoker = true);
ALTER VIEW public.profiles_with_permissions SET (security_invoker = true);
ALTER VIEW public.match_tracker_assignments_view SET (security_invoker = true);
ALTER VIEW public.user_roles_view SET (security_invoker = true);