-- Create scouting system tables

-- Create scouts table
CREATE TABLE public.scouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  region TEXT,
  specialization TEXT,
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scouted_players table
CREATE TABLE public.scouted_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  age INTEGER,
  nationality TEXT,
  current_club TEXT,
  league TEXT,
  market_value DECIMAL(12,2),
  contract_expires DATE,
  physical_attributes JSONB DEFAULT '{}',
  technical_skills JSONB DEFAULT '{}',
  tactical_awareness JSONB DEFAULT '{}',
  mental_qualities JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scout_reports table
CREATE TABLE public.scout_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.scouted_players(id) ON DELETE CASCADE,
  scout_id UUID REFERENCES public.scouts(id),
  match_context TEXT,
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
  strengths TEXT[],
  weaknesses TEXT[],
  recommendation TEXT CHECK (recommendation IN ('sign', 'monitor', 'reject')),
  detailed_notes TEXT,
  video_links TEXT[],
  report_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create opposition_analysis table
CREATE TABLE public.opposition_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opponent_team TEXT NOT NULL,
  match_date DATE,
  formation TEXT,
  playing_style TEXT,
  key_players JSONB DEFAULT '[]',
  strengths TEXT[],
  weaknesses TEXT[],
  tactical_recommendations TEXT,
  set_piece_analysis JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create youth_prospects table
CREATE TABLE public.youth_prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE,
  position TEXT,
  academy_club TEXT,
  development_stage TEXT,
  potential_rating INTEGER CHECK (potential_rating >= 1 AND potential_rating <= 10),
  physical_development JSONB DEFAULT '{}',
  technical_progress JSONB DEFAULT '{}',
  character_assessment TEXT,
  recommended_pathway TEXT,
  scout_id UUID REFERENCES public.scouts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouted_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scout_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opposition_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_prospects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scouts table
CREATE POLICY "Scouts: Admins can manage all" ON public.scouts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Scouts: Users can view their own" ON public.scouts
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for scouted_players table
CREATE POLICY "ScoutedPlayers: Scouts and admins can manage" ON public.scouted_players
  FOR ALL USING (
    is_admin() OR 
    EXISTS (SELECT 1 FROM public.scouts WHERE user_id = auth.uid() AND is_active = true)
  );

-- RLS Policies for scout_reports table
CREATE POLICY "ScoutReports: Scouts can manage their own" ON public.scout_reports
  FOR ALL USING (
    is_admin() OR 
    EXISTS (SELECT 1 FROM public.scouts WHERE id = scout_reports.scout_id AND user_id = auth.uid())
  );

-- RLS Policies for opposition_analysis table
CREATE POLICY "OppositionAnalysis: Scouts and admins can manage" ON public.opposition_analysis
  FOR ALL USING (
    is_admin() OR 
    EXISTS (SELECT 1 FROM public.scouts WHERE user_id = auth.uid() AND is_active = true)
  );

-- RLS Policies for youth_prospects table
CREATE POLICY "YouthProspects: Scouts can manage their own" ON public.youth_prospects
  FOR ALL USING (
    is_admin() OR 
    EXISTS (SELECT 1 FROM public.scouts WHERE id = youth_prospects.scout_id AND user_id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX idx_scouts_user_id ON public.scouts(user_id);
CREATE INDEX idx_scouts_region ON public.scouts(region);
CREATE INDEX idx_scouted_players_position ON public.scouted_players(position);
CREATE INDEX idx_scouted_players_league ON public.scouted_players(league);
CREATE INDEX idx_scout_reports_player_id ON public.scout_reports(player_id);
CREATE INDEX idx_scout_reports_scout_id ON public.scout_reports(scout_id);
CREATE INDEX idx_opposition_analysis_opponent ON public.opposition_analysis(opponent_team);
CREATE INDEX idx_youth_prospects_scout_id ON public.youth_prospects(scout_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_scouts_updated_at
  BEFORE UPDATE ON public.scouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scouted_players_updated_at
  BEFORE UPDATE ON public.scouted_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scout_reports_updated_at
  BEFORE UPDATE ON public.scout_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opposition_analysis_updated_at
  BEFORE UPDATE ON public.opposition_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_youth_prospects_updated_at
  BEFORE UPDATE ON public.youth_prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();