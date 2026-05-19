-- supabase/rls.sql

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;

-- Note: Our Next.js App routes (Admin Backend) will use the SERVICE_ROLE_KEY to bypass RLS.
-- The following policies are strict policies for the FRONTEND (ANON KEY).

-- Admins: No access to Anon
-- (Handled by default, no policy created)

-- Branding: Public can view
CREATE POLICY "Public can view branding" ON branding_settings FOR SELECT USING (true);

-- Departments: Public can view
CREATE POLICY "Public can view departments" ON departments FOR SELECT USING (true);

-- Positions: Public can only view open and closed (not hidden)
CREATE POLICY "Public can view visible positions" ON positions FOR SELECT USING (status IN ('open', 'closed'));

-- Position Forms: Public can view forms for visible positions
CREATE POLICY "Public can view forms for visible positions" ON position_forms FOR SELECT USING (
    EXISTS (SELECT 1 FROM positions WHERE positions.id = position_forms.position_id AND positions.status IN ('open', 'closed'))
);

-- Applications: Public can ONLY INSERT
CREATE POLICY "Public can insert applications" ON applications FOR INSERT WITH CHECK (true);

-- Application Files: Public can ONLY INSERT
CREATE POLICY "Public can insert application files" ON application_files FOR INSERT WITH CHECK (true);

-- Everything else is completely restricted for Anon users (logs, notes, audit).
