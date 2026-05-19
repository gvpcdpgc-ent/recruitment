-- supabase/storage.sql

INSERT INTO storage.buckets (id, name, public) VALUES 
('resumes', 'resumes', false),
('photos', 'photos', true),
('documents', 'documents', false),
('application-pdfs', 'application-pdfs', false),
('brand-assets', 'brand-assets', true);

-- Enable RLS for buckets
-- Anon can upload logic will be done via API, but if configured via direct client upload:
-- We can enforce policies on storage.objects

CREATE POLICY "Allow public insert to photo bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Allow public view to photo bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photos');

CREATE POLICY "Allow public insert to documents bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public insert to resumes bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resumes');
    
-- Note: It is best practice to handle actual file uniqueness and validation on the Backend API.
