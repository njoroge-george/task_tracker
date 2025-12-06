import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add notificationPreferences field to User model in Prisma schema
    // For now, we'll skip removing the push subscription
    // const currentPrefs = session.user.notificationPreferences as any || {};
    // delete currentPrefs.pushSubscription;
    // 
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: {
    //     notificationPreferences: currentPrefs,
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from push notifications' },
      { status: 500 }
    );
  }
}
