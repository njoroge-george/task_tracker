import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Tasks",
  description: "View and manage all your tasks. Mark tasks as complete, edit, or delete them.",
  openGraph: {
    title: "All Tasks | Task Tracker",
    description: "View and manage all your tasks",
  },
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
