"use client";
import BusinessOwnerSidebar from "@/layout/BusinessOwnerSidebar";
import AppHeader from "@/layout/AppHeader";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";

function MainContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();
  
  return (
    <div className={`flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out ${
      isExpanded ? "lg:ml-[290px]" : isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
    }`}>
      <AppHeader />
      <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-7">
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
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
          <BusinessOwnerSidebar />
          <MainContent>{children}</MainContent>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
} 