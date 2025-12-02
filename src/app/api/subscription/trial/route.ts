import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/subscription/trial - start a free trial (e.g. 7 days) for eligible FREE user
export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const now = new Date();
  // Eligibility: must be FREE plan and have no active or expired trial (single use)
  if (user.plan !== 'FREE') {
    return NextResponse.json({ error: 'Already on paid plan' }, { status: 400 });
  }
  const trialEndsAtCurrent = (user as any)?.trialEndsAt as Date | undefined;
  if (trialEndsAtCurrent) {
    if (trialEndsAtCurrent > now) {
      return NextResponse.json({ error: 'Active trial already running' }, { status: 400 });
    } else {
      return NextResponse.json({ error: 'Trial already used' }, { status: 400 });
    }
  }
  const trialDays = parseInt(process.env.PLAYGROUND_TRIAL_DAYS || '7', 10);
  const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  await (prisma as any).user.update({ where: { id: session.user.id }, data: { trialEndsAt } });
  return NextResponse.json({ ok: true, trialEndsAt });
}
