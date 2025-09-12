-- First, let's make sure we have a proper admin user set up
-- Check if current authenticated user has a profile, if not create one
DO $$
DECLARE
    current_user_id UUID;
    user_email TEXT;
BEGIN
    -- Get the current authenticated user (this will be the user testing the system)
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NOT NULL THEN
        -- Get user email from auth.users
        SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
        
        -- Insert or update profile with admin role
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (current_user_id, user_email, COALESCE(user_email, 'Admin User'), 'admin')
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin',
            email = EXCLUDED.email,
            updated_at = now();
        
        -- Ensure user has admin role in user_roles table
        INSERT INTO public.user_roles (user_id, role)
        VALUES (current_user_id, 'admin'::user_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role assigned to user: %', current_user_id;
    ELSE
        RAISE NOTICE 'No authenticated user found';
    END IF;
END $$;

-- Fix RLS policies for match_tracker_assignments to be more permissive for admins
-- The existing policies should work, but let's make sure they're properly set up

-- Ensure the assignment_logs table allows proper logging
-- Update RLS policy to allow service operations
DROP POLICY IF EXISTS "Service operations can insert assignment logs" ON public.assignment_logs;
CREATE POLICY "Service operations can insert assignment logs" 
ON public.assignment_logs 
FOR INSERT 
TO authenticated
WITH CHECK (
    -- Allow if user is admin or if it's their own assignment
    (SELECT get_user_role(auth.uid()) = 'admin') OR 
    (auth.uid() = assigner_id)
);

-- Create a more permissive read policy for assignment logs
DROP POLICY IF EXISTS "Enhanced admin view for assignment logs" ON public.assignment_logs;
CREATE POLICY "Enhanced admin view for assignment logs" 
ON public.assignment_logs 
FOR SELECT 
TO authenticated
USING (
    -- Admins can view all logs
    (SELECT get_user_role(auth.uid()) = 'admin') OR 
    -- Users can view logs they created or are assigned to
    (auth.uid() = assigner_id) OR 
    (auth.uid() = assignee_id)
);

-- Ensure match_tracker_assignments policies work correctly
-- The existing admin policy should work, but let's verify it exists
DO $$
BEGIN
    -- Check if admin policy exists, create if not
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'match_tracker_assignments' 
        AND policyname = 'MatchTrackerAssignments: Admins can manage all'
    ) THEN
        CREATE POLICY "MatchTrackerAssignments: Admins can manage all" 
        ON public.match_tracker_assignments 
        FOR ALL 
        TO authenticated
        USING (is_admin())
        WITH CHECK (is_admin());
    END IF;
END $$;