-- Create error logs table for comprehensive error tracking
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  error_type TEXT NOT NULL, -- 'frontend', 'backend', 'network', 'auth'
  error_category TEXT NOT NULL, -- 'runtime', 'api', 'validation', 'auth', 'network'
  error_code TEXT,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  component_name TEXT,
  function_name TEXT,
  url TEXT,
  user_agent TEXT,
  session_id TEXT,
  request_id TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'error', -- 'critical', 'error', 'warning', 'info'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'ignored'
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  occurrences INTEGER DEFAULT 1,
  first_occurrence TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_occurrence TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for error logs
CREATE POLICY "Admins can view all error logs" 
ON public.error_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own error logs" 
ON public.error_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert error logs" 
ON public.error_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update error logs" 
ON public.error_logs 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_status ON public.error_logs(status);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at);
CREATE INDEX idx_error_logs_last_occurrence ON public.error_logs(last_occurrence);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_error_logs_updated_at
BEFORE UPDATE ON public.error_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log errors with deduplication
CREATE OR REPLACE FUNCTION public.log_error(
  p_error_type TEXT,
  p_error_category TEXT,
  p_error_code TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT '',
  p_stack_trace TEXT DEFAULT NULL,
  p_component_name TEXT DEFAULT NULL,
  p_function_name TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_request_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'error'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_error_id UUID;
  error_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Check for duplicate error (same message, component, and user within last hour)
  SELECT id INTO existing_error_id
  FROM public.error_logs
  WHERE 
    error_message = p_error_message
    AND COALESCE(component_name, '') = COALESCE(p_component_name, '')
    AND COALESCE(user_id::text, '') = COALESCE(current_user_id::text, '')
    AND last_occurrence > (now() - INTERVAL '1 hour')
    AND status != 'resolved'
  ORDER BY last_occurrence DESC
  LIMIT 1;

  -- If duplicate found, update occurrence count and timestamp
  IF existing_error_id IS NOT NULL THEN
    UPDATE public.error_logs
    SET 
      occurrences = occurrences + 1,
      last_occurrence = now(),
      updated_at = now(),
      metadata = COALESCE(metadata, '{}') || COALESCE(p_metadata, '{}')
    WHERE id = existing_error_id;
    
    RETURN existing_error_id;
  END IF;

  -- Insert new error log
  INSERT INTO public.error_logs (
    user_id,
    error_type,
    error_category,
    error_code,
    error_message,
    stack_trace,
    component_name,
    function_name,
    url,
    user_agent,
    session_id,
    request_id,
    metadata,
    severity
  ) VALUES (
    current_user_id,
    p_error_type,
    p_error_category,
    p_error_code,
    p_error_message,
    p_stack_trace,
    p_component_name,
    p_function_name,
    p_url,
    p_user_agent,
    p_session_id,
    p_request_id,
    p_metadata,
    p_severity
  ) RETURNING id INTO error_id;

  RETURN error_id;
END;
$$;