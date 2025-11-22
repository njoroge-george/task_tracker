"use client";

import { useState } from "react";

type User = {
  timezone: string;
  dateFormat: string;
  weekStart: number;
  theme: string;
};

type Props = {
  user: User;
};

export default function PreferencesTab({ user }: Props) {
  const [formData, setFormData] = useState({
    timezone: user.timezone,
    dateFormat: user.dateFormat,
    weekStart: user.weekStart,
    theme: user.theme,
    notifications: {
      email: true,
      push: true,
      taskAssigned: true,
      taskCompleted: false,
      taskDueSoon: true,
      comments: true,
    },
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
      setMessage("Preferences updated successfully!");
    } catch (error) {
      setMessage("Failed to update preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Preferences */}
      <div>
        <h3 className="text-lg font-medium text-primary mb-4">
          General
        </h3>
        <div className="space-y-4">
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
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEDT)</option>
            </select>
          </div>

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
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
            </select>
          </div>

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
              onChange={(e) =>
                setFormData({ ...formData, theme: e.target.value })
              }
              className="w-full px-4 py-2 border border-default rounded-lg bg-white bg-card text-primary focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="SYSTEM">System (Auto)</option>
              <option value="LIGHT">Light</option>
              <option value="DARK">Dark</option>
            </select>
            <p className="text-xs text-secondary mt-1">
              Choose how the app looks to you
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="pt-6 border-t border-default">
        <h3 className="text-lg font-medium text-primary mb-4">
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Email Notifications
              </p>
              <p className="text-xs text-secondary">
                Receive notifications via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      email: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer bg-card peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Push Notifications
              </p>
              <p className="text-xs text-secondary">
                Receive push notifications in browser
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.push}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      push: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer bg-card peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Task Assigned
              </p>
              <p className="text-xs text-secondary">
                When a task is assigned to you
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.taskAssigned}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      taskAssigned: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer bg-card peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Task Completed
              </p>
              <p className="text-xs text-secondary">
                When your task is marked as complete
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.taskCompleted}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      taskCompleted: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer bg-card peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Task Due Soon
              </p>
              <p className="text-xs text-secondary">
                Reminders for upcoming deadlines
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.taskDueSoon}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      taskDueSoon: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer bg-card peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Comments
              </p>
              <p className="text-xs text-secondary">
                When someone comments on your tasks
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.comments}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      comments: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer bg-card peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
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

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </form>
  );
}
