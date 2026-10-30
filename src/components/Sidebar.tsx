import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Layers,
  Mail,
  Palette,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  role: Role;
  unreadAlertsCount: number;
}

export function Sidebar({ currentTab, onSelectTab, role, unreadAlertsCount }: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Near-Expiry Attention Queue',
      icon: LayoutDashboard,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
    },
    {
      id: 'all_reminders',
      label: 'All Reminders Catalog',
      icon: FileText,
    },
    {
      id: 'calendar',
      label: 'Renewal Calendar',
      icon: Calendar,
    },
    {
      id: 'categories',
      label: 'Categories & Groups',
      icon: Layers,
      adminOnly: true,
    },
    {
      id: 'notifications',
      label: 'Email Digest & Cron Trigger',
      icon: Mail,
    },
    {
      id: 'email_templates',
      label: 'Email Template Customizer',
      icon: Palette,
    },
    {
      id: 'settings',
      label: 'Settings (RBAC & SMTP)',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-20 md:w-24 bg-[#5E5CE6] text-white flex flex-col items-center py-6 px-3 shrink-0 rounded-r-3xl shadow-xl transition-all relative z-20">
      {/* Nav Buttons */}
      <nav className="flex-1 flex flex-col gap-3.5 w-full items-center pt-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all group cursor-pointer ${
                isActive
                  ? 'bg-white text-[#5E5CE6] shadow-lg scale-105'
                  : 'text-white/80 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#5E5CE6] animate-pulse">
                  {item.badge}
                </span>
              )}

              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E1B4B] text-white text-xs font-medium rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-xl z-50">
                {item.label}
                {item.adminOnly && role !== 'admin' && (
                  <span className="ml-1 text-[10px] text-amber-300 font-semibold">(Admin)</span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Role Indicator at Bottom */}
      <div className="flex flex-col items-center gap-2 w-full pt-4 border-t border-white/15">
        <button
          onClick={() => onSelectTab('settings')}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          title={`Active Role: ${role.toUpperCase()} (Click to open Settings)`}
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
        </button>
        <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
          {role}
        </span>
      </div>
    </aside>
  );
}
