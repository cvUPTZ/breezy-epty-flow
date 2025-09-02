-- Phase 1: Critical Security Fixes - Targeted approach

-- 1. First, let's drop ALL existing policies on matches table and recreate them properly
DROP POLICY IF EXISTS "Allow delete for admins only" ON public.matches;
DROP POLICY IF EXISTS "Allow insert for admins only" ON public.matches;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.matches;
DROP POLICY IF EXISTS "Allow select for admins only" ON public.matches;
DROP POLICY IF EXISTS "Allow update for admins only" ON public.matches;
DROP POLICY IF EXISTS "Matches: Authenticated can insert own" ON public.matches;
DROP POLICY IF EXISTS "Matches: Public can read" ON public.matches;
DROP POLICY IF EXISTS "Matches: Admins can view all" ON public.matches;
DROP POLICY IF EXISTS "Matches: Managers can view all" ON public.matches;

-- Create comprehensive secure policies for matches
CREATE POLICY "Matches: Admins full access" 
ON public.matches 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Matches: Managers can view and edit" 
ON public.matches 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'manager'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'manager'
  )
);

CREATE POLICY "Matches: Authenticated users can view published matches only" 
ON public.matches 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND status = 'published'
);

CREATE POLICY "Matches: Users can create their own" 
ON public.matches 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- 2. Fix timeline_events security
DROP POLICY IF EXISTS "TimelineEvents: Public can read" ON public.timeline_events;
DROP POLICY IF EXISTS "TimelineEvents: Authenticated can read" ON public.timeline_events;

CREATE POLICY "TimelineEvents: Authenticated can read" 
ON public.timeline_events 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 3. Fix the assignment_logs RLS violation issue
DROP POLICY IF EXISTS "Authenticated users can insert assignment logs" ON public.assignment_logs;

CREATE POLICY "Authenticated users can insert assignment logs" 
ON public.assignment_logs 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() = assigner_id
);