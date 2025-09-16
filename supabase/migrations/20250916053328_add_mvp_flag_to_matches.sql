-- Add a boolean column to distinguish MVP matches from the original application's matches
ALTER TABLE public.matches
ADD COLUMN is_mvp_match BOOLEAN NOT NULL DEFAULT FALSE;

-- Add an index on the new column to speed up queries for MVP matches
CREATE INDEX idx_matches_is_mvp_match ON public.matches(is_mvp_match);
