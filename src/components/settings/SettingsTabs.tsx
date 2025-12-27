"use client";

import { useState } from "react";
import ProfileTab from "./ProfileTab";
import PreferencesTab from "./PreferencesTab";
import WorkspacesTab from "./WorkspacesTab";
import BillingTab from "./BillingTab";

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  timezone: string;
  dateFormat: string;
  weekStart: number;
  theme: string;
  plan: string;
  planExpiresAt: Date | null;
};

type Workspace = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  ownerId: string;
  role: string;
};

type Props = {
  user: User;
  workspaces: Workspace[];
  userId: string;
};

const tabs = [
  { id: "profile", name: "Profile" },
  { id: "preferences", name: "Preferences" },
  { id: "workspaces", name: "Workspaces" },
  { id: "billing", name: "Billing" },
];

export default function SettingsTabs({ user, workspaces, userId }: Props) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="bg-primary rounded-2xl border border-soft shadow-sm">
      {/* Tabs */}
      <div className="border-b border-soft">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 text-secondary dark:hover:text-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "profile" && <ProfileTab user={user} />}
        {activeTab === "preferences" && <PreferencesTab user={user} />}
        {activeTab === "workspaces" && (
          <WorkspacesTab workspaces={workspaces} userId={userId} />
        )}
        {activeTab === "billing" && <BillingTab user={user} />}
      </div>
    </div>
  );
}
