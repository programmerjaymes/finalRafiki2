"use client";

import React, { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface AgentAuthWrapperProps {
  children: React.ReactNode;
}

export const AgentAuthWrapper: React.FC<AgentAuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const wasAuthorizedRef = useRef(false);

  const isAgent = status === "authenticated" && session?.user?.role === "AGENT";

  if (isAgent) {
    wasAuthorizedRef.current = true;
  }

  useEffect(() => {
    if (status === "loading") return;

    const callbackUrl = encodeURIComponent(pathname || "/agent-dashboard");

    if (status === "unauthenticated") {
      router.push(`/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "AGENT") {
      router.push("/");
    }
  }, [session, status, router, pathname]);

  if (status === "loading" && !wasAuthorizedRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <span className="ml-3 text-lg font-medium">Checking authentication...</span>
      </div>
    );
  }

  if (wasAuthorizedRef.current && status === "loading") {
    return <>{children}</>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg font-medium">Redirecting to login page...</span>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "AGENT") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg font-medium">You must be an agent to access this page</span>
      </div>
    );
  }

  return <>{children}</>;
};
