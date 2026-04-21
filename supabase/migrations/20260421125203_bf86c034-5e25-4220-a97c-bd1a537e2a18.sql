-- Add audio fields to videos
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS audio_path text;

-- Create public audio bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

-- Admin write
CREATE POLICY "Admins upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));