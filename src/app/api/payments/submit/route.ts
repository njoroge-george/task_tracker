import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, amount, phoneNumber, transactionCode, paymentMethod } = await req.json();

    if (!plan || !amount || !phoneNumber || !transactionCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate plan
    if (!['PRO', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Check if transaction code already exists
    const existingPayment = await prisma.manualPayment.findUnique({
      where: { reference: transactionCode },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'This transaction code has already been used' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create payment record
    const payment = await prisma.manualPayment.create({
      data: {
        reference: transactionCode,
        amount,
        plan,
        phoneNumber,
        transactionCode,
        paymentMethod: paymentMethod || 'PAYBILL',
        status: 'PENDING',
        userId: user.id,
      },
    });

    // Update user's phone number if not already set
    if (!user.phoneNumber) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneNumber },
      });
    }

    // TODO: Send email notification to admin about new payment submission
    // TODO: Send confirmation email to user

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully. You will be notified once verified.',
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit payment' },
      { status: 500 }
    );
  }
}
