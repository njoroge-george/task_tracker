import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCheckoutSession, PLANS } from '@/lib/stripe';

// POST /api/checkout - Create a simple one-time payment checkout
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    // Validate plan
    if (!plan || !['PRO', 'TEAM'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose PRO or TEAM.' },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS];
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email,
      amount: selectedPlan.price,
      planName: selectedPlan.name,
      successUrl: `${baseUrl}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard/pricing`,
    });

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
