-- supabase/seed.sql

-- Insert base department
INSERT INTO departments (id, name) VALUES 
('d1111111-1111-1111-1111-111111111111', 'Computer Science and Engineering'),
('d2222222-2222-2222-2222-222222222222', 'Information Technology'),
('d3333333-3333-3333-3333-333333333333', 'Electronics and Communication Engineering'),
('d4444444-4444-4444-4444-444444444444', 'Mechanical Engineering');

-- Insert branding
INSERT INTO branding_settings (id, institute_name, footer_text, contact_email) 
VALUES ('b1111111-1111-1111-1111-111111111111', 'Global University', '© 2026 Global University. All rights reserved.', 'recruitment@globaluniversity.edu');
