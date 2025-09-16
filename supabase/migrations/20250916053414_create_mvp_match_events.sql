-- Create a new enum type for MVP event types
CREATE TYPE mvp_event_type AS ENUM (
  'Pass',
  'Shot',
  'Goal',
  'Foul',
  'Card',
  'Substitution'
);

-- Create a table to store match events for the MVP
CREATE TABLE mvp_match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  event_type mvp_event_type NOT NULL,
  player_name TEXT, -- Making this nullable for simplicity, can be added in details
  team_name TEXT, -- Making this nullable for simplicity
  details JSONB
);

-- Enable Row Level Security
ALTER TABLE mvp_match_events ENABLE ROW LEVEL SECURITY;

-- Create policies for mvp_match_events
-- 1. Authenticated users can view events for any match
CREATE POLICY "Authenticated users can view MVP events"
ON mvp_match_events FOR SELECT
TO authenticated
USING (true);

-- 2. Users with 'admin' or 'tracker' role can insert events
CREATE POLICY "Trackers and Admins can create MVP events"
ON mvp_match_events FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'tracker')
);

-- Add indexes for performance
CREATE INDEX idx_mvp_match_events_match_id ON mvp_match_events(match_id);
