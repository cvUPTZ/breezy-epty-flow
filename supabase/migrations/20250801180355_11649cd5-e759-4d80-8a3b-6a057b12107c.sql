-- Fix critical database security issues

-- 1. Add RLS to tracker_device_status table
ALTER TABLE public.tracker_device_status ENABLE ROW LEVEL SECURITY;

-- Create policies for tracker_device_status
CREATE POLICY "Users can view their own device status" 
ON public.tracker_device_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own device status" 
ON public.tracker_device_status 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device status" 
ON public.tracker_device_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all device status" 
ON public.tracker_device_status 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- 2. Fix function search paths for security
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

-- 3. Create secure function to check user roles without exposing auth.users
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

-- 4. Create audit log table for tracking security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 5. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_resource_type text DEFAULT NULL,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'
)
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