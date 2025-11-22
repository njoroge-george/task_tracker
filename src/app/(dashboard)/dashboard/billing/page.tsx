'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, CreditCard, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      'Up to 3 projects',
      'Basic task management',
      'Mobile app access',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: 19,
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'Team collaboration',
      'Kanban boards',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
  {
    name: 'Enterprise',
    price: 49,
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom workflows',
      'Advanced security',
      'SSO integration',
      'SLA guarantee',
      'Unlimited team members',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentPlan = session?.user?.plan || 'FREE';

  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success('Subscription successful! Welcome to your new plan.');
      router.replace('/dashboard/billing');
    }
    if (searchParams.get('canceled')) {
      toast.error('Subscription canceled. You can try again anytime.');
      router.replace('/dashboard/billing');
    }
  }, [searchParams, router]);

  const handleUpgrade = async (planName: string) => {
    if (planName === 'Free') return;

    setLoading(planName);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName.toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.message || 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="text-base px-3 py-1">
                {currentPlan}
              </Badge>
              {currentPlan !== 'FREE' && (
                <span className="text-sm text-muted-foreground">
                  Billed monthly
                </span>
              )}
            </div>
          </div>
          {currentPlan !== 'FREE' && (
            <Button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              variant="outline"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name.toUpperCase();
            const isDowngrade =
              (currentPlan === 'ENTERPRISE' && plan.name !== 'Enterprise') ||
              (currentPlan === 'PRO' && plan.name === 'Free');

            return (
              <Card
                key={plan.name}
                className={`p-6 relative ${
                  isCurrentPlan ? 'border-primary border-2' : ''
                }`}
              >
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 left-6">
                    Current Plan
                  </Badge>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground ml-2">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={
                      isCurrentPlan ||
                      isDowngrade ||
                      loading === plan.name
                    }
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                  >
                    {loading === plan.name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : isDowngrade ? (
                      'Manage Subscription'
                    ) : plan.name === 'Free' ? (
                      'Current Plan'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing Information */}
      {currentPlan !== 'FREE' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your payment method is managed securely through Stripe.
          </p>
          <Button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            variant="outline"
          >
            {portalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                View Invoices
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
}
