import { redirect } from "next/navigation";

export default function TasksPage() {
  // Redirect to the new dashboard tasks page
  redirect("/dashboard/tasks");
}
