"use client";

import { useState } from "react";

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
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
