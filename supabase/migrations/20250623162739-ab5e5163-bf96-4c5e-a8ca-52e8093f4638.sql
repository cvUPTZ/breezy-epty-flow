
-- Add the missing 'details' column to match_events table
ALTER TABLE public.match_events 
ADD COLUMN details JSONB DEFAULT '{}';

-- Update the column to be NOT NULL with a default value
ALTER TABLE public.match_events 
ALTER COLUMN details SET NOT NULL;

-- Add index for better performance on details column queries
CREATE INDEX IF NOT EXISTS idx_match_events_details ON public.match_events USING GIN (details);
