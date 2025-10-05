-- Fix infinite recursion in voice_room_participants RLS policies
-- Drop ALL existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'voice_room_participants' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.voice_room_participants';
    END LOOP;
END $$;

-- Create security definer function to check room participation without recursion
CREATE OR REPLACE FUNCTION public.is_room_participant(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.voice_room_participants
    WHERE user_id = _user_id
      AND room_id = _room_id
  )
$$;

-- Create new RLS policies using the security definer function
CREATE POLICY "Users can view participants in their rooms"
ON public.voice_room_participants
FOR SELECT
USING (public.is_room_participant(auth.uid(), room_id));

CREATE POLICY "Users can insert their own participation"
ON public.voice_room_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
ON public.voice_room_participants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participation"
ON public.voice_room_participants
FOR DELETE
USING (auth.uid() = user_id);