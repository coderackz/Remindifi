import React from 'react';
import {
  LayoutGrid,
  FileText,
  Layers,
  Bell,
  Calendar,
  Mail,
  Edit3,
  RefreshCw,
  Settings,
  Sparkles,
  Shield,
  UserCheck,
  Eye,
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
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
    },
    {
      id: 'all_reminders',
      label: 'All Reminders',
      icon: FileText,
    },
    {
      id: 'categories',
      label: 'Categories & Assets',
      icon: Layers,
      adminOnly: true,
    },
    {
      id: 'notifications',
      label: 'Notifications & Alerts',
      icon: Bell,
      badge: 3,
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
    },
    {
      id: 'quick_actions',
      label: 'Compliance Notes',
      icon: Edit3,
    },
    {
      id: 'settings',
      label: 'Settings (RBAC & SMTP)',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-20 md:w-24 shrink-0 relative z-30 select-none flex flex-col items-center">
      {/* Background Curved Container */}
      <div className="fixed top-0 bottom-0 left-0 w-20 md:w-24 bg-[#5E5CE6] text-white flex flex-col items-center py-6 px-2.5 shadow-2xl transition-all rounded-r-[38px]">
        {/* Top Logo / App Icon */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="mb-8 cursor-pointer group flex flex-col items-center"
          title="Remindifi Fleet & Business Compliance"
        >
          <div className="w-12 h-12 rounded-2xl bg-white text-[#5E5CE6] flex items-center justify-center font-black text-xl shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
            <span className="tracking-tighter">R</span>
          </div>
        </div>

        {/* Navigation Items with active cutout effect */}
        <nav className="flex-1 flex flex-col gap-3 w-full items-center">
          {navItems.map((item) => {
            const isActive =
              currentTab === item.id ||
              (item.id === 'calendar' && currentTab === 'dashboard_calendar');
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative w-full flex items-center justify-center">
                {/* Active Cutout Notch if active */}
                {isActive && (
                  <div className="absolute -right-3 w-3 h-10 bg-[#F3F4FB] rounded-l-full pointer-events-none" />
                )}

                <button
                  onClick={() => {
                    if (item.id === 'calendar') {
                      onSelectTab('dashboard');
                    } else if (item.id === 'quick_actions') {
                      onSelectTab('all_reminders');
                    } else {
                      onSelectTab(item.id);
                    }
                  }}
                  title={item.label}
                  className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#5E5CE6] shadow-xl scale-105 font-bold'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />

                  {/* Badge */}
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#EF4444] text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-[#5E5CE6] shadow-sm">
                      {item.badge}
                    </span>
                  )}

                  {/* Floating Tooltip */}
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1E1B4B] text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-2xl z-50">
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

        {/* Bottom Profile / Role Badge */}
        <div className="pt-4 border-t border-white/20 w-full flex flex-col items-center gap-1.5">
          <button
            onClick={() => onSelectTab('settings')}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
            title={`Active Role: ${role.toUpperCase()}`}
          >
            {role === 'admin' ? (
              <Shield className="w-5 h-5 text-amber-300" />
            ) : role === 'manager' ? (
              <UserCheck className="w-5 h-5 text-sky-200" />
            ) : (
              <Eye className="w-5 h-5 text-emerald-200" />
            )}
          </button>
          <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
            {role}
          </span>
        </div>
      </div>
    </aside>
  );
}
