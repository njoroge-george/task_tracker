import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// Simple pricing plans (one-time payments)
export const PLANS = {
  BASIC: {
    name: 'Basic',
    price: 0,
    features: ['5 Projects', '50 Tasks', 'Basic Support'],
  },
  PRO: {
    name: 'Pro',
    price: 2900, // $29.00 in cents
    features: ['Unlimited Projects', 'Unlimited Tasks', 'Priority Support', 'AI Features', 'Analytics'],
  },
  TEAM: {
    name: 'Team',
    price: 9900, // $99.00 in cents
    features: ['Everything in Pro', 'Team Collaboration', 'Advanced Analytics', 'Custom Integrations', 'Dedicated Support'],
  },
};

/**
 * Create a simple one-time payment checkout session
 */
export async function createCheckoutSession({
  userId,
  email,
  amount,
  planName,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  amount: number; // Amount in cents (e.g., 2900 = $29.00)
  planName: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment instead of subscription
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planName} Plan`,
              description: `One-time payment for ${planName} plan access`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        userId,
        planName,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a subscription-based checkout (if you want recurring payments)
 */
export async function createSubscriptionCheckout({
  userId,
  email,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
}

/**
 * Get payment details by session ID
 */
export async function getPaymentSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving payment session:', error);
    throw error;
  }
}

/**
 * Get customer's payment history
 */
export async function getCustomerPayments(email: string) {
  try {
    const charges = await stripe.charges.list({
      limit: 10,
    });
    
    // Filter by customer email
    const customerCharges = charges.data.filter(
      charge => charge.billing_details.email === email
    );
    
    return customerCharges;
  } catch (error) {
    console.error('Error retrieving payments:', error);
    throw error;
  }
}

/**
 * Issue a refund for a payment
 */
export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // Optional - leave empty for full refund
    });
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}
