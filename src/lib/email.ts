'use server';

import type { Alert } from '@/types';
import nodemailer from 'nodemailer';

// Ensure required environment variables are set
if (
  !process.env.SMTP_HOST ||
  !process.env.SMTP_PORT ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS
) {
  console.warn(
    'SMTP environment variables are not fully configured. Email notifications will be disabled.'
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateEmailHtml(alert: Alert): string {
  const severityColor = alert.severity.toLowerCase() === 'high' ? '#dc2626' : alert.severity.toLowerCase() === 'medium' ? '#f59e0b' : '#22c55e';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Emergency Alert: ${alert.emergencyType}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; color: #343a40; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6; }
            .header { background-color: #343a40; color: #ffffff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 20px; }
            .content h2 { font-size: 20px; color: #495057; margin-top: 0; }
            .alert-message { font-size: 18px; font-weight: 500; margin-bottom: 20px; }
            .details-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
            .detail-item { background-color: #f1f3f5; padding: 15px; border-radius: 6px; }
            .detail-item strong { display: block; margin-bottom: 5px; color: #212529; }
            .image-container { text-align: center; margin-top: 20px; }
            .image-container img { max-width: 100%; border-radius: 6px; }
            .severity { padding: 5px 10px; border-radius: 9999px; color: #ffffff; font-weight: 600; text-transform: capitalize; }
            .footer { background-color: #f1f3f5; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Emergency Alert</h1>
            </div>
            <div class="content">
                <p class="alert-message">${alert.alertMessage}</p>
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Severity</strong>
                        <span class="severity" style="background-color: ${severityColor};">${alert.severity}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Emergency Type</strong>
                        <span style="text-transform: capitalize;">${alert.emergencyType}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Location</strong>
                        ${alert.locationDetails || alert.location}
                    </div>
                    <div class="detail-item">
                        <strong>Recommended Actions</strong>
                        ${alert.recommendedActions}
                    </div>
                </div>
                <div class="image-container">
                    <strong>Incident Image</strong>
                    <br />
                    <img src="cid:incidentImage" alt="Incident Image">
                </div>
            </div>
            <div class="footer">
                This is an automated alert from Edge Guardian.
            </div>
        </div>
    </body>
    </html>
  `;
}


export async function sendAlertEmail(alert: Alert, recipients: string) {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error('SMTP service is not configured on the server.');
  }

  const mailOptions = {
    from: `"Edge Guardian Alert" <${process.env.SMTP_USER}>`,
    to: recipients,
    subject: `❗ Emergency Alert: ${alert.emergencyType.charAt(0).toUpperCase() + alert.emergencyType.slice(1)} Detected`,
    html: generateEmailHtml(alert),
    attachments: [
      {
        filename: 'incident.jpg',
        path: alert.imageUrl,
        cid: 'incidentImage' // same cid value as in the HTML img src
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email via SMTP.');
  }
}
