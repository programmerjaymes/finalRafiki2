"use client";
import React from "react";
import type { ProfileUser } from "@/components/user-profile/ProfileClient";

export default function UserAddressCard({ user }: { user: ProfileUser }) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-2">
            Address
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Address fields are not yet configured for your account.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">User ID</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.id}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Phone (for contact)</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.phone || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
