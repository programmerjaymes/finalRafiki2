"use client";

import PageBreadcrumb from "@/components/PageBreadcrumb";
import BusinessList from "@/components/admin/businessess/BusinessList";
import { useLocale } from "@/lib/useLocale";

export default function MyBusinessesPage() {
  const sw = useLocale() === "sw";
  return (
    <div className="w-full flex flex-col min-h-0">
      <PageBreadcrumb
        items={[
          { label: sw ? "Dashibodi" : "Dashboard", path: "/business-dashboard" },
          { label: sw ? "Biashara Zangu" : "My Businesses" },
        ]}
        className="mb-4"
      />
      <BusinessList variant="owner" />
    </div>
  );
}
