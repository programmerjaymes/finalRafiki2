import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password | Rafiki - Business Directory Platform",
  description: "Reset your Rafiki account password",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Reset Password
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Password reset is not available yet. Please contact support if you
          need help accessing your account.
        </p>
        <Link
          href="/signin"
          className="mt-6 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
