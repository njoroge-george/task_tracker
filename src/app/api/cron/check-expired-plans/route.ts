import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Cron job to check and downgrade expired plans
 * This should be called daily via a cron service (e.g., Vercel Cron, GitHub Actions)
 * 
 * Setup:
 * - Add to vercel.json cron configuration
 * - Or call manually via GET request
 * 
 * Security: Add CRON_SECRET to .env and validate it here
 */
export async function GET(req: NextRequest) {
  try {
    // Validate cron secret (optional but recommended)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find all users with expired plans
    const expiredUsers = await prisma.user.findMany({
      where: {
        plan: {
          in: ['PRO', 'ENTERPRISE'],
        },
        planExpiresAt: {
          lt: now, // Less than current date (expired)
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

    if (expiredUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired plans found',
        processedCount: 0,
      });
    }

    // Downgrade expired users to FREE plan
    const downgradePromises = expiredUsers.map((user) =>
      prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'FREE',
          planExpiresAt: null,
        },
      })
    );

    await Promise.all(downgradePromises);

    // TODO: Send email notifications to downgraded users
    console.log(`Downgraded ${expiredUsers.length} users with expired plans:`, 
      expiredUsers.map(u => ({ email: u.email, plan: u.plan, expiredAt: u.planExpiresAt }))
    );

    return NextResponse.json({
      success: true,
      message: `Successfully downgraded ${expiredUsers.length} expired plan(s)`,
      processedCount: expiredUsers.length,
      downgradedUsers: expiredUsers.map(u => ({
        email: u.email,
        previousPlan: u.plan,
        expiredAt: u.planExpiresAt,
      })),
    });
  } catch (error) {
    console.error('Check expired plans error:', error);
    return NextResponse.json(
      { error: 'Failed to check expired plans' },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(req: NextRequest) {
  return GET(req);
}
