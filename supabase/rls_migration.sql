-- supabase/rls_migration.sql

-- 1. Enable RLS on all sensitive tables
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Positions Policies
-- Public can only see 'open' positions
CREATE POLICY "Public can view open positions" ON positions
    FOR SELECT USING (status = 'open');

-- Only admins (service_role or authenticated) can manage positions
CREATE POLICY "Admins manage positions" ON positions
    FOR ALL USING (auth.role() = 'service_role');

-- 3. Position Forms Policies
CREATE POLICY "Admins manage position forms" ON position_forms
    FOR ALL USING (auth.role() = 'service_role');

-- 4. Applications Policies
-- Public can only insert applications
CREATE POLICY "Public can apply" ON applications
    FOR INSERT WITH CHECK (true);

-- Only admins can see application data
CREATE POLICY "Admins view applications" ON applications
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admins manage applications" ON applications
    FOR ALL USING (auth.role() = 'service_role');

-- 5. Application Files Policies
CREATE POLICY "Public can upload files" ON application_files
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view files" ON application_files
    FOR SELECT USING (auth.role() = 'service_role');

-- 6. Audit Logs Policies
CREATE POLICY "Admins view audit logs" ON admin_audit_logs
    FOR SELECT USING (auth.role() = 'service_role');

-- 7. Branding Settings (Public)
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view branding" ON branding_settings
    FOR SELECT USING (true);
