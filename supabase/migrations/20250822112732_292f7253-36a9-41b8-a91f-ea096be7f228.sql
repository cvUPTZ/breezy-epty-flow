-- Create tracker types enum
CREATE TYPE tracker_type AS ENUM ('specialized', 'defence', 'midfield', 'attack');

-- Create simplified tracker assignments table  
CREATE TABLE IF NOT EXISTS tracker_line_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL,
    tracker_type tracker_type NOT NULL,
    tracker_user_id UUID NOT NULL,
    assigned_event_types TEXT[] NOT NULL DEFAULT '{}',
    line_players JSONB NOT NULL DEFAULT '[]', -- Store player IDs for the line
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE tracker_line_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for tracker assignments
CREATE POLICY "Admins can manage all tracker line assignments"
ON tracker_line_assignments
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Trackers can view their own assignments"
ON tracker_line_assignments
FOR SELECT
USING (auth.uid() = tracker_user_id);

-- Create optimized view for notifications with match data
CREATE OR REPLACE VIEW notifications_with_matches AS
SELECT 
    n.id,
    n.user_id,  
    n.match_id,
    n.title,
    n.message,
    n.type,
    n.notification_data,
    n.is_read,
    n.created_at,
    m.name as match_name,
    m.home_team_name,
    m.away_team_name,
    m.match_date
FROM notifications n
LEFT JOIN matches m ON n.match_id = m.id;

-- Grant access to the view
GRANT SELECT ON notifications_with_matches TO authenticated;