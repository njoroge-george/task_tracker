import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/subscription - basic subscription & trial status
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const now = new Date();
  const trialEndsAt = (user as any)?.trialEndsAt as Date | undefined;
  const trialActive = !!trialEndsAt && trialEndsAt > now;
  const trialRemainingDays = trialActive ? Math.ceil((trialEndsAt!.getTime() - now.getTime()) / (24*60*60*1000)) : 0;
  return NextResponse.json({ 
    plan: user.plan, 
    trialEndsAt, 
    trialActive, 
    trialRemainingDays, 
    hasSubscription: user.plan !== 'FREE'
  });
}
