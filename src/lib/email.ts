import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS for port 587
  auth: {
    user: process.env.SMTP_USER || 'careers@gvpcdpgc.edu.in',
    pass: process.env.SMTP_PASS || 'wmar fdao seqh xvwv',
  },
  tls: {
    rejectUnauthorized: false // Helps avoid connection issues in some cloud environments
  }
});

export const buildConfirmationEmail = ({
  candidateName,
  positionTitle,
  departmentName,
  applicationNumber,
  candidateEmail,
  candidatePhone,
  dynamicResponses = {}
}: {
  candidateName: string;
  positionTitle: string;
  departmentName: string;
  applicationNumber: string;
  candidateEmail: string;
  candidatePhone: string;
  dynamicResponses?: any;
}) => {
  const collegeName = "GAYATRI VIDYA PARISHAD COLLEGE FOR DEGREE AND PG COURSE(A)";
  
  // Format dynamic responses into a readable summary
  const summaryEntries = Object.entries(dynamicResponses).map(([label, val]) => {
    // Basic formatting for the summary table
    return `<tr>
      <td style="padding: 8px 0; font-weight: 500; color: #475569; width: 40%; vertical-align: top;">${label}:</td>
      <td style="padding: 8px 0; color: #1e293b;">${Array.isArray(val) ? val.join(', ') : val}</td>
    </tr>`;
  }).join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="https://www.gvpcdpgc.edu.in/gvpcdpgc-logo.png" alt="GVP Logo" style="width: 80px; height: 80px; margin-bottom: 12px;"/>
        <h1 style="font-size: 20px; color: #1e40af; margin: 0;">${collegeName}</h1>
      </div>
      
      <div style="padding: 24px; background-color: #f8fafc; border-radius: 6px;">
        <h2 style="font-size: 18px; margin-bottom: 16px;">Application Received!</h2>
        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>Thank you for applying for the position of <strong>${positionTitle}</strong> (${departmentName}) at ${collegeName}.</p>
        <p>Your application number is: <strong>${applicationNumber}</strong></p>
        <p style="font-weight: 500; color: #1e40af;">We have successfully received your application.</p>
        
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <h3 style="font-size: 16px; margin-bottom: 12px; color: #1e40af;">Application Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #475569; width: 40%;">Position:</td>
              <td style="padding: 8px 0; color: #1e293b;">${positionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #475569;">Department:</td>
              <td style="padding: 8px 0; color: #1e293b;">${departmentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #475569;">Full Name:</td>
              <td style="padding: 8px 0; color: #1e293b;">${candidateName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #475569;">Email:</td>
              <td style="padding: 8px 0; color: #1e293b;">${candidateEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #475569;">Phone:</td>
              <td style="padding: 8px 0; color: #1e293b;">${candidatePhone}</td>
            </tr>
            ${summaryEntries}
          </table>
        </div>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #64748b; margin: 0;">Our recruitment team will review your application and get back to you shortly.</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
        <p>&copy; ${new Date().getFullYear()} ${collegeName}. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;
};

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    await transporter.sendMail({
      from: `"GVP Recruitment" <${process.env.SMTP_USER || 'careers@gvpcdpgc.edu.in'}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}
