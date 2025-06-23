
-- Create match_video_settings table
CREATE TABLE public.match_video_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
    video_url TEXT NOT NULL,
    video_title TEXT,
    video_description TEXT,
    duration_seconds INTEGER,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create video_tracker_assignments table
CREATE TABLE public.video_tracker_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    match_video_id uuid NOT NULL REFERENCES public.match_video_settings(id) ON DELETE CASCADE,
    tracker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_event_types JSONB,
    status TEXT DEFAULT 'pending',
    assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS policies for match_video_settings
ALTER TABLE public.match_video_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read video settings"
ON public.match_video_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admin users to insert video settings"
ON public.match_video_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Allow admin users or creators to update video settings"
ON public.match_video_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) OR auth.uid() = created_by
);

CREATE POLICY "Allow admin users or creators to delete video settings"
ON public.match_video_settings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) OR auth.uid() = created_by
);

-- Add RLS policies for video_tracker_assignments
ALTER TABLE public.video_tracker_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow assigned trackers or admins to read their assignments"
ON public.video_tracker_assignments
FOR SELECT
TO authenticated
USING (
  auth.uid() = tracker_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Allow admin users to insert assignments"
ON public.video_tracker_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Allow admin users or assigners to update assignments"
ON public.video_tracker_assignments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) OR auth.uid() = assigned_by
);

CREATE POLICY "Allow admin users or assigners to delete assignments"
ON public.video_tracker_assignments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) OR auth.uid() = assigned_by
);

-- Add indexes for better performance
CREATE INDEX idx_match_video_settings_match_id ON public.match_video_settings(match_id);
CREATE INDEX idx_match_video_settings_created_by ON public.match_video_settings(created_by);
CREATE INDEX idx_video_tracker_assignments_match_video_id ON public.video_tracker_assignments(match_video_id);
CREATE INDEX idx_video_tracker_assignments_tracker_id ON public.video_tracker_assignments(tracker_id);
CREATE INDEX idx_video_tracker_assignments_assigned_by ON public.video_tracker_assignments(assigned_by);

-- Add trigger to update "updated_at" timestamp for match_video_settings
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.match_video_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.match_video_settings IS 'Stores settings and metadata for YouTube videos associated with matches';
COMMENT ON COLUMN public.match_video_settings.match_id IS 'Optional link to a specific match';
COMMENT ON COLUMN public.match_video_settings.video_url IS 'The full YouTube video URL';
COMMENT ON COLUMN public.match_video_settings.video_title IS 'Title of the video, fetched or manually entered';
COMMENT ON COLUMN public.match_video_settings.duration_seconds IS 'Duration of the video in seconds';
COMMENT ON COLUMN public.match_video_settings.created_by IS 'User who created this video setting entry';

COMMENT ON TABLE public.video_tracker_assignments IS 'Assigns trackers to specific videos for event tracking';
COMMENT ON COLUMN public.video_tracker_assignments.match_video_id IS 'Link to the video being tracked';
COMMENT ON COLUMN public.video_tracker_assignments.tracker_id IS 'The user (tracker) assigned to this task';
COMMENT ON COLUMN public.video_tracker_assignments.assigned_event_types IS 'Specific event types the tracker is responsible for';
COMMENT ON COLUMN public.video_tracker_assignments.status IS 'Current status of the assignment';
COMMENT ON COLUMN public.video_tracker_assignments.assigned_by IS 'User who made this assignment';
