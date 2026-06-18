import React from "react";
import PendingBusinessApprovals from "@/components/admin/businessess/PendingBusinessApprovals";

export default function PendingBusinessApprovalsPage() {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Pending business approvals
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review full business details and photos of each applicant before approving.
        </p>
      </div>

      <PendingBusinessApprovals />
    </div>
  );
}
