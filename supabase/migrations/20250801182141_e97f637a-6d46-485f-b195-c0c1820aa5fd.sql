-- Fix the views that expose auth.users table

-- Drop the problematic views
DROP VIEW IF EXISTS public.match_tracker_assignments_view;
DROP VIEW IF EXISTS public.user_roles_view;

-- Recreate match_tracker_assignments_view using profiles table instead of auth.users
CREATE VIEW public.match_tracker_assignments_view AS 
SELECT 
    mta.id,
    mta.match_id,
    mta.tracker_user_id,
    mta.player_id,
    mta.player_team_id,
    mta.created_at,
    mta.assigned_player_id,
    mta.assigned_event_types,
    mta.tracker_id,
    mta.updated_at,
    p.email AS tracker_email
FROM match_tracker_assignments mta
LEFT JOIN public.profiles p ON (mta.tracker_user_id = p.id);

-- Recreate user_roles_view using profiles table instead of auth.users
CREATE VIEW public.user_roles_view AS 
SELECT 
    p.id AS user_id,
    p.email,
    p.created_at AS user_created_at,
    ur.role,
    ur.created_at AS role_assigned_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON (p.id = ur.user_id)
ORDER BY p.email, ur.role;

-- Fix any remaining RLS policies that reference user metadata
-- Find and fix the policy that still references auth.users.raw_user_meta_data

-- Check for the problematic policy - it might be on voice_rooms or similar table
-- Let me drop all policies that use JWT user_metadata checks and recreate them properly

-- Drop policies that reference user metadata
DROP POLICY IF EXISTS "Select voice rooms for accessible matches" ON public.voice_rooms;
DROP POLICY IF EXISTS "Insert voice rooms for accessible matches" ON public.voice_rooms;
DROP POLICY IF EXISTS "Update voice rooms for accessible matches" ON public.voice_rooms;
DROP POLICY IF EXISTS "Delete voice rooms for accessible matches" ON public.voice_rooms;

-- Recreate voice room policies without referencing user metadata
CREATE POLICY "Select voice rooms for accessible matches" 
ON public.voice_rooms
FOR SELECT 
USING (
  -- Allow users who are assigned to the match or have admin/coordinator roles
  EXISTS (
    SELECT 1 FROM public.match_tracker_assignments mta
    WHERE mta.match_id = voice_rooms.match_id AND mta.tracker_user_id = auth.uid()
  ) 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = ANY(ARRAY['admin', 'coordinator'])
  )
);

CREATE POLICY "Insert voice rooms for accessible matches" 
ON public.voice_rooms
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.match_tracker_assignments mta
    WHERE mta.match_id = voice_rooms.match_id AND mta.tracker_user_id = auth.uid()
  ) 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = ANY(ARRAY['admin', 'coordinator'])
  )
);

CREATE POLICY "Update voice rooms for accessible matches" 
ON public.voice_rooms
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.match_tracker_assignments mta
    WHERE mta.match_id = voice_rooms.match_id AND mta.tracker_user_id = auth.uid()
  ) 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = ANY(ARRAY['admin', 'coordinator'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.match_tracker_assignments mta
    WHERE mta.match_id = voice_rooms.match_id AND mta.tracker_user_id = auth.uid()
  ) 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = ANY(ARRAY['admin', 'coordinator'])
  )
);

CREATE POLICY "Delete voice rooms for accessible matches" 
ON public.voice_rooms
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.match_tracker_assignments mta
    WHERE mta.match_id = voice_rooms.match_id AND mta.tracker_user_id = auth.uid()
  ) 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = ANY(ARRAY['admin', 'coordinator'])
  )
);