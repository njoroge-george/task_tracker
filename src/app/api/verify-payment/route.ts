import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPaymentSession } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

// GET /api/verify-payment - Verify a payment and update user plan
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get payment session from Stripe
    const paymentSession = await getPaymentSession(sessionId);

    if (!paymentSession) {
      return NextResponse.json({ error: 'Payment session not found' }, { status: 404 });
    }

    // Check if payment was successful
    if (paymentSession.payment_status !== 'paid') {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not completed' 
      }, { status: 400 });
    }

    // Update user's plan in database
    const planName = paymentSession.metadata?.planName || 'Pro';
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // You can add a plan field to your User model
        // plan: planName,
        // paidAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      planName,
      amount: paymentSession.amount_total,
      paymentIntent: paymentSession.payment_intent,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment', details: error.message },
      { status: 500 }
    );
  }
}
