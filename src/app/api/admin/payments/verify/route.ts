import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { paymentId, action, notes } = await req.json();

    if (!paymentId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['VERIFY', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get payment
    const payment = await prisma.manualPayment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Payment has already been processed' },
        { status: 400 }
      );
    }

    const newStatus = action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';

    // Update payment
    await prisma.manualPayment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        verifiedAt: new Date(),
        verifiedBy: session.user.email,
        notes: notes || payment.notes,
      },
    });

    // If verified, upgrade user's plan
    if (action === 'VERIFY') {
      // Calculate plan expiration (30 days from now)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      // IMMEDIATELY upgrade user's plan (no delay)
      const updatedUser = await prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: payment.plan as any,
          planExpiresAt: expirationDate, // Plan expires in 30 days
        },
      });

      console.log(`✅ IMMEDIATE UPGRADE: User ${payment.user.email} upgraded to ${payment.plan} plan (expires: ${expirationDate.toISOString()})`);
      
      // TODO: Send email notification to user about successful payment verification
    } else {
      console.log(`❌ Payment rejected for user ${payment.user.email}`);
      // TODO: Send email notification to user about payment rejection
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${action === 'VERIFY' ? 'verified' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
