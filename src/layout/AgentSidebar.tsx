"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "../context/SidebarContext";
import { GridIcon } from "../icons/index";
import { FaBuilding, FaChartLine, FaClipboardList, FaInfoCircle, FaPlus, FaShieldAlt } from "react-icons/fa";
import SidebarWidget from "./SidebarWidget";
import { useLocale } from "@/lib/useLocale";

type NavItem = { icon: React.ReactNode; name: string; path: string };

export default function AgentSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();
  const sw = useLocale() === "sw";
  const visible = isExpanded || isHovered || isMobileOpen;
  const roles = session?.user?.roles || (session?.user?.role ? [session.user.role] : []);
  const isBusinessOwner = roles.includes("BUSINESS_OWNER");

  const agentItems: NavItem[] = [
    { icon: <GridIcon />, name: sw ? "Muhtasari" : "Overview", path: "/agent-dashboard" },
    { icon: <FaClipboardList />, name: sw ? "Biashara Nilizoleta" : "My Referrals", path: "/agent-dashboard#referrals" },
    { icon: <FaChartLine />, name: sw ? "Mapato" : "Earnings", path: "/agent-dashboard#earnings" },
  ];
  const businessItems: NavItem[] = [
    { icon: <GridIcon />, name: sw ? "Dashibodi" : "Dashboard", path: "/business-dashboard" },
    { icon: <FaBuilding />, name: sw ? "Biashara Zangu" : "My Businesses", path: "/business-my-businesses" },
    { icon: <FaPlus />, name: sw ? "Sajili Biashara" : "Create Business", path: "/business-create" },
    { icon: <FaInfoCircle />, name: sw ? "Maelekezo" : "Instructions", path: "/business-instructions" },
    { icon: <FaShieldAlt />, name: sw ? "Faragha na data" : "Privacy & data", path: "/account/privacy" },
  ];

  const renderGroup = (label: string, items: NavItem[]) => (
    <div className="mb-6">
      {visible ? <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">{label}</p> : <div className="mx-auto mb-3 h-px w-8 bg-gray-200 dark:bg-gray-800" />}
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => {
          const active = !item.path.includes("#") && pathname === item.path;
          return <li key={item.path}><Link href={item.path} title={!visible ? item.name : undefined} className={`menu-item group ${active ? "menu-item-active" : "menu-item-inactive"} ${!visible ? "lg:justify-center" : "lg:justify-start"}`}><span className={active ? "menu-item-icon-active" : "menu-item-icon-inactive"}>{item.icon}</span>{visible && <span className="menu-item-text">{item.name}</span>}</Link></li>;
        })}
      </ul>
    </div>
  );

  return <aside className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0 ${isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`} onMouseEnter={() => !isExpanded && setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
    <Link href="/agent-dashboard" className={`flex items-center py-7 ${visible ? "px-3" : "justify-center"}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-lg font-black text-white shadow-lg shadow-brand-500/20">R</span>{visible && <span className="ml-3 min-w-0"><span className="block font-bold text-gray-900 dark:text-white">Rafiki Agent</span><span className="block truncate text-xs text-gray-500">{sw ? "Kituo cha wakala" : "Agent workspace"}</span></span>}</Link>
    <nav className="min-h-0 flex-1 overflow-y-auto py-2">{renderGroup(sw ? "WAKALA" : "AGENT", agentItems)}{isBusinessOwner && renderGroup(sw ? "MMILIKI WA BIASHARA" : "BUSINESS OWNER", businessItems)}</nav>
    <div className="mt-auto border-t border-gray-100 py-3 dark:border-gray-800"><SidebarWidget expanded={visible} /></div>
  </aside>;
}
