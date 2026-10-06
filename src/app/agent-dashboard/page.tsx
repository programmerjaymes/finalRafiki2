import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Card from "@/components/ui/card/Card";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Agent Dashboard | Rafiki",
  description: "Agent dashboard for Rafiki",
};

export default async function AgentDashboardPage() {
  const sw = (await cookies()).get("rafiki_locale")?.value === "sw";
  const text = (en: string, swText: string) => (sw ? swText : en);
  const breadcrumbItems = [
    {
      label: text("Agent Dashboard", "Dashibodi ya Agenzi"),
      path: "/agent-dashboard",
    },
  ];

  return (
    <div>
      <PageBreadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">{text("Welcome Agent", "Karibu Agenzi")}</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {text(
              "Manage your agent activities and view assignments",
              "Simamia shughuli zako za agencia na tazama kazi zilizokabidhiwa"
            )}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">{text("Assignments", "Kazi")}</h3>
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-gray-400">{text("Active", "Zinazofanya kazi")}</p>
            <span className="text-2xl font-bold text-brand-500">0</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">{text("Help", "Msaada")}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {text("Contact support or check instructions", "Wasiliana na msaada au angalia maelekezo")}
          </p>
        </Card>
      </div>
    </div>
  );
}