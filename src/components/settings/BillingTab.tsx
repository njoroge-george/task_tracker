"use client";

import { useState, useEffect } from "react";

type User = {
  plan: string;
  planExpiresAt: Date | null;
  phoneNumber?: string | null;
};

type Props = {
  user: User;
};

type Payment = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  createdAt: string;
  completedAt?: string;
};

const plans = [
  {
    name: "FREE",
    price: "KES 0",
    period: "forever",
    features: [
      "Up to 3 workspaces",
      "Up to 10 projects",
      "Unlimited tasks",
      "Basic analytics",
      "7-day activity log",
      "Community support",
    ],
    color: "gray",
  },
  {
    name: "PRO",
    price: "KES 3,000",
    period: "per month",
    features: [
      "Unlimited workspaces",
      "Unlimited projects",
      "Unlimited tasks",
      "Advanced analytics",
      "90-day activity log",
      "Priority support",
      "Custom fields",
      "Time tracking",
      "File attachments (100GB)",
    ],
    color: "blue",
    popular: true,
  },
  {
    name: "ENTERPRISE",
    price: "KES 10,000",
    period: "per month",
    features: [
      "Everything in Pro",
      "Unlimited activity log",
      "SSO authentication",
      "Advanced security",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "File attachments (1TB)",
      "Audit logs",
    ],
    color: "purple",
  },
];

export default function BillingTab({ user }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch("/api/payments/history");
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const currentPlan = plans.find((p) => p.name === user.plan) || plans[0];

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.PENDING}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">
              Current Plan
            </h3>
            <p className="text-sm text-secondary mt-1">
              Manage your subscription via M-Pesa
            </p>
          </div>
          <span className="px-4 py-2 bg-accent text-white rounded-lg font-semibold">
            {user.plan}
          </span>
        </div>
        {user.planExpiresAt && (
          <p className="text-sm text-secondary" suppressHydrationWarning>
            Expires on {new Date(user.planExpiresAt).toLocaleDateString()}
          </p>
        )}
        {user.phoneNumber && (
          <p className="text-sm text-secondary mt-1">
            Payment number: {user.phoneNumber}
          </p>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.name === user.plan;

          return (
            <div
              key={plan.name}
              className={`relative rounded-lg border-2 p-6 ${
                plan.popular
                  ? "border-accent shadow-lg"
                  : "border-default"
              } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                    Current
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-primary mb-2">
                  {plan.name}
                </h4>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary">
                    {plan.price}
                  </span>
                </div>
                <span className="text-sm text-secondary">
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-status-success dark:text-green-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrentPlan}
                onClick={() => window.location.href = "/dashboard/subscription"}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  isCurrentPlan
                    ? "bg-secondary text-secondary cursor-not-allowed"
                    : plan.popular
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "bg-secondary text-primary hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {isCurrentPlan ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Billing History */}
      <div className="pt-6 border-t border-default">
        <h3 className="text-lg font-medium text-primary mb-4">
          Payment History
        </h3>
        <div className="bg-primary border border-default rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 bg-card">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loadingPayments ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-secondary">
                    Loading payment history...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-secondary">
                    No payment history available
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary" suppressHydrationWarning>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      {payment.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary" suppressHydrationWarning>
                      {payment.currency} {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-secondary font-mono">
                      {payment.reference.slice(0, 12)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Method */}
      <div className="pt-6 border-t border-default">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-primary">
            Payment Method
          </h3>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 bg-card/50 rounded-lg">
          <div className="w-12 h-8 bg-gradient-to-r from-green-600 to-green-800 rounded flex items-center justify-center text-white text-xs font-bold">
            M-PESA
          </div>
          <div>
            <p className="text-sm font-medium text-primary">
              M-Pesa Mobile Money
            </p>
            <p className="text-xs text-secondary">
              {user.phoneNumber || "No phone number registered"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
