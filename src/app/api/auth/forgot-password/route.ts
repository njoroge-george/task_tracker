import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { applyRateLimit } from "@/lib/rate-limit-middleware";

export async function POST(req: NextRequest) {
  try {
    // Apply strict rate limiting (5 requests per minute to prevent abuse)
    const rateLimitResult = await applyRateLimit(req, "auth");
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    // but only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Create reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

      // Send email
      try {
        await sendEmail({
          to: user.email!,
          subject: "Password Reset Request - Task Tracker",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">Password Reset Request</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px;">Hi ${user.name || 'there'},</p>
                  
                  <p style="font-size: 16px;">
                    We received a request to reset your password for your Task Tracker account.
                  </p>
                  
                  <p style="font-size: 16px;">
                    Click the button below to reset your password:
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                      Reset Password
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="font-size: 14px; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                    ${resetUrl}
                  </p>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    <strong>This link will expire in 1 hour.</strong>
                  </p>
                  
                  <p style="font-size: 14px; color: #666;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                  
                  <p style="font-size: 12px; color: #999; text-align: center;">
                    Task Tracker - Project Management Made Simple<br>
                    This is an automated email, please do not reply.
                  </p>
                </div>
              </body>
            </html>
          `,
          text: `
Hi ${user.name || 'there'},

We received a request to reset your password for your Task Tracker account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

---
Task Tracker - Project Management Made Simple
          `.trim(),
        });
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
        // Continue anyway to prevent email enumeration
      }
    }

    // Always return success message
    return NextResponse.json({
      message: "If an account exists with that email, you will receive password reset instructions.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
