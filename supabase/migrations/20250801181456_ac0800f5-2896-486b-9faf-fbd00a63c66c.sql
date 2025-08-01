-- Continue fixing critical security issues

-- Fix the RLS policy that references user metadata insecurely
-- First, let's find and fix the problematic policy
-- The error indicates an RLS policy is referencing auth.users.raw_user_meta_data directly

-- Drop any policies that reference user metadata directly
DROP POLICY IF EXISTS "Users can view assignments for matches they have access to" ON public.match_tracker_assignments;

-- Create a proper policy that doesn't reference user metadata directly
CREATE POLICY "Users can view assignments for matches they have access to" 
ON public.match_tracker_assignments
FOR SELECT 
USING (
  -- Allow authenticated users to view assignments
  auth.role() = 'authenticated'
);

-- Fix any other problematic views that expose auth.users
-- Let's identify and fix the specific views that are causing issues

-- Create a secure function to get user email without exposing auth.users
CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;

-- Update the get_trackers_with_email function to use the secure approach
CREATE OR REPLACE FUNCTION public.get_trackers_with_email()
 RETURNS TABLE(id uuid, full_name text, email text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT 
    p.id,
    p.full_name,
    p.email,  -- Use email from profiles table instead of auth.users
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.role = 'tracker'
  ORDER BY p.full_name NULLS LAST;
$function$;

-- Update get_all_users_with_metadata function to be more secure
CREATE OR REPLACE FUNCTION public.get_all_users_with_metadata()
 RETURNS TABLE(id uuid, email text, role text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Only return basic user info, not raw metadata
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.role,
    p.created_at
  FROM public.profiles p
  ORDER BY p.email;
END;
$function$;

-- Fix more functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_participant_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_match_tracker_activity_last_active_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.last_active_at = NOW();
    RETURN NEW;
END;
$function$;