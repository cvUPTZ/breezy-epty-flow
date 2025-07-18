-- Fix scout and youth prospects access
-- First, add unique constraint on scouts.user_id
ALTER TABLE public.scouts ADD CONSTRAINT scouts_user_id_unique UNIQUE (user_id);

-- Create a scout entry for admin/manager users who don't have one
INSERT INTO public.scouts (
  user_id,
  full_name,
  is_active,
  specialization,
  region
)
SELECT 
  id,
  COALESCE(full_name, 'Scout User'),
  true,
  'Youth Development',
  'General'
FROM public.profiles 
WHERE role IN ('admin', 'manager')
  AND NOT EXISTS (
    SELECT 1 FROM public.scouts WHERE user_id = profiles.id
  )
ON CONFLICT (user_id) DO UPDATE SET
  is_active = true;

-- Update RLS policy for youth_prospects to be more flexible
DROP POLICY IF EXISTS "YouthProspects: Scouts can manage their own" ON public.youth_prospects;

CREATE POLICY "YouthProspects: Scouts and admins can manage"
ON public.youth_prospects
FOR ALL
TO authenticated
USING (
  -- User is admin
  is_admin() 
  OR 
  -- User has manager role  
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'))
  OR
  -- User is an active scout and this is their prospect
  (EXISTS (
    SELECT 1 FROM public.scouts 
    WHERE user_id = auth.uid() 
      AND is_active = true 
      AND id = youth_prospects.scout_id
  ))
)
WITH CHECK (
  -- Same conditions for inserts
  is_admin() 
  OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'))
  OR
  (EXISTS (
    SELECT 1 FROM public.scouts 
    WHERE user_id = auth.uid() 
      AND is_active = true 
      AND id = youth_prospects.scout_id
  ))
);

-- Update RLS policy for scouted_players to be more flexible
DROP POLICY IF EXISTS "ScoutedPlayers: Scouts and admins can manage" ON public.scouted_players;

CREATE POLICY "ScoutedPlayers: Scouts and admins can manage"  
ON public.scouted_players
FOR ALL
TO authenticated
USING (
  -- User is admin
  is_admin() 
  OR 
  -- User has manager role
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'))
  OR
  -- User is an active scout
  (EXISTS (
    SELECT 1 FROM public.scouts 
    WHERE user_id = auth.uid() AND is_active = true
  ))
)
WITH CHECK (
  -- Same conditions for inserts
  is_admin() 
  OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager'))  
  OR
  (EXISTS (
    SELECT 1 FROM public.scouts 
    WHERE user_id = auth.uid() AND is_active = true
  ))
);