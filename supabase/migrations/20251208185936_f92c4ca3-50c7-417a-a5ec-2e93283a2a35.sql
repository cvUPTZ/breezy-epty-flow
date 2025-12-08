-- Create master reference data table for key business figures
CREATE TABLE public.master_reference_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    category TEXT NOT NULL, -- 'financial', 'market', 'strategic', 'expansion'
    key_name TEXT NOT NULL, -- 'TAM', 'ARPU', 'LTV_CAC', etc.
    value NUMERIC,
    value_text TEXT, -- For non-numeric values
    unit TEXT, -- 'DZD', 'USD', '%', 'ratio'
    calculation_method TEXT,
    data_source TEXT,
    justification TEXT,
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, category, key_name, valid_from)
);

-- Create change history table for traceability
CREATE TABLE public.reference_data_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_id UUID NOT NULL REFERENCES public.master_reference_data(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    previous_value NUMERIC,
    new_value NUMERIC,
    previous_value_text TEXT,
    new_value_text TEXT,
    change_reason TEXT NOT NULL,
    change_type TEXT NOT NULL, -- 'create', 'update', 'correction', 'recalculation'
    supporting_document_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reconciliation issues table
CREATE TABLE public.data_reconciliation_issues (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    document_id UUID REFERENCES public.business_documents(id) ON DELETE CASCADE,
    reference_id UUID REFERENCES public.master_reference_data(id) ON DELETE SET NULL,
    issue_type TEXT NOT NULL, -- 'value_mismatch', 'missing_reference', 'methodology_conflict', 'source_conflict'
    severity TEXT NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
    key_name TEXT NOT NULL,
    expected_value TEXT,
    found_value TEXT,
    document_location TEXT,
    description TEXT,
    resolution_status TEXT DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'ignored'
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strategic hypotheses table
CREATE TABLE public.strategic_hypotheses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    category TEXT NOT NULL, -- 'market', 'growth', 'pricing', 'expansion', 'competition'
    hypothesis_name TEXT NOT NULL,
    hypothesis_description TEXT NOT NULL,
    assumption_basis TEXT, -- Evidence or reasoning
    confidence_level TEXT, -- 'high', 'medium', 'low'
    validation_status TEXT DEFAULT 'pending', -- 'pending', 'validated', 'invalidated', 'revised'
    impact_if_wrong TEXT,
    related_documents UUID[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expansion plans table for harmonization
CREATE TABLE public.expansion_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    region TEXT NOT NULL, -- 'algeria', 'morocco', 'tunisia', 'maghreb'
    phase INTEGER NOT NULL DEFAULT 1,
    phase_name TEXT NOT NULL,
    start_date DATE,
    target_end_date DATE,
    key_objectives JSONB DEFAULT '[]',
    required_resources JSONB DEFAULT '{}',
    success_metrics JSONB DEFAULT '[]',
    risks JSONB DEFAULT '[]',
    dependencies TEXT[],
    status TEXT DEFAULT 'planned', -- 'planned', 'active', 'completed', 'delayed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.master_reference_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_data_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_reconciliation_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expansion_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for master_reference_data
CREATE POLICY "Users can view their own reference data"
ON public.master_reference_data FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reference data"
ON public.master_reference_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reference data"
ON public.master_reference_data FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reference data"
ON public.master_reference_data FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for reference_data_history
CREATE POLICY "Users can view their own history"
ON public.reference_data_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
ON public.reference_data_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for data_reconciliation_issues
CREATE POLICY "Users can view their own reconciliation issues"
ON public.data_reconciliation_issues FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reconciliation issues"
ON public.data_reconciliation_issues FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for strategic_hypotheses
CREATE POLICY "Users can manage their own hypotheses"
ON public.strategic_hypotheses FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for expansion_plans
CREATE POLICY "Users can manage their own expansion plans"
ON public.expansion_plans FOR ALL
USING (auth.uid() = user_id);

-- Create function to track reference data changes
CREATE OR REPLACE FUNCTION public.track_reference_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.reference_data_history (
            reference_id,
            user_id,
            previous_value,
            new_value,
            previous_value_text,
            new_value_text,
            change_reason,
            change_type
        ) VALUES (
            NEW.id,
            NEW.user_id,
            OLD.value,
            NEW.value,
            OLD.value_text,
            NEW.value_text,
            COALESCE(NEW.justification, 'Updated'),
            'update'
        );
    END IF;
    
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for tracking changes
CREATE TRIGGER track_reference_changes
BEFORE UPDATE ON public.master_reference_data
FOR EACH ROW
EXECUTE FUNCTION public.track_reference_data_changes();

-- Add updated_at triggers
CREATE TRIGGER update_reconciliation_issues_updated_at
BEFORE UPDATE ON public.data_reconciliation_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hypotheses_updated_at
BEFORE UPDATE ON public.strategic_hypotheses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expansion_plans_updated_at
BEFORE UPDATE ON public.expansion_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();