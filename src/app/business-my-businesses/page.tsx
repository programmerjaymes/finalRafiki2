"use client";

import PageBreadcrumb from "@/components/PageBreadcrumb";
import BusinessList from "@/components/admin/businessess/BusinessList";

export default function MyBusinessesPage() {
  return (
    <div className="w-full flex flex-col min-h-0">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", path: "/business-dashboard" },
          { label: "My Businesses" },
        ]}
        className="mb-4"
      />
      <BusinessList variant="owner" />
    </div>
  );
}
