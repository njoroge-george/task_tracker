import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Determine plan based on price ID
        let plan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE';
        const priceId = subscription.items.data[0].price.id;
        
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          plan = 'PRO';
        } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
          plan = 'ENTERPRISE';
        }

        // Update user with subscription info
        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
          },
        });

        // Send confirmation email
        await sendSubscriptionConfirmationEmail(
          user.email,
          user.name || 'User',
          plan,
          subscription.items.data[0].price.unit_amount! / 100
        );

        console.log(`✅ Subscription created for user ${userId}, plan: ${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Determine new plan
        let plan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE';
        const priceId = subscription.items.data[0].price.id;
        
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          plan = 'PRO';
        } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
          plan = 'ENTERPRISE';
        }

        // Update user plan
        await prisma.user.update({
          where: { id: userId },
          data: { plan },
        });

        console.log(`✅ Subscription updated for user ${userId}, new plan: ${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Downgrade to free plan
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'FREE',
            stripeSubscriptionId: null,
          },
        });

        console.log(`✅ Subscription canceled for user ${userId}, downgraded to FREE`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`✅ Payment succeeded for invoice ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error(`❌ Payment failed for invoice ${invoice.id}`);
        // TODO: Send payment failed email to user
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
