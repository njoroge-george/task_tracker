import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

type MailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

const {
  SMTP_HOST,
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_SECURE,
  SMTP_FROM,
} = process.env;

const DEFAULT_FROM = SMTP_FROM || SMTP_USER || "noreply@tasktracker.com";

let transporterPromise:
  | Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>>
  | null = null;

function isEmailConfigured(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);
}

async function getTransporter() {
  if (!transporterPromise) {
    if (!isEmailConfigured()) {
      throw new Error(
        "SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in your environment variables."
      );
    }

    const secureFlag =
      SMTP_SECURE?.toLowerCase() === "true" || Number(SMTP_PORT) === 465;

    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: secureFlag,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      })
    ).then(async (transporter) => {
      try {
        await transporter.verify();
        return transporter;
      } catch (error) {
        console.error("Failed to verify SMTP transporter:", error);
        throw error;
      }
    });
  }

  return transporterPromise;
}

export async function sendEmail({ to, subject, html, text }: MailPayload) {
  if (!isEmailConfigured()) {
    console.warn(
      "Email not sent. SMTP configuration is missing. Check your environment variables."
    );
    return;
  }

  const transporter = await getTransporter();

  try {
    await transporter.sendMail({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export async function sendNotificationEmail({
  to,
  title,
  message,
  link,
}: {
  to: string;
  title: string;
  message: string;
  link?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 24px; border-radius: 12px 12px 0 0; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px;">${title}</h1>
        </div>
        <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 16px 0; font-size: 15px;">${message}</p>
          ${
            link
              ? `<div style="margin-top: 24px;">
                  <a href="${link}" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    View Details
                  </a>
                </div>`
              : ""
          }
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #6b7280; text-align: center;">
          © ${new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
      </body>
    </html>
  `;

  await sendEmail({ to, subject: title, html });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail({
    to,
    subject: "Welcome to TaskFlow! 🎉",
    html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TaskFlow!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                We're thrilled to have you on board! TaskFlow is here to help you and your team manage tasks, 
                collaborate seamlessly, and deliver projects faster.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #667eea; margin-top: 0;">🚀 Quick Start Guide</h3>
                <ul style="padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Create your first project</li>
                  <li style="margin-bottom: 10px;">Add tasks and assign them to team members</li>
                  <li style="margin-bottom: 10px;">Use the Kanban board for visual task management</li>
                  <li style="margin-bottom: 10px;">Track progress with analytics and reports</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                   style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Need help? Reply to this email or visit our <a href="${process.env.NEXTAUTH_URL}" style="color: #667eea;">help center</a>.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
              <p>© 2025 TaskFlow. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
  });
}

export async function sendTaskAssignmentEmail(
  to: string,
  taskTitle: string,
  assignedBy: string,
  projectName: string,
  taskUrl: string
) {
  await sendEmail({
    to,
    subject: `New Task Assigned: ${taskTitle}`,
    html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📋 New Task Assigned</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${assignedBy}</strong> has assigned you a new task:
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${taskTitle}</h3>
                <p style="color: #666; margin: 0; font-size: 14px;">Project: ${projectName}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${taskUrl}" 
                   style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Task
                </a>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
              <p>© 2025 TaskFlow. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
  });
}

export async function sendCommentNotificationEmail(
  to: string,
  commenterName: string,
  taskTitle: string,
  comment: string,
  taskUrl: string
) {
  await sendEmail({
    to,
    subject: `New Comment on: ${taskTitle}`,
    html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">💬 New Comment</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${commenterName}</strong> commented on <strong>${taskTitle}</strong>:
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #333; font-style: italic;">"${comment}"</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${taskUrl}" 
                   style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Task
                </a>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
              <p>© 2025 TaskFlow. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
  });
}

export async function sendSubscriptionConfirmationEmail(
  to: string,
  name: string,
  plan: string,
  amount: number
) {
  await sendEmail({
    to,
    subject: `Welcome to TaskFlow ${plan}! 🎊`,
    html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎊 Subscription Confirmed!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for subscribing to TaskFlow ${plan}! Your subscription is now active.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #667eea; margin-top: 0;">Subscription Details</h3>
                <p style="margin: 10px 0;"><strong>Plan:</strong> ${plan}</p>
                <p style="margin: 10px 0;"><strong>Amount:</strong> $${amount}/month</p>
                <p style="margin: 10px 0;"><strong>Billing:</strong> Monthly</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard/billing" 
                   style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Manage Subscription
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Questions? Contact us at support@taskflow.com
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
              <p>© 2025 TaskFlow. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
  });
}
