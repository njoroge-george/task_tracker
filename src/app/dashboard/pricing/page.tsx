'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'BASIC',
    name: 'Basic',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '5 Projects',
      '50 Tasks per project',
      'Basic task management',
      'Email support',
      'Mobile app access',
    ],
    buttonText: 'Current Plan',
    popular: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 29,
    description: 'Best for individuals and small teams',
    features: [
      'Unlimited Projects',
      'Unlimited Tasks',
      'AI-powered suggestions',
      'Priority support',
      'Advanced analytics',
      'Custom workflows',
      'Export & integrations',
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'TEAM',
    name: 'Team',
    price: 99,
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Team collaboration tools',
      'Real-time collaboration',
      'Advanced permissions',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Custom training',
    ],
    buttonText: 'Upgrade to Team',
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === 'BASIC') return;

    setLoading(planId);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
        setLoading(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for you. One-time payment, no subscriptions.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Pay once, use forever. Upgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground ml-2">one-time</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading !== null || plan.id === 'BASIC'}
                className="w-full mt-6"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {plan.buttonText}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4 text-left">
          <div>
            <h3 className="font-semibold mb-2">Is this a subscription?</h3>
            <p className="text-sm text-muted-foreground">
              No! All plans are one-time payments. Pay once and use the features forever.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I upgrade later?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade to a higher plan anytime and only pay the difference.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit and debit cards (Visa, Mastercard, American Express, etc.) through Stripe's secure payment processing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is my payment information secure?</h3>
            <p className="text-sm text-muted-foreground">
              Absolutely! We use Stripe for payment processing. Your card details never touch our servers and are encrypted end-to-end.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! We offer a 30-day money-back guarantee. Contact support if you're not satisfied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
