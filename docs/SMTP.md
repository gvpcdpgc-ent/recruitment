# SMTP Configuration Guide

The Faculty Recruitment System uses SMTP to send automated emails (e.g. application confirmations, shortlisted notifications, and password resets). 

## 1. Environment Configuration

You must configure SMTP in your standard `.env.local` or environment variables on Vercel.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-university-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

## 2. Setting up Google Workspace (or Gmail) for SMTP
If you are using Google to handle your emails:
1. Navigate to your Google Account Settings -> **Security**.
2. Ensure **2-Step Verification** is turned ON.
3. Search for **App Passwords**.
4. Generate a new App Password for "Faculty Portal".
5. Paste the 16-character string into `SMTP_PASS`. DO NOT use your actual account password.

## 3. Alternative Providers
You can easily swap this out for Resend, Sendgrid, or Postmark by simply swapping the HOST and PORT, and utilizing their API keys as the `SMTP_PASS`.

The email templates are dynamically generated inside the server API layer using the Institute Name branding from the `branding_settings` table.
