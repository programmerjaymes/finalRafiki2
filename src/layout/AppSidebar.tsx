"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  GridIcon,
  UserCircleIcon,
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons/index";
import { 
  FaMoneyBillWave as PaymentIcon,
  FaSms as SmsIcon,
  FaBug as SystemLogsIcon,
  FaCog as SettingsIcon,
  FaTags as CategoryIcon,
  FaBuilding as BusinessIcon,
  FaListUl as AllBusinessesIcon,
  FaHourglassHalf as PendingApprovalIcon,
  FaClipboardCheck as ApprovalLogIcon,
  FaMapMarkedAlt as AdministrativeAreasIcon,
  FaGlobeAfrica as RegionIcon,
  FaCity as DistrictIcon,
  FaMapPin as WardIcon,
  FaRoad as StreetIcon,
  FaChartLine as CustomerActivityIcon,
} from 'react-icons/fa';
import SidebarWidget from "./SidebarWidget";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

type NavSubItem = {
  name: string;
  path?: string;
  pro: boolean;
  icon?: React.ReactNode;
  children?: NavSubItem[];
};

type NavItem = {
  icon: React.ReactNode;
  name: string;
  path?: string;
  subItems?: NavSubItem[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const locale = useLocale();
  const messages = t(locale);

  const navItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: messages.admin.dashboard,
      path: "/dashboard",
    },
    {
      icon: <BoxCubeIcon />,
      name: messages.admin.bundles,
      path: "/bundles",
    },
    {
      icon: <BusinessIcon />,
      name: messages.admin.businesses,
      subItems: [
        { name: messages.admin.allBusinesses, path: "/businesses", pro: false, icon: <AllBusinessesIcon /> },
        {
          name: messages.admin.pendingApprovals,
          icon: <PendingApprovalIcon />,
          path: "/businesses/pending",
          pro: false,
        },
      ],
    },
    {
      icon: <UserCircleIcon />,
      name: locale === 'sw' ? 'Utawala' : 'Administration',
      subItems: [
        { name: locale === 'sw' ? 'Kumbukumbu za Idhini' : 'Approval Logs', path: "/businesses/approval-logs", pro: false, icon: <ApprovalLogIcon /> },
        { name: messages.admin.categories, path: "/categories", pro: false, icon: <CategoryIcon /> },
        {
          name: locale === 'sw' ? 'Maeneo ya Utawala' : 'Administrative Areas',
          pro: false,
          icon: <AdministrativeAreasIcon />,
          children: [
            { name: messages.admin.regions, path: "/regions", pro: false, icon: <RegionIcon /> },
            { name: messages.admin.districts, path: "/districts", pro: false, icon: <DistrictIcon /> },
            { name: messages.admin.wards, path: "/wards", pro: false, icon: <WardIcon /> },
            { name: locale === 'sw' ? 'Vijiji' : 'Villages', path: "/streets", pro: false, icon: <StreetIcon /> },
          ],
        },
        { name: messages.admin.payments, path: "/payments", pro: false, icon: <PaymentIcon /> },
        { name: locale === 'sw' ? 'Gharama za Programu' : 'App Expenses', path: "/app-expenses", pro: false, icon: <PaymentIcon /> },
        { name: messages.admin.users, path: "/users", pro: false, icon: <UserCircleIcon /> },
        { name: locale === 'sw' ? 'Ziara na Mibofyo' : 'Customer Activity', path: "/customer-activity", pro: false, icon: <CustomerActivityIcon /> },
        { name: locale === 'sw' ? 'Ujumbe wa SMS' : 'SMS Messaging', path: "/sms", pro: false, icon: <SmsIcon /> },
        { name: locale === 'sw' ? 'Kumbukumbu za Mfumo' : 'System Logs', path: "/system-logs", pro: false, icon: <SystemLogsIcon /> },
        { name: locale === 'sw' ? 'Mipangilio' : 'Settings', path: "/settings", pro: false, icon: <SettingsIcon /> },
      ],
    },
  ];

  const filteredNavItems = (() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return navItems;
    return navItems.flatMap((nav) => {
      if (nav.name.toLowerCase().includes(term)) return [nav];
      const matchingChildren = nav.subItems?.flatMap((item) => {
        if (item.name.toLowerCase().includes(term)) return [item];
        const children = item.children?.filter((child) => child.name.toLowerCase().includes(term));
        return children?.length ? [{ ...item, children }] : [];
      });
      return matchingChildren?.length ? [{ ...nav, subItems: matchingChildren }] : [];
    });
  })();

  const navigationSpinner = <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-brand-500/30 dark:border-t-brand-400" aria-hidden="true" />;

  const startNavigation = (event: React.MouseEvent, path: string) => {
    if (path === pathname) { event.preventDefault(); return; }
    setLoadingPath(path);
  };

  const renderMenuItems = (navItems: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group  ${
                (searchQuery.trim() || openSubmenu === index)
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  (searchQuery.trim() || openSubmenu === index)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    (searchQuery.trim() || openSubmenu === index)
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                onClick={(event) => startNavigation(event, nav.path!)}
                aria-disabled={Boolean(loadingPath)}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {loadingPath === nav.path ? navigationSpinner : nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[index] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height: searchQuery.trim() ? "auto" : openSubmenu === index ? `${subMenuHeight[index]}px` : "0px",
              }}
            >
              <ul className="mt-2 ml-9 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    {subItem.children ? (
                      <div className="py-1">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                          {subItem.icon}<span>{subItem.name}</span>
                        </div>
                        <ul className="ml-3 space-y-1 border-l border-gray-200 pl-2 dark:border-gray-700">
                          {subItem.children.map((child) => child.path && (
                            <li key={child.name}>
                              <Link href={child.path} onClick={(event) => startNavigation(event, child.path!)} aria-disabled={Boolean(loadingPath)} className={isActive(child.path) ? "menu-dropdown-item menu-dropdown-item-active" : "menu-dropdown-item menu-dropdown-item-inactive"}>
                                <span className="mr-2 text-sm">{loadingPath === child.path ? navigationSpinner : child.icon}</span>
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : subItem.path ? (
                      <Link href={subItem.path} onClick={(event) => startNavigation(event, subItem.path!)} aria-disabled={Boolean(loadingPath)} className={isActive(subItem.path) ? "menu-dropdown-item menu-dropdown-item-active" : "menu-dropdown-item menu-dropdown-item-inactive"}>
                        <span className="mr-2 text-sm">{loadingPath === subItem.path ? navigationSpinner : subItem.icon}</span>
                        {subItem.name}
                        {subItem.pro && <span className="menu-dropdown-badge ml-auto">pro</span>}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    setLoadingPath(null);
    let submenuMatched = false;
    navItems.forEach((nav, i) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if ((subItem.path && isActive(subItem.path)) || subItem.children?.some((child) => child.path && isActive(child.path))) {
            setOpenSubmenu(i);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (!loadingPath) return;
    const timeout = window.setTimeout(() => setLoadingPath(null), 15000);
    return () => window.clearTimeout(timeout);
  }, [loadingPath]);

  useEffect(() => {
    if (openSubmenu !== null) {
      if (subMenuRefs.current[openSubmenu]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu === index) {
        return null;
      }
      return index;
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 mr-3 rounded-full bg-brand-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">Rafiki</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
              </svg>
            </div>
          )}
        </Link>
      </div>
      {isAdmin && (isExpanded || isHovered || isMobileOpen) && (
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={locale === 'sw' ? 'Tafuta menyu…' : 'Search menu…'}
            aria-label={locale === 'sw' ? 'Tafuta kwenye menyu' : 'Search sidebar menu'}
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500 dark:focus:bg-gray-900"
          />
          {searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear menu search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"><XMarkIcon className="h-4 w-4" /></button>}
        </div>
      )}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className={loadingPath ? "mb-6 pointer-events-none opacity-70 transition-opacity" : "mb-6 transition-opacity"} aria-busy={Boolean(loadingPath)}>
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {filteredNavItems.length ? renderMenuItems(filteredNavItems) : <p className="rounded-lg bg-gray-50 px-3 py-4 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">{locale === 'sw' ? 'Hakuna menyu iliyopatikana' : 'No menu items found'}</p>}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
