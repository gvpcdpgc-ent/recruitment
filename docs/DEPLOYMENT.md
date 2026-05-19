# Vercel Deployment Guide

Deploying this Faculty Recruitment application to Vercel is highly recommended for optimal performance with Next.js 15.

## 1. Preparation
- Push your local code to a GitHub, GitLab, or Bitbucket repository.
- Ensure your project structure has `next.config.ts`, `package.json`, and all standard Next.js files at the root level.

## 2. Deploy to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New -> Project**.
3. Import your Git repository.
4. Vercel will automatically detect the **Next.js** framework. Leave the build commands as default (`npm run build`).

## 3. Environment Variables
Before clicking Deploy, expand the **Environment Variables** section and add everything from your `.env.example`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (generate a strong random string)
- `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

*(Note: Never prefix sensitive keys like `SUPABASE_SERVICE_ROLE_KEY` or `JWT_SECRET` with `NEXT_PUBLIC_`, as this will expose them to the browser!)*

## 4. Finalizing
Click **Deploy**. Vercel will build the application. Since we use `revalidate = 0` on dynamic Admin routes, the app is fully compatible with Edge caching but ensures Admin data is always fresh.

Once deployed, visit your assigned `.vercel.app` domain and test the Admin Login!
