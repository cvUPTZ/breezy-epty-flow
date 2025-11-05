-- Add a flag to identify supporting documents vs main business documents
ALTER TABLE business_documents 
ADD COLUMN IF NOT EXISTS is_supporting_document BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_business_documents_is_supporting 
ON business_documents(is_supporting_document, document_type);