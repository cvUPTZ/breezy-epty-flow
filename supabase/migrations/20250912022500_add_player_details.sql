ALTER TABLE public.scouted_players
ADD COLUMN jersey_number INTEGER,
ADD COLUMN photo_url TEXT,
ADD COLUMN lfp_id INTEGER;

-- Add a unique constraint to the lfp_id column to prevent duplicate players
ALTER TABLE public.scouted_players
ADD CONSTRAINT unique_lfp_id UNIQUE (lfp_id);
