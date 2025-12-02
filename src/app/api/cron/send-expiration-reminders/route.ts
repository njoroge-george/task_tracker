import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

/**
 * Cron job to send expiration reminders to users
 * Run this daily to notify users whose plans are expiring soon
 * 
 * Reminders sent:
 * - 7 days before expiration
 * - 3 days before expiration
 * - 1 day before expiration
 */
export async function GET(req: NextRequest) {
  try {
    // Validate cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    
    // Calculate reminder dates
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(now.getDate() + 1);

    // Find users with plans expiring in 7, 3, or 1 day
    const expiringUsers = await prisma.user.findMany({
      where: {
        plan: {
          in: ['PRO', 'ENTERPRISE'],
        },
        planExpiresAt: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planExpiresAt: true,
      },
    });

    let sentCount = 0;

    for (const user of expiringUsers) {
      if (!user.email || !user.planExpiresAt) continue;

      const daysUntilExpiry = Math.ceil(
        (user.planExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only send reminders at specific intervals
      if (![7, 3, 1].includes(daysUntilExpiry)) continue;

      const expiryDate = user.planExpiresAt.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      try {
        await sendEmail({
          to: user.email,
          subject: `Your ${user.plan} plan expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Plan Expiration Reminder</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">⏰ Plan Expiring Soon</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px;">Hi ${user.name || 'there'},</p>
                  
                  <p style="font-size: 16px;">
                    Your <strong>${user.plan}</strong> plan will expire in <strong>${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}</strong>.
                  </p>
                  
                  <div style="background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      <strong>Expiration Date:</strong> ${expiryDate}
                    </p>
                  </div>
                  
                  <p style="font-size: 16px;">
                    To continue enjoying premium features, please renew your subscription before it expires.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/dashboard/pricing" 
                       style="background: #f59e0b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                      Renew Now
                    </a>
                  </div>
                  
                  <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                      <strong>⚠️ What happens if I don't renew?</strong><br>
                      After expiration, your account will be downgraded to the Free plan. You'll lose access to premium features, but your data will be preserved.
                    </p>
                  </div>
                  
                  <h3 style="color: #333; margin-top: 30px;">Renewal Instructions:</h3>
                  <ol style="font-size: 14px; color: #666;">
                    <li>Visit the <a href="${process.env.NEXTAUTH_URL}/dashboard/pricing" style="color: #f59e0b;">Pricing Page</a></li>
                    <li>Pay via M-Pesa Paybill: <strong>600100</strong></li>
                    <li>Account Number: <strong>0100007828831</strong></li>
                    <li>Submit your transaction code for verification</li>
                  </ol>
                  
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                  
                  <p style="font-size: 12px; color: #999; text-align: center;">
                    Task Tracker - Project Management Made Simple<br>
                    This is an automated reminder. Need help? Contact support.
                  </p>
                </div>
              </body>
            </html>
          `,
          text: `
Hi ${user.name || 'there'},

Your ${user.plan} plan will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}.

Expiration Date: ${expiryDate}

To continue enjoying premium features, please renew your subscription before it expires.

Renewal Instructions:
1. Visit ${process.env.NEXTAUTH_URL}/dashboard/pricing
2. Pay via M-Pesa Paybill: 600100
3. Account Number: 0100007828831
4. Submit your transaction code for verification

What happens if I don't renew?
After expiration, your account will be downgraded to the Free plan. You'll lose access to premium features, but your data will be preserved.

---
Task Tracker - Project Management Made Simple
          `.trim(),
        });

        sentCount++;
        console.log(`Sent ${daysUntilExpiry}-day expiration reminder to ${user.email}`);
      } catch (emailError) {
        console.error(`Failed to send reminder to ${user.email}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} expiration reminder(s)`,
      sentCount,
    });
  } catch (error) {
    console.error('Send expiration reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to send expiration reminders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
