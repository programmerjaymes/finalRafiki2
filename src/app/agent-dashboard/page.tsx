import type { Metadata } from "next";
import AgentDashboardClient from "@/components/agent/AgentDashboardClient";

export const metadata: Metadata = {
  title: "Agent Dashboard | Rafiki",
  description: "Track referrals, earnings, and commission payments on Rafiki.",
};

export default function AgentDashboardPage() {
  return <AgentDashboardClient />;
}
