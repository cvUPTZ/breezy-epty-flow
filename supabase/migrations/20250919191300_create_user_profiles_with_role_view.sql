-- Create a view to combine user profiles and roles
CREATE OR REPLACE VIEW public.user_profiles_with_role AS
  SELECT p.id,
    p.full_name,
    p.email,
    COALESCE(ur.role, p.role, 'user') AS role
  FROM public.profiles p
     LEFT JOIN public.user_roles ur ON p.id = ur.user_id;

-- Enable RLS on the view
ALTER VIEW public.user_profiles_with_role OWNER TO postgres;
ALTER VIEW public.user_profiles_with_role SET (security_barrier = true);


-- Drop existing policies to be safe
DROP POLICY IF EXISTS "Allow admins to see all user profiles with roles" ON public.user_profiles_with_role;
DROP POLICY IF EXISTS "Allow users to see their own profile with role" ON public.user_profiles_with_role;

-- Create new policies for the view
CREATE POLICY "Allow admins to see all user profiles with roles"
ON public.user_profiles_with_role
FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Allow users to see their own profile with role"
ON public.user_profiles_with_role
FOR SELECT
TO authenticated
USING (id = auth.uid());
