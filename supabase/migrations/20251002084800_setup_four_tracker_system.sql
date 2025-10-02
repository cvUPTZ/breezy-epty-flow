-- 1. Restructure the match_tracker_assignments table for the 4-tracker system

-- Drop the old unique constraint if it exists
DROP INDEX IF EXISTS public.idx_unique_tracker_player_event;

-- Add new columns and drop old ones
ALTER TABLE public.match_tracker_assignments
  DROP COLUMN IF EXISTS player_id,
  DROP COLUMN IF EXISTS player_team_id,
  DROP COLUMN IF EXISTS assigned_event_types,
  ADD COLUMN IF NOT EXISTS tracker_type TEXT NOT NULL CHECK (tracker_type IN ('ball', 'player')) DEFAULT 'player',
  ADD COLUMN IF NOT EXISTS assigned_player_ids INTEGER[];

-- 2. Seed data for a test match to set up the 4-tracker system.
-- NOTE: Replace with your actual match_id and user_ids for testing.

-- Set a variable for the test match ID
DO $$
DECLARE
    test_match_id UUID := 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; -- A known match ID for testing
    tracker_1_id UUID := '00000000-0000-0000-0000-000000000001';
    tracker_2_id UUID := '00000000-0000-0000-0000-000000000002';
    tracker_3_id UUID := '00000000-0000-0000-0000-000000000003';
    ball_tracker_id UUID := 'user_d9b7f824-3e38-46b0-9a2b-5a8b272f3a21'; -- Tracker 4 (Ball Tracker)
BEGIN
    -- Clear existing assignments for this match to ensure a clean slate
    DELETE FROM public.match_tracker_assignments WHERE match_id = test_match_id;

    -- Assign players to Tracker 1 (e.g., 3 players across positions)
    INSERT INTO public.match_tracker_assignments (match_id, tracker_user_id, tracker_type, assigned_player_ids)
    VALUES (test_match_id, tracker_1_id, 'player', ARRAY[1, 7, 11]);

    -- Assign players to Tracker 2 (e.g., 3 different players)
    INSERT INTO public.match_tracker_assignments (match_id, tracker_user_id, tracker_type, assigned_player_ids)
    VALUES (test_match_id, tracker_2_id, 'player', ARRAY[5, 8, 9]);

    -- Assign players to Tracker 3 (e.g., the rest of the players)
    INSERT INTO public.match_tracker_assignments (match_id, tracker_user_id, tracker_type, assigned_player_ids)
    VALUES (test_match_id, tracker_3_id, 'player', ARRAY[2, 4, 6, 10]);

    -- Assign Tracker 4 as the Ball Tracker
    INSERT INTO public.match_tracker_assignments (match_id, tracker_user_id, tracker_type, assigned_player_ids)
    VALUES (test_match_id, ball_tracker_id, 'ball', NULL);

    RAISE NOTICE 'Seeded 4-tracker assignments for match %', test_match_id;
END $$;