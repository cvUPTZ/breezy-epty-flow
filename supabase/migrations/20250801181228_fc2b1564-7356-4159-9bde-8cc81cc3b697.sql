-- Fix critical security issues identified by the linter

-- First, let's check what views are exposing auth.users and fix them
-- Remove or restrict access to views that expose auth.users table

-- Fix tracker_device_status table - ensure RLS is enabled and working
ALTER TABLE public.tracker_device_status ENABLE ROW LEVEL SECURITY;

-- Drop and recreate any problematic views that expose auth.users
-- Let's identify and fix the security definer views

-- Fix function search paths for security
-- Update functions to have proper search_path settings

-- Update trigger_set_timestamp function
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Update set_current_timestamp_updated_at function  
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$function$;

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  role_value TEXT;
BEGIN
  SELECT raw_user_meta_data->>'role' INTO role_value
  FROM auth.users
  WHERE id = user_id_param
  LIMIT 1;

  RETURN role_value;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error fetching user role for user_id %: %', user_id_param, SQLERRM;
    RETURN NULL;
END;
$function$;

-- Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  role_value TEXT;
BEGIN
  -- Check user_roles table first
  SELECT role::text INTO role_value
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- If not found in user_roles, check profiles
  IF role_value IS NULL THEN
    SELECT role INTO role_value
    FROM public.profiles
    WHERE id = auth.uid();
  END IF;
  
  RETURN COALESCE(role_value, 'user');
END;
$function$;

-- Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_resource_type text DEFAULT NULL::text, p_resource_id text DEFAULT NULL::text, p_details jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$function$;

-- Update other security definer functions to have proper search_path
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  is_admin_user boolean;
BEGIN
  -- Check if the user has an 'admin' role in the user_roles table
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = p_user_id AND ur.role = 'admin'
  ) INTO is_admin_user;

  RETURN is_admin_user;
END;
$function$;