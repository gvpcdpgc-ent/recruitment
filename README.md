# Faculty Recruitment Management System

A production-grade, highly polished recruitment portal tailored for universities and institutes. Built with modern web standards to provide a beautiful candidate experience and a powerful administrative backend.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons & Animations:** Lucide React + Framer Motion
- **Database & Auth:** Supabase (PostgreSQL, Storage)
- **Forms & Validation:** React Hook Form + Zod

## Features
1. **Candidate Portal:** 
   - View open positions with dynamic requirements.
   - Multi-step application wizard with dynamic form generation.
   - Secure document uploading directly to Supabase Storage.
2. **Admin Panel (`/gvp-admin`):** 
   - Secure Dashboard powered by custom JWT middleware.
   - Position & Dynamic Form Builder (Create custom requirements and fields per role).
   - Application tracking and candidate review pipeline.
   - Export utilities and analytics.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase variables. Ensure you have run the provided SQL setup scripts in `supabase/` first. Check `docs/SUPABASE.md` for more details.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` to view the candidate portal.
5. Open `http://localhost:3000/gvp-admin` to view the admin portal (use your `.env` configured admin credentials).

## Documentation
- [Supabase Setup Guide](docs/SUPABASE.md)
- [Vercel Deployment Guide](docs/DEPLOYMENT.md)
- [SMTP / Emails Guide](docs/SMTP.md)

## Design Aesthetics
The system strictly adheres to a premium light-theme design system mimicking modern educational management software, utilizing deep blues (`hsl(221 39% 11%)`) and white glassmorphism effects.
