-- supabase/migrations/20250917110300_create_code_analysis_jobs_table.sql

-- 1. Create an ENUM type for the job status
CREATE TYPE public.code_analysis_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);

-- 2. Create the jobs table
CREATE TABLE public.code_analysis_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    status public.code_analysis_status NOT NULL DEFAULT 'pending',
    payload jsonb NOT NULL,
    result jsonb,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Add comments to the table and columns for clarity
COMMENT ON TABLE public.code_analysis_jobs IS 'Stores jobs for asynchronous code analysis.';
COMMENT ON COLUMN public.code_analysis_jobs.payload IS 'Input for the job, e.g., { "githubUrl": "..." } or { "filePaths": [...] }.';
COMMENT ON COLUMN public.code_analysis_jobs.result IS 'The JSON output of the successful analysis.';

-- 4. Create a function to update the `updated_at` timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a trigger to automatically update the `updated_at` column
CREATE TRIGGER on_code_analysis_jobs_updated
BEFORE UPDATE ON public.code_analysis_jobs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.code_analysis_jobs ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
-- Allow users to see their own jobs
CREATE POLICY "Allow users to read their own jobs"
ON public.code_analysis_jobs
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to create jobs for themselves
CREATE POLICY "Allow users to create their own jobs"
ON public.code_analysis_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- The service_role key will be used by the edge function to update the status and result, bypassing RLS.
