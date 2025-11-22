"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";

interface SubscriptionData {
  plan: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: "PRO" | "ENTERPRISE") => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url; // Redirect to Stripe Checkout
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageBilling = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url; // Redirect to Stripe Customer Portal
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-secondary">
            Current Plan: <span className="font-semibold text-accent">{subscription?.plan || "FREE"}</span>
          </p>
          {subscription?.status && (
            <p className="text-sm text-secondary mt-2">
              Status: {subscription.status}
              {subscription.currentPeriodEnd && (
                <> • Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
              )}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className={`border-2 bg-card ${subscription?.plan === "FREE" ? "border-accent ring-2 ring-accent" : "border-default"}`}>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2 text-primary">Free</h3>
              <p className="text-secondary mb-6">Perfect for individuals</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">$0</span>
                <span className="text-secondary">/month</span>
              </div>
              <Button
                variant="outline"
                className="w-full mb-6"
                disabled={subscription?.plan === "FREE"}
              >
                {subscription?.plan === "FREE" ? "Current Plan" : "Downgrade"}
              </Button>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Up to 3 projects</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Unlimited tasks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Basic analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">1 workspace</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`border-4 shadow-xl scale-105 bg-card relative ${subscription?.plan === "PRO" ? "border-accent ring-2 ring-accent" : "border-blue-600"}`}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2 text-primary">Pro</h3>
              <p className="text-secondary mb-6">For growing teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">$12</span>
                <span className="text-secondary">/month</span>
              </div>
              <Button
                className="w-full mb-6 bg-accent hover:bg-accent-hover"
                onClick={() => handleUpgrade("PRO")}
                disabled={subscription?.plan === "PRO" || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : subscription?.plan === "PRO" ? (
                  "Current Plan"
                ) : (
                  "Upgrade to Pro"
                )}
              </Button>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Unlimited projects</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">5 workspaces</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Priority support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Custom integrations</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className={`border-2 bg-card ${subscription?.plan === "ENTERPRISE" ? "border-accent ring-2 ring-accent" : "border-default"}`}>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2 text-primary">
                Enterprise
              </h3>
              <p className="text-secondary mb-6">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">Custom</span>
              </div>
              <Button
                variant="outline"
                className="w-full mb-6"
                onClick={() => handleUpgrade("ENTERPRISE")}
                disabled={subscription?.plan === "ENTERPRISE" || isProcessing}
              >
                {subscription?.plan === "ENTERPRISE" ? "Current Plan" : "Contact Sales"}
              </Button>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Unlimited workspaces</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Advanced security (SSO)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">Dedicated support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary">SLA guarantee</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Manage Billing Button */}
        {subscription?.plan !== "FREE" && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={isProcessing}
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Manage Billing & Invoices
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
