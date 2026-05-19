# Supabase Setup Guide

This project relies heavily on Supabase for PostgreSQL Database and Object Storage. Follow these steps to configure your Supabase project.

## 1. Create a Project
- Go to [Supabase](https://supabase.com/) and create a new project.
- Once created, go to **Project Settings -> API** to retrieve your `URL`, `anon key`, and `service_role key`.
- Add these to your `.env.local` file.

## 2. Execute SQL Scripts
Supabase allows running SQL directly from their SQL Editor. You must run the included scripts in the `supabase/` folder in this exact order:

1. **`schema.sql`**: Builds all necessary tables (admins, positions, applications, etc).
2. **`storage.sql`**: Creates the necessary Storage Buckets for resumes, images, and brand assets.
3. **`rls.sql`**: Applies Row Level Security to protect data from public access while allowing the application APIs to securely insert files.
4. **`seed.sql`**: (Optional) Inserts your initial root Administrator account into the Database if you plan to rely on DB auth instead of `.env` overrides.

## 3. Storage Configuration
Ensure that the `documents` bucket is created. Our SQL script sets it as Public, meaning uploaded documents can be viewed freely by users with the URL (which are randomized UUIDs + standard nomenclature). If you wish to make documents completely private, you must modify the `rls.sql` policies to enforce authenticated retrieval.

Your application should now have full database capabilities!
