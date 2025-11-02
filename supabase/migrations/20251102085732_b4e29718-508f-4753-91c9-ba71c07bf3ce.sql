-- Create business_documents table to store all business documents
CREATE TABLE IF NOT EXISTS public.business_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('business_plan', 'business_model_canvas', 'market_study')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;

-- Policies for business_documents
CREATE POLICY "Users can view their own documents"
  ON public.business_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
  ON public.business_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.business_documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.business_documents
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents"
  ON public.business_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_business_documents_user_id ON public.business_documents(user_id);
CREATE INDEX idx_business_documents_type ON public.business_documents(document_type);
CREATE INDEX idx_business_documents_status ON public.business_documents(status);
CREATE INDEX idx_business_documents_created_at ON public.business_documents(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_business_documents_updated_at
  BEFORE UPDATE ON public.business_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();