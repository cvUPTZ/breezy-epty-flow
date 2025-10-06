-- Update RLS policy to allow trackers to access matches they are assigned to, even if draft
DROP POLICY "Matches: Authenticated users can view published matches" ON matches;
DROP POLICY "Matches: Authenticated users can view published matches only" ON matches;

-- Create new policy that allows authenticated users to view published matches OR matches they're assigned to
CREATE POLICY "Matches: Users can view published matches or assigned matches"
ON matches
FOR SELECT
USING (
  (auth.role() = 'authenticated'::text)
  AND
  (
    status = 'published'::text
    OR
    EXISTS (
      SELECT 1 FROM match_tracker_assignments mta
      WHERE mta.match_id = matches.id
      AND mta.tracker_user_id = auth.uid()
    )
  )
);