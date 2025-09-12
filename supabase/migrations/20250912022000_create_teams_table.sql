-- Create the teams table
CREATE TABLE public.teams (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  logo_url TEXT,
  country TEXT
);

-- Add a team_id foreign key to the scouted_players table
ALTER TABLE public.scouted_players
ADD COLUMN team_id BIGINT REFERENCES public.teams(id);

-- Add a unique constraint to the teams table to prevent duplicate team names
ALTER TABLE public.teams
ADD CONSTRAINT unique_team_name UNIQUE (name);

-- Enable RLS for the new teams table
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the teams table
CREATE POLICY "Teams: Public read access" ON public.teams
FOR SELECT USING (true);

CREATE POLICY "Teams: Admins can manage" ON public.teams
FOR ALL USING (auth.role() = 'authenticated' AND (get_user_role(auth.uid()) = 'admin'));
