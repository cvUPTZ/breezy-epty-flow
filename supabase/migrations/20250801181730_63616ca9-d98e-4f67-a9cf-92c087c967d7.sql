-- Fix the function signature issue by dropping and recreating
DROP FUNCTION IF EXISTS public.get_all_users_with_metadata();

-- Recreate the function with the correct signature
CREATE OR REPLACE FUNCTION public.get_all_users_with_metadata()
 RETURNS TABLE(id uuid, email text, raw_user_meta_data jsonb, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Return user data from profiles table instead of directly exposing auth.users
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    ('{"role": "' || COALESCE(p.role, 'user') || '"}')::jsonb as raw_user_meta_data,
    p.created_at
  FROM public.profiles p
  ORDER BY p.email;
END;
$function$;

-- Fix the remaining search path issues in other functions
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.user_role
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_tracker()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'tracker'::public.user_role
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'user',
    NEW.email
  );
  
  RETURN NEW;
END;
$function$;