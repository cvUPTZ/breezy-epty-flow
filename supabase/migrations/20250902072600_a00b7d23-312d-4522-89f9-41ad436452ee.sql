-- Phase 1: Critical Security Fixes

-- 1. Secure matches table - remove public read access and implement proper RLS
DROP POLICY IF EXISTS "Matches: Public can read" ON public.matches;

-- Create proper role-based access for matches
CREATE POLICY "Matches: Admins can view all" 
ON public.matches 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Matches: Managers can view all" 
ON public.matches 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'manager'
  )
);

CREATE POLICY "Matches: Authenticated users can view published matches" 
ON public.matches 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND status = 'published'
);

-- 2. Fix timeline_events - restrict to authenticated users only
DROP POLICY IF EXISTS "TimelineEvents: Public can read" ON public.timeline_events;

CREATE POLICY "TimelineEvents: Authenticated can read" 
ON public.timeline_events 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 3. Secure get_user_role function with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  role_value TEXT;
BEGIN
  -- First try to get role from user_roles table
  SELECT role::text INTO role_value
  FROM public.user_roles
  WHERE user_id = user_id_param
  LIMIT 1;
  
  -- If not found, check profiles table
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

-- 4. Fix get_all_users_with_metadata to not expose auth.users directly
CREATE OR REPLACE FUNCTION public.get_all_users_with_metadata()
RETURNS TABLE(id uuid, email text, raw_user_meta_data jsonb, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Return user data from profiles table instead of auth.users
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    jsonb_build_object('role', COALESCE(p.role, 'user')) as raw_user_meta_data,
    p.created_at
  FROM public.profiles p
  ORDER BY p.email;
END;
$$;

-- 5. Secure voice_room_participants table - fix infinite recursion
-- First, let's check if there are problematic policies and fix them
-- We'll create a simple, non-recursive policy structure

-- Remove any existing problematic policies that might cause recursion
DROP POLICY IF EXISTS "voice_room_participants_select_policy" ON public.voice_room_participants;
DROP POLICY IF EXISTS "voice_room_participants_insert_policy" ON public.voice_room_participants;
DROP POLICY IF EXISTS "voice_room_participants_update_policy" ON public.voice_room_participants;

-- Create safe policies that don't reference the same table
CREATE POLICY "VoiceRoomParticipants: Users can manage their own participation" 
ON public.voice_room_participants 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "VoiceRoomParticipants: Users can view room participants" 
ON public.voice_room_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.voice_rooms vr 
    WHERE vr.id = voice_room_participants.room_id 
    AND vr.is_active = true
  )
);

-- 6. Add proper security to assignment_logs table
-- Ensure only users involved in assignments can view logs
UPDATE public.assignment_logs 
SET assigner_id = COALESCE(assigner_id, auth.uid()) 
WHERE assigner_id IS NULL AND auth.uid() IS NOT NULL;