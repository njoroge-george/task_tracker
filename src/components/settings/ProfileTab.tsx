"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CheckCircle2 } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  plan?: string;
  planExpiresAt?: Date | string | null;
};

type Props = {
  user: User;
};

export default function ProfileTab({ user }: Props) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const userPlan = user.plan || 'FREE';
  const isPaid = userPlan !== 'FREE';
  const expiresAt = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const isExpired = expiresAt && expiresAt < new Date();
  const daysUntilExpiry = expiresAt 
    ? Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getPlanColor = () => {
    if (userPlan === 'ENTERPRISE') return 'bg-purple-500';
    if (userPlan === 'PRO') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getPlanBadgeVariant = () => {
    if (userPlan === 'ENTERPRISE') return 'default';
    if (userPlan === 'PRO') return 'default';
    return 'secondary';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Crown className={`h-6 w-6 ${isPaid ? 'text-yellow-500' : 'text-gray-400'}`} />
              <h3 className="text-lg font-semibold text-primary">Subscription Status</h3>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant={getPlanBadgeVariant()} 
                className={`${getPlanColor()} text-white font-semibold px-3 py-1`}
              >
                {userPlan} PLAN
              </Badge>
              
              {isPaid && !isExpired && (
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              
              {isExpired && (
                <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700">
                  Expired
                </Badge>
              )}
            </div>

            {isPaid && expiresAt && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {isExpired ? (
                      <>Expired on {expiresAt.toLocaleDateString()}</>
                    ) : (
                      <>
                        Expires on {expiresAt.toLocaleDateString()}
                        {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                          <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                            ({daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'} left)
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </div>
                
                {!isExpired && daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                  <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-md p-3 text-sm">
                    <p className="text-orange-800 dark:text-orange-400">
                      ⚠️ Your subscription will expire soon. Renew to continue enjoying premium features.
                    </p>
                  </div>
                )}

                {isExpired && (
                  <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md p-3 text-sm">
                    <p className="text-red-800 dark:text-red-400">
                      ⚠️ Your subscription has expired. You've been downgraded to the FREE plan.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isPaid && (
              <p className="text-sm text-secondary">
                You're currently on the free plan. Upgrade to unlock premium features!
              </p>
            )}
          </div>

          <div>
            {!isPaid || isExpired ? (
              <a
                href="/dashboard/pricing"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              >
                Upgrade Now
              </a>
            ) : (
              <a
                href="/dashboard/pricing"
                className="px-4 py-2 bg-card border-2 border-default text-primary rounded-lg hover:bg-accent transition-colors text-sm font-medium"
              >
                Manage Plan
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Profile Picture */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : user.email[0].toUpperCase()}
          </div>
          <div>
            <button className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
              Change Picture
            </button>
            <p className="text-xs text-secondary mt-1">
              JPG, PNG or GIF. Max 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-primary mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-default rounded-lg bg-white bg-card text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-primary mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 border border-default rounded-lg bg-white bg-card text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.includes("success")
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-default">
        <h3 className="text-sm font-medium text-status-error mb-4">
          Danger Zone
        </h3>
        <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-status-error rounded-lg hover:bg-status-error-light transition-colors text-sm">
          Delete Account
        </button>
        <p className="text-xs text-secondary mt-2">
          Once you delete your account, there is no going back. Please be certain.
        </p>
      </div>
    </div>
  );
}
