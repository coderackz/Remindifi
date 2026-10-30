import React from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { User } from '../types';
import { formatAED } from '../utils/compliance';

interface TopSectionWidgetsProps {
  currentUser: User | null;
  onOpenQuickAdd: () => void;
  onOpenAddAsset: () => void;
  onOpenAddPermit: () => void;
  onExportData: () => void;
  urgentCount: number;
  annualBudget?: number;
  onViewBudget?: () => void;
}

export function TopSectionWidgets({
  currentUser,
  onOpenQuickAdd,
  onOpenAddAsset,
  onOpenAddPermit,
  onExportData,
  urgentCount,
  annualBudget = 84250,
  onViewBudget,
}: TopSectionWidgetsProps) {
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Admin';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
      {/* Left Hero Greeting (Matching the reference's bold typography & avatars) */}
      <div className="xl:col-span-5 flex flex-col justify-center pr-2">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Hi, {firstName}!
          </h1>
          {/* Stacked Avatars Cluster */}
          <div className="flex items-center -space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[10px] font-black ring-2 ring-white shadow-xs">
              AD
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-[10px] font-black ring-2 ring-white shadow-xs">
              PR
            </div>
            <div className="w-7 h-7 rounded-full bg-[#5E5CE6] text-white flex items-center justify-center text-[10px] font-black ring-2 ring-white shadow-xs">
              ⚡
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
          What permits are due for renewal today?
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md leading-relaxed">
          {urgentCount > 0
            ? `Attention required: ${urgentCount} near-to-expiry permits need verification and prompt renewal.`
            : 'All fleet vehicles and corporate entities are currently compliant and up to date.'}
        </p>
      </div>

      {/* Right Row of 4 Cards: 1 Dashed Add-Reminder + 3 Illustrated Feature Cards */}
      <div className="xl:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* 1. Dashed Border Card with centered + button: Add a Reminder */}
        <div
          onClick={onOpenQuickAdd}
          className="bg-white/60 hover:bg-white border-2 border-dashed border-[#5E5CE6]/30 hover:border-[#5E5CE6] rounded-[28px] p-5 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.03] group shadow-xs min-h-[160px]"
          title="Add a Reminder"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#5E5CE6]/10 text-[#5E5CE6] group-hover:bg-[#5E5CE6] group-hover:text-white flex items-center justify-center transition-all shadow-sm">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-black text-slate-700 group-hover:text-[#5E5CE6] mt-3 tracking-tight">
            Add a Reminder
          </span>
        </div>

        {/* 2. Illustrated Card 1: Register New Asset (Calendar / Checklist vector) */}
        <div
          onClick={onOpenAddAsset}
          className="bg-white rounded-[28px] p-4 flex flex-col justify-between shadow-sm hover:shadow-md border border-slate-100 transition-all hover:-translate-y-1 cursor-pointer group min-h-[160px]"
        >
          {/* Custom SVG Line-Art Illustration */}
          <div className="w-full flex justify-center py-1">
            <svg
              className="w-16 h-16 text-[#5E5CE6] group-hover:scale-105 transition-transform"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Binder rings */}
              <circle cx="26" cy="14" r="3" stroke="#1E1B4B" strokeWidth="2.5" />
              <circle cx="36" cy="14" r="3" stroke="#1E1B4B" strokeWidth="2.5" />
              <circle cx="46" cy="14" r="3" stroke="#1E1B4B" strokeWidth="2.5" />
              {/* Card body */}
              <rect
                x="18"
                y="18"
                width="36"
                height="44"
                rx="6"
                stroke="#1E1B4B"
                strokeWidth="2.5"
                fill="#F7F6FD"
              />
              {/* Header stripe */}
              <rect x="23" y="24" width="26" height="6" rx="2" fill="#5E5CE6" />
              {/* Checklist items */}
              <rect x="23" y="34" width="16" height="3" rx="1.5" fill="#CBD5E1" />
              <rect x="23" y="41" width="22" height="3" rx="1.5" fill="#CBD5E1" />
              <rect x="23" y="48" width="12" height="3" rx="1.5" fill="#CBD5E1" />
              {/* Checkmark */}
              <path
                d="M44 46L49 51L56 42"
                stroke="#5E5CE6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 group-hover:text-[#5E5CE6] transition-colors">
              New Asset
            </h3>
            <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
              Vehicles & branches
            </p>
          </div>
        </div>

        {/* 3. Illustrated Card 2: Upload Mulkiya / Permit (Hanging ID Cards vector) */}
        <div
          onClick={onOpenAddPermit}
          className="bg-white rounded-[28px] p-4 flex flex-col justify-between shadow-sm hover:shadow-md border border-slate-100 transition-all hover:-translate-y-1 cursor-pointer group min-h-[160px]"
        >
          {/* Custom SVG Line-Art Illustration */}
          <div className="w-full flex justify-center py-1">
            <svg
              className="w-16 h-16 group-hover:scale-105 transition-transform"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Hanging string */}
              <path d="M12 20L60 20" stroke="#1E1B4B" strokeWidth="2.5" strokeDasharray="3 3" />
              {/* Pegs */}
              <rect x="24" y="16" width="4" height="8" rx="1" fill="#1E1B4B" />
              <rect x="44" y="16" width="4" height="8" rx="1" fill="#1E1B4B" />
              {/* Hanging Permit 1 */}
              <g transform="rotate(-6 24 22)">
                <rect
                  x="14"
                  y="22"
                  width="22"
                  height="30"
                  rx="3"
                  stroke="#1E1B4B"
                  strokeWidth="2"
                  fill="#FFF"
                />
                <circle cx="25" cy="30" r="3" fill="#5E5CE6" />
                <rect x="18" y="37" width="14" height="2" rx="1" fill="#CBD5E1" />
                <rect x="18" y="42" width="10" height="2" rx="1" fill="#CBD5E1" />
              </g>
              {/* Hanging Permit 2 */}
              <g transform="rotate(8 44 22)">
                <rect
                  x="38"
                  y="22"
                  width="22"
                  height="30"
                  rx="3"
                  stroke="#1E1B4B"
                  strokeWidth="2"
                  fill="#FFF"
                />
                <circle cx="49" cy="30" r="3" fill="#10B981" />
                <rect x="42" y="37" width="14" height="2" rx="1" fill="#CBD5E1" />
                <rect x="42" y="42" width="10" height="2" rx="1" fill="#CBD5E1" />
              </g>
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 group-hover:text-[#5E5CE6] transition-colors">
              Upload Permit
            </h3>
            <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
              Mulkiya & Insurance
            </p>
          </div>
        </div>

        {/* 4. Illustrated Card 3: Annual Budget (Financial ledger & spend vector) */}
        <div
          onClick={onViewBudget || onExportData}
          className="bg-white rounded-[28px] p-4 flex flex-col justify-between shadow-sm hover:shadow-md border border-slate-100 transition-all hover:-translate-y-1 cursor-pointer group min-h-[160px]"
          title="Annual Compliance & Renewal Budget"
        >
          {/* Custom SVG Line-Art Illustration for Annual Budget */}
          <div className="w-full flex justify-center py-1">
            <svg
              className="w-16 h-16 group-hover:scale-105 transition-transform"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Safe / Ledger Vault body */}
              <rect
                x="16"
                y="18"
                width="40"
                height="38"
                rx="8"
                stroke="#1E1B4B"
                strokeWidth="2.5"
                fill="#F7F6FD"
              />
              {/* Coin stack 1 */}
              <ellipse cx="28" cy="42" rx="7" ry="2.5" fill="#E2E8F0" stroke="#1E1B4B" strokeWidth="1.5" />
              <path d="M21 42V45C21 46.38 24.13 47.5 28 47.5C31.87 47.5 35 46.38 35 45V42" stroke="#1E1B4B" strokeWidth="1.5" fill="#5E5CE6" />
              {/* Coin stack 2 */}
              <ellipse cx="42" cy="36" rx="7" ry="2.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
              <path d="M35 36V39C35 40.38 38.13 41.5 42 41.5C45.87 41.5 49 40.38 49 39V36" stroke="#D97706" strokeWidth="1.5" fill="#F59E0B" />
              {/* Vault handle dial */}
              <circle cx="36" cy="27" r="5" stroke="#1E1B4B" strokeWidth="2" fill="#FFF" />
              <circle cx="36" cy="27" r="1.5" fill="#5E5CE6" />
              {/* Growth Arrow badge */}
              <path d="M46 22L54 16M54 16H48M54 16V22" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-xs font-black text-slate-900 group-hover:text-[#5E5CE6] transition-colors">
                Annual Budget
              </h3>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />
                Tracked
              </span>
            </div>
            <p className="text-[11px] font-extrabold text-[#5E5CE6] mt-0.5 truncate">
              {formatAED(annualBudget)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
