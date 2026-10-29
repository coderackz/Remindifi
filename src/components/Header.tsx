import React, { useState } from 'react';
import {
  Search,
  Download,
  Plus,
  Shield,
  UserCheck,
  Eye,
  Zap,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Role, User } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  role: Role;
  onRoleChange?: (r: Role) => void;
  currentUser?: User | null;
  onSignOut?: () => void;
  onOpenQuickAddReminder: () => void;
  onOpenAddAsset: () => void;
  onExportData: () => void;
  criticalAlertsCount: number;
}

export function Header({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  role,
  currentUser,
  onSignOut,
  onOpenQuickAddReminder,
  onOpenAddAsset,
  onExportData,
  criticalAlertsCount,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Typographic Logo for Remindifi */}
      <div
        onClick={() => onSelectTab('dashboard')}
        className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        title="Remindifi - Compliance & Renewal Platform"
      >
        <div className="w-10 h-10 rounded-2xl bg-[#5E5CE6] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#5E5CE6]/30 group-hover:scale-105 group-hover:bg-[#4E4CD4] transition-all">
          <span className="tracking-tighter">R</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              Remindi<span className="text-[#5E5CE6]">fi</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20">
              Pro
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 tracking-tight mt-0.5">
            Permit & Compliance Ledger
          </span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search Plate, Asset ID, Permit #..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6] transition-all shadow-xs font-medium"
        />
      </div>

      {/* Right Controls: Action Buttons & User Profile */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
        {/* User Role Badge Indicator (Informative, non-switcher) */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
            {role === 'admin' && <Shield className="w-3.5 h-3.5 text-[#5E5CE6]" />}
            {role === 'manager' && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
            {role === 'viewer' && <Eye className="w-3.5 h-3.5 text-amber-600" />}
            <span className="font-bold text-slate-700 capitalize">{role}</span>
            <span className="text-[10px] text-slate-400 font-medium ml-0.5">Profile</span>
          </div>
        )}

        {/* Quick Add Reminder Button */}
        {role !== 'viewer' && (
          <button
            onClick={onOpenQuickAddReminder}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Quick add a new compliance reminder"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">+ Quick Reminder</span>
          </button>
        )}

        {/* Export Data */}
        <button
          onClick={onExportData}
          className="p-2 md:px-3 md:py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Export Compliance Ledger to CSV"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Add Asset Button (Admin Only or disabled with indicator) */}
        {role === 'admin' ? (
          <button
            onClick={onOpenAddAsset}
            className="px-3.5 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#2C276E] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Asset</span>
          </button>
        ) : (
          <button
            disabled
            title={role === 'viewer' ? 'Auditor Mode: Read-only' : 'Admin privilege required to create Parent Assets'}
            className="px-3.5 py-2 rounded-xl bg-slate-200 text-slate-400 text-xs font-medium flex items-center gap-1.5 cursor-not-allowed opacity-75"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Asset</span>
          </button>
        )}

        {/* User Profile & Sign Out Button */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#5E5CE6]/30"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 capitalize font-medium">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-[#5E5CE6] font-bold uppercase mt-1">
                    {currentUser.jobTitle}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelectTab('settings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                  >
                    Manage RBAC & SMTP
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
