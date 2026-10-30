import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FolderKanban,
  Bell,
  Calendar,
  Mail,
  Settings,
} from 'lucide-react';
import { Role } from '../types';

interface CurvedSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  role: Role;
  unreadAlertsCount: number;
}

export function CurvedSidebar({
  currentTab,
  onSelectTab,
  role,
  unreadAlertsCount,
}: CurvedSidebarProps) {
  // Navigation items with appropriate icons mapped to actual page content
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'all_reminders',
      label: 'All Reminders & Expirations',
      icon: ClipboardList,
    },
    {
      id: 'categories',
      label: 'Categories & Assets',
      icon: FolderKanban,
      adminOnly: true,
      hasProBadge: true,
    },
    {
      id: 'notifications',
      label: 'Notifications & Alerts',
      icon: Bell,
      badgeCount: unreadAlertsCount > 0 ? unreadAlertsCount : 3,
    },
    {
      id: 'calendar',
      label: 'Renewal Calendar',
      icon: Calendar,
    },
    {
      id: 'email_templates',
      label: 'Email Templates',
      icon: Mail,
      hasAmberDot: true,
    },
    {
      id: 'settings',
      label: 'Admin Settings & System Governance',
      icon: Settings,
      adminOnly: true,
      hasGreenDot: true,
    },
  ];

  return (
    <>
      {/* 1. Desktop Organic Curved Sidebar (Visible on md+ screens) */}
      <aside className="hidden md:block w-20 md:w-24 shrink-0 relative z-30 select-none">
        {/* Vertically Centered Sidebar Rail Container */}
        <div className="fixed inset-y-0 left-0 w-20 md:w-24 flex flex-col items-center justify-center pointer-events-none z-30">
          {/* Organic Curved Purple Sidebar Container */}
          <div className="w-full flex flex-col items-center pointer-events-auto drop-shadow-[0_12px_28px_rgba(94,92,230,0.28)]">
            {/* Top smooth curve entering into the purple column */}
            <div className="w-full h-12 md:h-14 shrink-0">
              <svg
                viewBox="0 0 96 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 0 L0 60 L96 60 C96 24 15 32 0 0 Z"
                  fill="#5E5CE6"
                />
              </svg>
            </div>

            {/* Main Purple Navigation Body */}
            <div className="w-full bg-[#5E5CE6] flex flex-col items-center px-2 md:px-3 py-2">
              <nav className="flex flex-col items-center gap-3.5 md:gap-4 w-full">
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;

                  return (
                    <div key={item.id} className="relative w-full flex items-center justify-center">
                      <button
                        onClick={() => onSelectTab(item.id)}
                        title={item.label}
                        aria-label={item.label}
                        className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'w-12 h-12 md:w-13 md:h-13 bg-white rounded-[18px] md:rounded-[20px] shadow-[0_8px_20px_rgba(30,27,75,0.25)] scale-105'
                            : 'w-10 h-10 md:w-11 md:h-11 rounded-xl text-white/85 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 md:w-5.5 md:h-5.5 transition-colors ${
                            isActive
                              ? 'text-[#5E5CE6] stroke-[2.2]'
                              : 'text-white stroke-[1.8]'
                          }`}
                        />

                        {/* Green "PRO" Badge on Categories */}
                        {item.hasProBadge && (
                          <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[#34D399] text-[#064E3B] text-[8px] font-black tracking-wider rounded-full uppercase shadow-xs">
                            PRO
                          </span>
                        )}

                        {/* Amber Dot on Mail */}
                        {item.hasAmberDot && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FBBF24] rounded-full ring-2 ring-[#5E5CE6]" />
                        )}

                        {/* Mint Green Dot on Settings */}
                        {item.hasGreenDot && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#10B981] rounded-full ring-2 ring-[#5E5CE6]" />
                        )}

                        {/* Unread Alerts Count Badge on Bell */}
                        {item.id === 'notifications' && item.badgeCount && item.badgeCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#5E5CE6]">
                            {item.badgeCount}
                          </span>
                        )}

                        {/* Floating Tooltip */}
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1E1B4B] text-white text-xs font-medium rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-2xl z-50">
                          {item.label}
                          {item.adminOnly && role !== 'admin' && (
                            <span className="ml-1.5 text-[10px] text-amber-300 font-bold">(Admin)</span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Bottom smooth curve exiting from the purple column */}
            <div className="w-full h-12 md:h-14 shrink-0">
              <svg
                viewBox="0 0 96 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 0 L96 0 C96 36 15 28 0 60 L0 0 Z"
                  fill="#5E5CE6"
                />
              </svg>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Bottom Docked Navigation Rail (Visible on screens < md) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#5E5CE6]/95 backdrop-blur-xl text-white shadow-[0_-8px_30px_rgba(30,27,75,0.3)] border-t border-white/15 px-2 py-2 pb-[max(0.65rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'w-10 h-10 bg-white rounded-2xl shadow-md text-[#5E5CE6] scale-105'
                    : 'w-9 h-9 rounded-xl text-white/80 hover:text-white active:scale-95'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#5E5CE6] stroke-[2.2]' : 'text-white stroke-[1.8]'
                  }`}
                />

                {/* Green "PRO" Badge on Categories */}
                {item.hasProBadge && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.1 bg-[#34D399] text-[#064E3B] text-[7px] font-black rounded-full uppercase">
                    PRO
                  </span>
                )}

                {/* Amber Dot on Mail */}
                {item.hasAmberDot && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#FBBF24] rounded-full ring-1 ring-[#5E5CE6]" />
                )}

                {/* Mint Green Dot on Settings */}
                {item.hasGreenDot && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#10B981] rounded-full ring-1 ring-[#5E5CE6]" />
                )}

                {/* Unread Alerts Count Badge on Bell */}
                {item.id === 'notifications' && item.badgeCount && item.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 bg-[#EF4444] text-white text-[8px] font-bold rounded-full flex items-center justify-center ring-1 ring-[#5E5CE6]">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

