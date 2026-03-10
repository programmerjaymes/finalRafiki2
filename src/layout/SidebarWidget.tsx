import React from "react";

interface SidebarWidgetProps {
  expanded?: boolean;
}

export default function SidebarWidget({ expanded = true }: SidebarWidgetProps) {
  if (!expanded) return null;

  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-brand-50 px-4 py-5 text-center dark:bg-brand-900/30`}
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Rafiki Business Directory
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Connect with businesses across Tanzania and grow your network.
      </p>
      <a
        href="/dashboard/businesses"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        Explore Businesses
      </a>
    </div>
  );
}
