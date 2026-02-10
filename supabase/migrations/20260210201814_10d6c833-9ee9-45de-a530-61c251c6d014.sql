
-- Table to store sub-app metadata
CREATE TABLE public.sub_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT DEFAULT 'AppWindow',
  status TEXT NOT NULL DEFAULT 'active',
  entry_path TEXT NOT NULL DEFAULT 'index.html',
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sub_apps ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view sub-apps
CREATE POLICY "Authenticated users can view sub-apps"
  ON public.sub_apps FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can manage sub-apps (insert/update/delete via app logic)
CREATE POLICY "Admins can insert sub-apps"
  ON public.sub_apps FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can update sub-apps"
  ON public.sub_apps FOR UPDATE
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can delete sub-apps"
  ON public.sub_apps FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Updated_at trigger
CREATE TRIGGER update_sub_apps_updated_at
  BEFORE UPDATE ON public.sub_apps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for sub-app files
INSERT INTO storage.buckets (id, name, public) VALUES ('sub-apps', 'sub-apps', true);

-- Storage policies
CREATE POLICY "Anyone can view sub-app files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sub-apps');

CREATE POLICY "Authenticated users can upload sub-app files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sub-apps' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sub-app files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'sub-apps' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sub-app files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sub-apps' AND auth.role() = 'authenticated');
