-- Add scan_type column to detection_results
ALTER TABLE public.detection_results 
ADD COLUMN scan_type TEXT NOT NULL DEFAULT 'automatic';

-- Add original_filename for manual scans
ALTER TABLE public.detection_results 
ADD COLUMN original_filename TEXT;

-- Add file_size for manual scans
ALTER TABLE public.detection_results 
ADD COLUMN file_size BIGINT;

-- Add file_extension for manual scans
ALTER TABLE public.detection_results 
ADD COLUMN file_extension TEXT;

-- Add entropy for manual scans
ALTER TABLE public.detection_results 
ADD COLUMN entropy NUMERIC;

-- Create storage bucket for manual scan uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('manual-scans', 'manual-scans', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Authenticated users can upload to manual-scans
CREATE POLICY "Authenticated users can upload scan files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'manual-scans' AND auth.uid() IS NOT NULL);

-- RLS policy: Authenticated users can view their own uploads
CREATE POLICY "Users can view scan files"
ON storage.objects FOR SELECT
USING (bucket_id = 'manual-scans' AND auth.uid() IS NOT NULL);

-- RLS policy: Admins can delete scan files
CREATE POLICY "Admins can delete scan files"
ON storage.objects FOR DELETE
USING (bucket_id = 'manual-scans' AND public.is_admin(auth.uid()));