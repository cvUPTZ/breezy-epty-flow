
-- Create ML detection jobs table
CREATE TABLE IF NOT EXISTS ml_detection_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_url TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    config JSONB NOT NULL DEFAULT '{}',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    results JSONB,
    external_job_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE
);

-- Create ML detection results table for better querying
CREATE TABLE IF NOT EXISTS ml_detection_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES ml_detection_jobs(id) ON DELETE CASCADE,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ml_jobs_status ON ml_detection_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ml_jobs_user_id ON ml_detection_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_jobs_created_at ON ml_detection_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_ml_jobs_priority ON ml_detection_jobs(priority);

-- Enable RLS
ALTER TABLE ml_detection_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_detection_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own ML jobs" ON ml_detection_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ML jobs" ON ml_detection_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ML jobs" ON ml_detection_jobs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all ML jobs" ON ml_detection_jobs
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view results for their jobs" ON ml_detection_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ml_detection_jobs 
            WHERE ml_detection_jobs.id = ml_detection_results.job_id 
            AND ml_detection_jobs.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all ML results" ON ml_detection_results
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to get queue statistics
CREATE OR REPLACE FUNCTION get_ml_queue_stats()
RETURNS TABLE (
    total_jobs BIGINT,
    queued_jobs BIGINT,
    processing_jobs BIGINT,
    completed_jobs BIGINT,
    failed_jobs BIGINT,
    average_processing_time FLOAT,
    estimated_wait_time FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'queued') as queued,
            COUNT(*) FILTER (WHERE status = 'processing') as processing,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'failed') as failed,
            AVG(EXTRACT(EPOCH FROM (completed_at - started_at)))::FLOAT as avg_time
        FROM ml_detection_jobs
        WHERE created_at > NOW() - INTERVAL '24 hours'
    ),
    queue_estimate AS (
        SELECT 
            COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))), 300) * 
            (SELECT COUNT(*) FROM ml_detection_jobs WHERE status = 'queued') as est_wait
        FROM ml_detection_jobs
        WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '6 hours'
    )
    SELECT 
        s.total,
        s.queued,
        s.processing,
        s.completed,
        s.failed,
        COALESCE(s.avg_time, 0),
        COALESCE(q.est_wait, 0)
    FROM stats s, queue_estimate q;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
