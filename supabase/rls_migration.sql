-- supabase/rls_migration.sql

-- 1. Enable RLS on all sensitive tables
ALTER TABLE IF EXISTS positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS position_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS application_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS branding_settings ENABLE ROW LEVEL SECURITY;

-- 2. Positions Policies
DROP POLICY IF EXISTS "Public can view open positions" ON positions;
CREATE POLICY "Public can view open positions" ON positions
    FOR SELECT USING (status = 'open');

DROP POLICY IF EXISTS "Admins manage positions" ON positions;
CREATE POLICY "Admins manage positions" ON positions
    FOR ALL USING (auth.role() = 'service_role');

-- 3. Position Forms Policies
DROP POLICY IF EXISTS "Admins manage position forms" ON position_forms;
CREATE POLICY "Admins manage position forms" ON position_forms
    FOR ALL USING (auth.role() = 'service_role');

-- 4. Applications Policies
DROP POLICY IF EXISTS "Public can apply" ON applications;
CREATE POLICY "Public can apply" ON applications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins view applications" ON applications;
CREATE POLICY "Admins view applications" ON applications
    FOR SELECT USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins manage applications" ON applications;
CREATE POLICY "Admins manage applications" ON applications
    FOR ALL USING (auth.role() = 'service_role');

-- 5. Application Files Policies
DROP POLICY IF EXISTS "Public can upload files" ON application_files;
CREATE POLICY "Public can upload files" ON application_files
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins view files" ON application_files;
CREATE POLICY "Admins view files" ON application_files
    FOR SELECT USING (auth.role() = 'service_role');

-- 6. Audit Logs Policies
DROP POLICY IF EXISTS "Admins view audit logs" ON admin_audit_logs;
CREATE POLICY "Admins view audit logs" ON admin_audit_logs
    FOR SELECT USING (auth.role() = 'service_role');

-- 7. Branding Settings (Public)
DROP POLICY IF EXISTS "Public can view branding" ON branding_settings;
CREATE POLICY "Public can view branding" ON branding_settings
    FOR SELECT USING (true);
