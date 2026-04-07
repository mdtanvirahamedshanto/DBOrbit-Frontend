import { AppShell } from "@/components/shell/app-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your databases with DBOrbit — the powerful multi-database admin panel for MongoDB, PostgreSQL, and MySQL.",
};

export default function DashboardPage() {
  return <AppShell />;
}
