"use client";

import { useState } from "react";

type User = {
  id: string;
  name: string | null;
  email: string;
  timezone: string;
  dateFormat: string;
  weekStart: number;
  theme: string;
};

type Props = {
  user: User;
};

export default function SettingsForm({ user }: Props) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    timezone: user.timezone,
    dateFormat: user.dateFormat,
    weekStart: user.weekStart,
    theme: user.theme,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      // TODO: Implement API call to update settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setMessage("Settings saved successfully!");
    } catch (error) {
      setMessage("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
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

      {/* Email */}
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
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-default rounded-lg bg-white bg-card text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
          placeholder="john@example.com"
        />
      </div>

      {/* Timezone */}
      <div>
        <label
          htmlFor="timezone"
          className="block text-sm font-medium text-primary mb-2"
        >
          Timezone
        </label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) =>
            setFormData({ ...formData, timezone: e.target.value })
          }
          className="w-full px-4 py-2 border border-default rounded-lg bg-white bg-card text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Asia/Shanghai">Shanghai</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
      </div>

      {/* Date Format */}
      <div>
        <label
          htmlFor="dateFormat"
          className="block text-sm font-medium text-primary mb-2"
        >
          Date Format
        </label>
        <select
          id="dateFormat"
          value={formData.dateFormat}
          onChange={(e) =>
            setFormData({ ...formData, dateFormat: e.target.value })
          }
          className="w-full px-4 py-2 border border-default rounded-lg bg-white bg-card text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      {/* Week Start */}
      <div>
        <label
          htmlFor="weekStart"
          className="block text-sm font-medium text-primary mb-2"
        >
          Week Starts On
        </label>
        <select
          id="weekStart"
          value={formData.weekStart}
          onChange={(e) =>
            setFormData({ ...formData, weekStart: parseInt(e.target.value) })
          }
          className="w-full px-4 py-2 border border-default rounded-lg bg-white bg-card text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
        </select>
      </div>

      {/* Theme */}
      <div>
        <label
          htmlFor="theme"
          className="block text-sm font-medium text-primary mb-2"
        >
          Theme
        </label>
        <select
          id="theme"
          value={formData.theme}
          onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
          className="w-full px-4 py-2 border border-default rounded-lg bg-white bg-card text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          <option value="SYSTEM">System</option>
          <option value="LIGHT">Light</option>
          <option value="DARK">Dark</option>
        </select>
      </div>

      {/* Message */}
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

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          className="px-6 py-2 border border-default text-primary rounded-lg hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
