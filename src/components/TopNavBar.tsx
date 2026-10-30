import React, { useState, useRef, useEffect } from 'react';
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
  CheckCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  X,
  BellRing,
} from 'lucide-react';
import { Role, User, NotificationLog } from '../types';

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
  notifications?: NotificationLog[];
  onClearNotifications?: () => void;
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
  notifications = [],
  onClearNotifications,
}: TopNavBarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [clearedLocally, setClearedLocally] = useState(false);

  const effectiveUnreadCount = clearedLocally ? 0 : unreadCount;

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotificationsDropdown(false);
        setShowUserDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClearedLocally(true);
    if (onClearNotifications) {
      onClearNotifications();
    }
  };

  return (
    <header className="bg-white/40 backdrop-blur-md border-b border-white/50 px-3 sm:px-6 lg:px-10 py-2.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 shadow-xs transition-all">
      {/* 1. Selector 1: remindifi Clean Minimalist Typographic Logo */}
      <div
        onClick={() => onSelectTab('dashboard')}
        className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0"
        title="remindifi"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#5E5CE6] to-[#7B79FF] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-sm group-hover:scale-105 group-hover:shadow-[#5E5CE6]/30 transition-all">
          <span className="tracking-tighter">r</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#5E5CE6] transition-colors leading-none">
            remindi<span className="text-[#5E5CE6]">fi</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#5E5CE6] ml-0.5 sm:ml-1 self-end mb-1 inline-block" />
        </div>
      </div>

      {/* Central Pill Search Bar */}
      <div className="flex-1 min-w-[90px] max-w-xs sm:max-w-md mx-1 sm:mx-2 relative">
        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search permits, plate #..."
          className="w-full bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-full pl-8 sm:pl-11 pr-3 sm:pr-4 py-1.5 sm:py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6] transition-all shadow-xs"
        />
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 relative">
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

        {/* Selector 6: Notifications Bell Button */}
        <button
          onClick={() => {
            setShowNotificationsDropdown((prev) => !prev);
            setShowUserDropdown(false);
          }}
          className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-all shadow-xs cursor-pointer ${
            showNotificationsDropdown
              ? 'bg-[#5E5CE6] text-white border-[#5E5CE6] ring-2 ring-[#5E5CE6]/30'
              : 'bg-white border-slate-200/90 text-slate-600 hover:text-[#5E5CE6] hover:border-[#5E5CE6]/40'
          }`}
          title="Alerts and Notifications"
        >
          <Bell className="w-4 h-4" />
          {effectiveUnreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
              {effectiveUnreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Notification Style */}
        {showNotificationsDropdown && (
          <div className="absolute right-0 top-12 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Dropdown Header */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#5E5CE6]" />
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  Notifications
                </span>
                {effectiveUnreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold">
                    {effectiveUnreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {effectiveUnreadCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] font-bold text-[#5E5CE6] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationsDropdown(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((log) => {
                  const isCritical = log.milestoneDays <= 7;
                  return (
                    <div
                      key={log.id}
                      onClick={() => {
                        setShowNotificationsDropdown(false);
                        onSelectTab('notifications');
                      }}
                      className="p-3.5 hover:bg-slate-50/90 transition-colors cursor-pointer group flex items-start gap-3"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isCritical
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-[#5E5CE6] transition-colors truncate">
                            {log.assetIdentifier}
                          </span>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                              isCritical
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}
                          >
                            {log.milestoneDays}d left
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                          {log.digestSubject || `Milestone alert for ${log.assetIdentifier}`}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Sent to {log.recipientEmail.split('@')[0]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">All caught up!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No pending critical compliance alerts.
                  </p>
                </div>
              )}
            </div>

            {/* Dropdown Footer Action */}
            <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400">
                Daily cron triggers at 08:00 GST
              </span>
              <button
                onClick={() => {
                  setShowNotificationsDropdown(false);
                  onSelectTab('notifications');
                }}
                className="text-xs font-bold text-[#5E5CE6] hover:text-[#4B49C8] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

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

        {/* Add Permit Action Pill Button */}
        {role !== 'viewer' && (
          <button
            onClick={onOpenAddPermit}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#1E1B4B] hover:bg-[#2A2468] text-white text-xs font-extrabold shadow-md shadow-slate-900/10 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Add New Permit"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Permit</span>
          </button>
        )}

        {/* User Profile Dropdown */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotificationsDropdown(false);
              }}
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
