-- Create assignment_logs table to track all assignment activities
CREATE TABLE public.assignment_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id),
    assigner_id UUID REFERENCES auth.users(id) NOT NULL,
    assignee_id UUID REFERENCES auth.users(id),
    assignment_type TEXT NOT NULL, -- 'tracker_assignment', 'player_assignment', 'event_assignment', etc.
    assignment_action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
    assignment_details JSONB NOT NULL DEFAULT '{}', -- Details about what was assigned
    previous_assignment_details JSONB DEFAULT NULL, -- For updates/deletions
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT
);

-- Enable Row Level Security
ALTER TABLE public.assignment_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for assignment_logs
CREATE POLICY "Admins can view all assignment logs"
ON public.assignment_logs
FOR SELECT
USING (
    (SELECT public.get_user_role(auth.uid())) = 'admin'
);

CREATE POLICY "Users can view logs related to their assignments"
ON public.assignment_logs
FOR SELECT
USING (
    auth.uid() = assigner_id OR auth.uid() = assignee_id
);

CREATE POLICY "Authenticated users can insert assignment logs"
ON public.assignment_logs
FOR INSERT
WITH CHECK (
    auth.uid() = assigner_id
);

-- Create indexes for better performance
CREATE INDEX idx_assignment_logs_match_id ON public.assignment_logs(match_id);
CREATE INDEX idx_assignment_logs_assigner_id ON public.assignment_logs(assigner_id);
CREATE INDEX idx_assignment_logs_assignee_id ON public.assignment_logs(assignee_id);
CREATE INDEX idx_assignment_logs_created_at ON public.assignment_logs(created_at DESC);
CREATE INDEX idx_assignment_logs_assignment_type ON public.assignment_logs(assignment_type);

-- Create a function to log assignments
CREATE OR REPLACE FUNCTION public.log_assignment(
    p_match_id UUID,
    p_assigner_id UUID,
    p_assignee_id UUID,
    p_assignment_type TEXT,
    p_assignment_action TEXT,
    p_assignment_details JSONB DEFAULT '{}',
    p_previous_assignment_details JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.assignment_logs (
        match_id,
        assigner_id,
        assignee_id,
        assignment_type,
        assignment_action,
        assignment_details,
        previous_assignment_details,
        ip_address,
        user_agent
    ) VALUES (
        p_match_id,
        p_assigner_id,
        p_assignee_id,
        p_assignment_type,
        p_assignment_action,
        p_assignment_details,
        p_previous_assignment_details,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;