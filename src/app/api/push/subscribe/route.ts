import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await req.json();
    
    // TODO: Add notificationPreferences field to User model in Prisma schema
    // For now, we'll skip storing the push subscription
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: {
    //     notificationPreferences: {
    //       pushSubscription: subscription,
    //     },
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications' },
      { status: 500 }
    );
  }
}
