'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, CreditCard } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      'Up to 5 projects',
      '50 Tasks per project',
      'Basic task management',
      'Email support',
      'Mobile app access',
    ],
  },
  {
    name: 'Pro',
    price: 2999,
    features: [
      'Unlimited projects',
      'Unlimited tasks',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'Team collaboration',
      'Kanban boards',
    ],
  },
  {
    name: 'Enterprise',
    price: 9999,
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom workflows',
      'Advanced security',
      'SSO integration',
      'SLA guarantee',
      'Unlimited team members',
    ],
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const currentPlan = session?.user?.plan || 'FREE';
  const currentPlanData = plans.find(p => p.name.toUpperCase() === currentPlan) || plans[0];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">{currentPlanData.name}</h3>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-3xl font-bold">
                KES {currentPlanData.price.toLocaleString()}
                {currentPlanData.price > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">one-time</span>
                )}
              </p>
            </div>
            {currentPlan === 'FREE' && (
              <Button onClick={() => router.push('/dashboard/pricing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name.toUpperCase();

            return (
              <Card
                key={plan.name}
                className={`relative ${
                  isCurrentPlan ? 'border-primary border-2' : ''
                }`}
              >
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 left-6">
                    Current Plan
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-bold">KES {plan.price.toLocaleString()}</span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground ml-2">one-time</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => router.push('/dashboard/pricing')}
                    disabled={isCurrentPlan}
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                  >
                    {isCurrentPlan ? (
                      'Current Plan'
                    ) : plan.name === 'Free' ? (
                      'Current Plan'
                    ) : (
                      <>
                        Get {plan.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>How to upgrade your plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We accept payments via M-Pesa Paybill. To upgrade your plan:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Visit the pricing page to select a plan</li>
            <li>Make payment via M-Pesa Paybill</li>
            <li>Submit your transaction code for verification</li>
            <li>Receive confirmation within 24 hours</li>
          </ol>
          <Button onClick={() => router.push('/dashboard/pricing')} className="w-full sm:w-auto">
            View Pricing & Payment Options
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
