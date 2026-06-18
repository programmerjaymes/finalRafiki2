"use client";
import BusinessOwnerSidebar from "@/layout/BusinessOwnerSidebar";
import AppHeader from "@/layout/AppHeader";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import { BusinessOwnerAuthWrapper } from '@/components/auth/BusinessOwnerAuthWrapper';

function MainContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();
  
  return (
    <div className={`flex flex-col flex-1 min-h-0 overflow-hidden bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out ${
      isExpanded ? "lg:ml-[290px]" : isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
    }`}>
      <AppHeader />
      <main className="flex flex-col flex-1 min-h-0 overflow-hidden px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-7 pb-0">
        {children}
      </main>
    </div>
  );
}

export default function BusinessOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BusinessOwnerAuthWrapper>
      <SidebarProvider>
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            <BusinessOwnerSidebar />
            <MainContent>{children}</MainContent>
          </div>
        </ThemeProvider>
      </SidebarProvider>
    </BusinessOwnerAuthWrapper>
  );
} 