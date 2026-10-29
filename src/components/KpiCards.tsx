import React from 'react';
import {
  AlertOctagon,
  Clock,
  RefreshCw,
  CheckCircle2,
  Coins,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { UrgencyFilter } from '../types';
import { formatAED } from '../utils/compliance';

interface KpiCardsProps {
  metrics: {
    totalPermits: number;
    totalSpend: number;
    criticalCount: number;
    warningCount: number;
    inRenewalCount: number;
    healthyCount: number;
    expiredCount: number;
  };
  activeFilter: UrgencyFilter;
  onFilterChange: (f: UrgencyFilter) => void;
}

export function KpiCards({ metrics, activeFilter, onFilterChange }: KpiCardsProps) {
  const cards = [
    {
      id: 'critical' as UrgencyFilter,
      label: 'Expired / Critical (<7d)',
      count: metrics.criticalCount + metrics.expiredCount,
      subtext: `${metrics.expiredCount > 0 ? `${metrics.expiredCount} expired · ` : ''}Action required immediately`,
      icon: AlertOctagon,
      bg: 'bg-red-50/90 hover:bg-red-100/80',
      activeBorder: 'border-red-500 ring-2 ring-red-400/40 bg-red-100/90',
      textColor: 'text-red-700',
      badgeBg: 'bg-red-500 text-white',
      iconColor: 'text-red-600',
    },
    {
      id: 'warning' as UrgencyFilter,
      label: 'Expiring Soon (<30d)',
      count: metrics.warningCount,
      subtext: 'Prepare documentation & fees',
      icon: Clock,
      bg: 'bg-amber-50/90 hover:bg-amber-100/80',
      activeBorder: 'border-amber-500 ring-2 ring-amber-400/40 bg-amber-100/90',
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-500 text-white',
      iconColor: 'text-amber-600',
    },
    {
      id: 'in_renewal' as UrgencyFilter,
      label: 'In Renewal Process',
      count: metrics.inRenewalCount,
      subtext: 'Paperwork under authority review',
      icon: RefreshCw,
      bg: 'bg-blue-50/90 hover:bg-blue-100/80',
      activeBorder: 'border-blue-500 ring-2 ring-blue-400/40 bg-blue-100/90',
      textColor: 'text-blue-700',
      badgeBg: 'bg-blue-500 text-white',
      iconColor: 'text-blue-600',
    },
    {
      id: 'active' as UrgencyFilter,
      label: 'Active & Compliant',
      count: metrics.healthyCount,
      subtext: 'Full legal compliance maintained',
      icon: CheckCircle2,
      bg: 'bg-emerald-50/90 hover:bg-emerald-100/80',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-100/90',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-500 text-white',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;
        const Icon = card.icon;

        return (
          <button
            key={card.id}
            onClick={() => onFilterChange(isSelected ? 'all' : card.id)}
            className={`text-left p-5 rounded-3xl border transition-all relative overflow-hidden shadow-xs hover:shadow-md ${
              isSelected ? card.activeBorder : `border-slate-200/80 bg-white hover:border-slate-300`
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                {card.label}
              </span>
              <div className={`p-2 rounded-2xl ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.count}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                of {metrics.totalPermits}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
              {card.subtext}
            </p>

            {isSelected && (
              <span className="absolute bottom-2 right-3 text-[10px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                Active Filter ✕
              </span>
            )}
          </button>
        );
      })}

      {/* Card 5: Annual Spend */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#2A2663] to-[#3B358A] text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
        {/* Background decorative ring */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-indigo-200 uppercase tracking-wide">
            Annual Compliance Spend
          </span>
          <div className="p-2 rounded-2xl bg-white/10 text-amber-300">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-1">
            {formatAED(metrics.totalSpend)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-200">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Across all active parent assets</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
          <span>Avg / Permit:</span>
          <span className="font-semibold text-white">
            {formatAED(metrics.totalPermits ? Math.round(metrics.totalSpend / metrics.totalPermits) : 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
