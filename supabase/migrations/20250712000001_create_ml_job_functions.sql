
-- Helper functions for ML job operations since the table isn't in TypeScript types yet

-- Function to create ML job
CREATE OR REPLACE FUNCTION create_ml_job(
    p_video_url TEXT,
    p_user_id UUID,
    p_priority TEXT DEFAULT 'normal',
    p_config JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    job_id UUID;
BEGIN
    INSERT INTO ml_detection_jobs (
        video_url,
        user_id,
        status,
        priority,
        config,
        progress
    ) VALUES (
        p_video_url,
        p_user_id,
        'queued',
        p_priority,
        p_config,
        0
    ) RETURNING id INTO job_id;
    
    RETURN job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get ML job
CREATE OR REPLACE FUNCTION get_ml_job(p_job_id UUID)
RETURNS TABLE (
    id UUID,
    video_url TEXT,
    user_id UUID,
    status TEXT,
    priority TEXT,
    config JSONB,
    progress INTEGER,
    error_message TEXT,
    results JSONB,
    created_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_completion TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.video_url,
        j.user_id,
        j.status,
        j.priority,
        j.config,
        j.progress,
        j.error_message,
        j.results,
        j.created_at,
        j.started_at,
        j.completed_at,
        j.estimated_completion
    FROM ml_detection_jobs j
    WHERE j.id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user ML jobs
CREATE OR REPLACE FUNCTION get_user_ml_jobs(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    video_url TEXT,
    user_id UUID,
    status TEXT,
    priority TEXT,
    config JSONB,
    progress INTEGER,
    error_message TEXT,
    results JSONB,
    created_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_completion TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.video_url,
        j.user_id,
        j.status,
        j.priority,
        j.config,
        j.progress,
        j.error_message,
        j.results,
        j.created_at,
        j.started_at,
        j.completed_at,
        j.estimated_completion
    FROM ml_detection_jobs j
    WHERE j.user_id = p_user_id
    ORDER BY j.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel ML job
CREATE OR REPLACE FUNCTION cancel_ml_job(
    p_job_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE ml_detection_jobs 
    SET 
        status = 'cancelled',
        completed_at = NOW()
    WHERE id = p_job_id AND user_id = p_user_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
