import React, { useState } from 'react';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Settings,
  Download,
  Plus,
  ChevronDown,
  LogOut,
  Shield,
  UserCheck,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { Role, User } from '../types';

interface TopNavBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  role: Role;
  currentUser: User | null;
  onSignOut: () => void;
  onOpenAddPermit: () => void;
  onExportData: () => void;
  unreadCount: number;
}

export function TopNavBar({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  role,
  currentUser,
  onSignOut,
  onOpenAddPermit,
  onExportData,
  unreadCount,
}: TopNavBarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="bg-transparent px-6 lg:px-10 py-5 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left Navigation Tabs (matching Dashboard / Workflows / Integrations in reference) */}
      <div className="flex items-center gap-6 lg:gap-8 shrink-0">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center gap-2 text-sm font-extrabold tracking-tight transition-all cursor-pointer relative py-1 ${
            currentTab === 'dashboard'
              ? 'text-slate-900 border-b-2 border-[#5E5CE6]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
            <span className={`w-1.5 h-1.5 rounded-[1px] ${currentTab === 'dashboard' ? 'bg-[#5E5CE6]' : 'bg-slate-400'}`} />
            <span className={`w-1.5 h-1.5 rounded-[1px] ${currentTab === 'dashboard' ? 'bg-[#5E5CE6]' : 'bg-slate-400'}`} />
            <span className={`w-1.5 h-1.5 rounded-[1px] ${currentTab === 'dashboard' ? 'bg-[#5E5CE6]' : 'bg-slate-400'}`} />
            <span className={`w-1.5 h-1.5 rounded-[1px] ${currentTab === 'dashboard' ? 'bg-[#5E5CE6]' : 'bg-slate-400'}`} />
          </div>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('all_reminders')}
          className={`flex items-center gap-2 text-sm font-bold tracking-tight transition-all cursor-pointer relative py-1 ${
            currentTab === 'all_reminders'
              ? 'text-slate-900 border-b-2 border-[#5E5CE6]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span>All Reminders</span>
        </button>

        <button
          onClick={() => onSelectTab('categories')}
          className={`hidden md:flex items-center gap-2 text-sm font-bold tracking-tight transition-all cursor-pointer relative py-1 ${
            currentTab === 'categories'
              ? 'text-slate-900 border-b-2 border-[#5E5CE6]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span>Categories</span>
        </button>
      </div>

      {/* Central Pill Search Bar ("Search or type command") */}
      <div className="flex-1 max-w-md mx-2 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search permits, plate # or type command..."
          className="w-full bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-full pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6] transition-all shadow-xs"
        />
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Light / Dark Mode Toggle Pill */}
        <div className="hidden sm:flex items-center bg-white/90 border border-slate-200/90 rounded-full p-1 shadow-xs">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-[#5E5CE6] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1E1B4B] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
        </div>

        {/* Notifications Bell */}
        <button
          onClick={() => onSelectTab('notifications')}
          className="relative w-9 h-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-[#5E5CE6] hover:border-[#5E5CE6]/40 transition-all shadow-xs cursor-pointer"
          title="Alerts and Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {/* Settings Gear */}
        <button
          onClick={() => onSelectTab('settings')}
          className="w-9 h-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-[#5E5CE6] hover:border-[#5E5CE6]/40 transition-all shadow-xs cursor-pointer"
          title="Platform Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Export data (.xls) Button */}
        <button
          onClick={onExportData}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer group"
          title="Export Permits and Reminders to Excel/CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#5E5CE6]" />
          <span>Export data</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#5E5CE6]/15 text-[#5E5CE6] text-[10px] font-black uppercase">
            .xls
          </span>
        </button>

        {/* Add Permit / New Board Action Pill Button */}
        {role !== 'viewer' && (
          <button
            onClick={onOpenAddPermit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1E1B4B] hover:bg-[#2A2468] text-white text-xs font-extrabold shadow-md shadow-slate-900/10 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Permit</span>
          </button>
        )}

        {/* User Profile Dropdown */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#5E5CE6]/40"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#5E5CE6]/10 text-[#5E5CE6] capitalize">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onSelectTab('settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
