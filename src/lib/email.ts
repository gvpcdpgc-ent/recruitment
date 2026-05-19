import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
  const from = `"${process.env.SMTP_FROM_NAME || 'Faculty Recruitment'}" <${process.env.SMTP_USER}>`;
  await transporter.sendMail({ from, to, subject, html });
}

export function buildConfirmationEmail({
  candidateName,
  positionTitle,
  applicationNumber,
  instituteName,
}: {
  candidateName: string;
  positionTitle: string;
  applicationNumber: string;
  instituteName: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background: #1e3a5f; padding: 20px 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">${instituteName}</h1>
        <p style="color: #c8d8f0; margin: 4px 0 0; font-size: 13px;">Faculty Recruitment Portal</p>
      </div>
      <div style="border: 1px solid #ddd; border-top: none; padding: 28px 24px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1e3a5f; margin-top: 0;">Application Received!</h2>
        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>Thank you for applying. We have received your application for:</p>
        <div style="background: #f4f8ff; border-left: 4px solid #1e3a5f; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; font-size: 16px;">${positionTitle}</p>
        </div>
        <p>Your application reference number is:</p>
        <div style="background: #1e3a5f; color: #fff; text-align: center; padding: 14px; border-radius: 6px; margin: 16px 0; font-family: monospace; font-size: 22px; letter-spacing: 3px;">
          ${applicationNumber}
        </div>
        <p style="color: #555;">Please save this number. You can use it to inquire about your application status.</p>
        <p>Our recruitment committee will review your application and contact you for further steps.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message from ${instituteName}. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;
}
