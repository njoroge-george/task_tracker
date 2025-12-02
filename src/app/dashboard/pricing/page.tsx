'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Phone, Copy, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '5 Projects',
      '50 Tasks per project',
      'Basic task management',
      'Email support',
      'Mobile app access',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 2999,
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
    period: 'month',
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 9999,
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
    period: 'month',
  },
];

const PAYMENT_INFO = {
  paybill: '600100',
  accountNumber: '0100007828831',
};

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedPaybill, setCopiedPaybill] = useState(false);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === 'FREE') return;
    setSelectedPlan(planId);
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan || !phoneNumber || !transactionCode) {
      alert('Please fill in all payment details');
      return;
    }

    setLoading(true);

    try {
      const plan = plans.find(p => p.id === selectedPlan);
      
      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: plan?.price,
          phoneNumber,
          transactionCode,
          paymentMethod: 'PAYBILL',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payment submitted successfully! Your payment will be verified within 24 hours.');
        router.push('/dashboard/payment-success');
      } else {
        alert(data.error || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that's right for you
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Pay via M-Pesa Paybill • Instant activation after verification
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.name === 'Pro' ? 'border-primary border-2' : ''}
            >
              {plan.name === 'Pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    KES {plan.price.toLocaleString()}
                  </span>
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
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={plan.id === 'FREE'}
                  className="w-full mt-6"
                  variant={plan.name === 'Pro' ? 'default' : 'outline'}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {plan.id === 'FREE' ? 'Current Plan' : `Get ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 text-left">
            <div>
              <h3 className="font-semibold mb-2">How do I pay?</h3>
              <p className="text-sm text-muted-foreground">
                We accept payments via M-Pesa Paybill. Simply select a plan, make the payment, and submit your transaction code for verification.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How long does verification take?</h3>
              <p className="text-sm text-muted-foreground">
                Payment verification typically takes up to 24 hours. You'll receive an email once your payment is confirmed and your account is upgraded.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is this a subscription?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! All paid plans are monthly subscriptions. You'll need to renew your payment every 30 days to maintain access to premium features.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens when my plan expires?</h3>
              <p className="text-sm text-muted-foreground">
                After 30 days, your plan will automatically downgrade to the Free plan. You can renew anytime by making another payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
            <CardDescription>
              {selectedPlanData?.name} Plan - KES {selectedPlanData?.price.toLocaleString()}/month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5" />
                M-Pesa Payment Instructions
              </h3>
              
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Go to M-Pesa on your phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Select Lipa na M-Pesa → Pay Bill</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">3.</span>
                  <div className="flex-1">
                    <span>Enter Business Number: </span>
                    <span className="font-mono font-semibold">
                      {PAYMENT_INFO.paybill}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 px-2"
                      onClick={() => copyToClipboard(PAYMENT_INFO.paybill, setCopiedPaybill)}
                    >
                      {copiedPaybill ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Account Number: <strong>{PAYMENT_INFO.accountNumber}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">5.</span>
                  <span>Amount: <strong>KES {selectedPlanData?.price.toLocaleString()}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">6.</span>
                  <span>Enter your M-Pesa PIN and confirm</span>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The phone number you used for the payment
                </p>
              </div>

              <div>
                <Label htmlFor="transaction">M-Pesa Transaction Code</Label>
                <Input
                  id="transaction"
                  type="text"
                  placeholder="ABC1234567"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Found in your M-Pesa confirmation SMS
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedPlan(null)}
                disabled={loading}
                className="flex-1"
              >
                Back to Plans
              </Button>
              <Button
                onClick={handleSubmitPayment}
                disabled={loading || !phoneNumber || !transactionCode}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Your payment will be verified within 24 hours. You'll receive an email once confirmed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
