import React, { useState, useMemo } from 'react';
import {
  Edit2,
  Share2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
  Mail,
  Clock,
  AlertTriangle,
  ExternalLink,
  Settings2,
  FileText,
  Check,
} from 'lucide-react';
import { Permit, Asset, PermitCategory } from '../types';
import { calculateDaysRemaining, getPermitUrgency, formatAED } from '../utils/compliance';

interface BottomSectionWidgetsProps {
  permits: Permit[];
  assetMap: Map<string, Asset>;
  categoryMap: Map<string, PermitCategory>;
  onTriggerDailyCron: () => void;
  onLogRenewal: (permitId: string) => void;
  onOpenQuickAdd: () => void;
  criticalCount: number;
  onNavigateTab?: (tab: 'dashboard' | 'all_reminders' | 'categories' | 'notifications' | 'email_templates' | 'settings') => void;
  onSelectAsset?: (assetId: string) => void;
}

export function BottomSectionWidgets({
  permits,
  assetMap,
  categoryMap,
  onTriggerDailyCron,
  onLogRenewal,
  onOpenQuickAdd,
  criticalCount,
  onNavigateTab,
  onSelectAsset,
}: BottomSectionWidgetsProps) {
  const [meetingConfirmed, setMeetingConfirmed] = useState(false);
  const [cronTriggeredNotice, setCronTriggeredNotice] = useState(false);

  const handleBulkAlerts = () => {
    onTriggerDailyCron();
    setCronTriggeredNotice(true);
    setTimeout(() => setCronTriggeredNotice(false), 4000);
  };

  // Dynamic Upcoming Renewals sorted by expiry date ascending
  const upcomingRenewals = useMemo(() => {
    return [...permits]
      .sort((a, b) => calculateDaysRemaining(a.expiryDate) - calculateDaysRemaining(b.expiryDate))
      .slice(0, 3);
  }, [permits]);

  // Calculate Fleet Compliance & Commercial percentages
  const vehiclePermits = permits.filter((p) => {
    const asset = assetMap.get(p.assetId);
    return asset?.assetGroupId === 'ag-vehicles' || asset?.identifier.includes('DXB') || asset?.identifier.includes('SHJ');
  });
  const vehicleValid = vehiclePermits.filter((p) => p.status === 'active' && calculateDaysRemaining(p.expiryDate) > 7).length;
  const vehiclePct = vehiclePermits.length > 0 ? Math.round((vehicleValid / vehiclePermits.length) * 100) : 92;

  const branchPermits = permits.filter((p) => {
    const asset = assetMap.get(p.assetId);
    return asset?.assetGroupId !== 'ag-vehicles';
  });
  const branchValid = branchPermits.filter((p) => p.status === 'active' && calculateDaysRemaining(p.expiryDate) > 7).length;
  const branchPct = branchPermits.length > 0 ? Math.round((branchValid / branchPermits.length) * 100) : 78;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* ------------------------------------------------------------- */}
      {/* 1. UPCOMING RENEWALS (Wide Left Card - 6 cols)                */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-6 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Upcoming Renewals</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#5E5CE6]/10 text-[#5E5CE6]">
                {permits.filter((p) => calculateDaysRemaining(p.expiryDate) <= 30).length} Near Expiry
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
              <button
                onClick={() => onNavigateTab?.('all_reminders')}
                className="hover:text-[#5E5CE6] flex items-center gap-1 cursor-pointer transition-colors"
                title="View Full Catalog"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Dynamic Upcoming Renewal Items List */}
          <div className="space-y-3 pt-1">
            {upcomingRenewals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No renewals pending</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All fleet and company permits are up to date.</p>
              </div>
            ) : (
              upcomingRenewals.map((permit) => {
                const asset = assetMap.get(permit.assetId);
                const category = categoryMap.get(permit.categoryId);
                const daysRemaining = calculateDaysRemaining(permit.expiryDate);
                const urgency = getPermitUrgency(permit);

                // Urgency-based percentage bar and badges
                let progressPct = 85;
                let barColor = 'bg-[#5E5CE6]';
                let badgeClass = 'bg-slate-100 text-slate-700';

                if (urgency === 'expired') {
                  progressPct = 100;
                  barColor = 'bg-red-600';
                  badgeClass = 'bg-red-500 text-white animate-pulse font-black';
                } else if (urgency === 'critical') {
                  progressPct = 90;
                  barColor = 'bg-red-500';
                  badgeClass = 'bg-red-100 text-red-700 font-black';
                } else if (urgency === 'warning') {
                  progressPct = 65;
                  barColor = 'bg-amber-500';
                  badgeClass = 'bg-amber-100 text-amber-800 font-bold';
                } else if (urgency === 'in_renewal') {
                  progressPct = 50;
                  barColor = 'bg-blue-600';
                  badgeClass = 'bg-blue-100 text-blue-700 font-bold';
                }

                return (
                  <div
                    key={permit.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl hover:bg-slate-50 transition-all border border-slate-100 hover:border-slate-200 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${badgeClass}`}>
                          {urgency === 'expired'
                            ? 'Expired'
                            : urgency === 'in_renewal'
                            ? 'In Renewal'
                            : `${daysRemaining}d left`}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 leading-tight truncate group-hover:text-[#5E5CE6] transition-colors">
                          {category?.name || 'Compliance Permit'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold truncate">
                        {asset ? `${asset.identifier} (${asset.name})` : 'Asset'} • Ref: {permit.permitNumber}
                      </p>
                    </div>

                    {/* Linear Urgency Progress Bar */}
                    <div className="flex items-center gap-3 sm:w-40">
                      <span className="text-[11px] font-black text-slate-700 w-14 text-right">
                        {formatAED(permit.cost)}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onLogRenewal(permit.id)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-[#5E5CE6] hover:text-white text-slate-600 transition-colors cursor-pointer"
                        title="Log Renewal / Complete"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      {onSelectAsset && (
                        <button
                          onClick={() => onSelectAsset(permit.assetId)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="View Asset Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. EMAIL TEMPLATE PAGE ACTION WIDGET (Center - 3 cols)        */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-3 bg-gradient-to-br from-[#5E5CE6] via-[#5250D8] to-[#3B38B0] text-white rounded-[32px] p-6 shadow-xl shadow-[#5E5CE6]/25 flex flex-col justify-between relative overflow-hidden group">
        {/* Decorative background glow & mail elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-900/30 rounded-full blur-lg pointer-events-none" />

        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/20">
              <Mail className="w-5 h-5 text-amber-300" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SMTP Active
            </span>
          </div>

          <h3 className="text-lg font-black text-white tracking-tight leading-snug">
            Email Templates & Digests
          </h3>
          <p className="text-[11px] text-white/80 leading-relaxed font-medium mt-1">
            Automated milestone emails sent at T-30, T-14, T-7 & day of expiry to designated PROs and insurers.
          </p>

          {/* Quick Preview Pill */}
          <div className="mt-3.5 p-3 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-xs text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-white/70 font-semibold">
              <span>Next Auto Digest</span>
              <span className="text-amber-300 font-bold">Daily 08:00 AM</span>
            </div>
            <div className="text-[11px] font-bold text-white truncate">
              Subject: Compliance Digest • {criticalCount} Imminent Deadlines
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          {/* Main Action: Go to Email Templates Page */}
          <button
            onClick={() => onNavigateTab?.('email_templates')}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-[#5E5CE6] text-xs font-black shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#5E5CE6]" />
            <span>Open Email Template Studio</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto text-[#5E5CE6]" />
          </button>

          {/* Secondary Action: Trigger Immediate Expiry Digest */}
          <button
            onClick={handleBulkAlerts}
            className="w-full py-2.5 px-3 rounded-2xl bg-black/25 hover:bg-black/35 text-white/90 hover:text-white text-[11px] font-bold border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>{cronTriggeredNotice ? 'Email Digest Triggered!' : 'Trigger Expiry Digest Now'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. GAUGES & BOARD MEETING CARD (Right - 3 cols)               */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-3 flex flex-col justify-between gap-4">
        {/* Top Part: Two Circular Progress Gauges Side-by-Side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Gauge 1: Fleet Compliance */}
          <div className="bg-white rounded-[28px] p-3.5 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative w-14 h-14 my-1 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-slate-100"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-[#5E5CE6]"
                  strokeWidth="3"
                  strokeDasharray={`${vehiclePct * 0.94} 100`}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-900">{vehiclePct}%</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 mt-1">
              FLEET READINESS
            </span>
            <span className="text-xs font-black text-slate-900 leading-tight">Vehicles</span>
            <span className="text-[9px] text-slate-400 font-medium mt-1">Mulkiyas valid</span>
          </div>

          {/* Gauge 2: Commercial Licenses */}
          <div className="bg-white rounded-[28px] p-3.5 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative w-14 h-14 my-1 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-slate-100"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-[#5E5CE6]"
                  strokeWidth="3"
                  strokeDasharray={`${branchPct * 0.94} 100`}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-900">{branchPct}%</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-wider text-[#5E5CE6] mt-1">
              LICENSES
            </span>
            <span className="text-xs font-black text-slate-900 leading-tight">Branches</span>
            <button
              onClick={onOpenQuickAdd}
              className="mt-1 px-3 py-0.5 rounded-full bg-[#5E5CE6] text-white text-[9px] font-black hover:bg-[#4E4CD4] transition-colors cursor-pointer"
            >
              Check
            </button>
          </div>
        </div>

        {/* Bottom Part: Authority Inspection / Board Meeting Card */}
        <div className="bg-white rounded-[28px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-black text-slate-900">Authority Inspection</h4>
            <button className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer">
              Edit
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#5E5CE6] font-extrabold mb-1">
            <span className="w-2 h-2 rounded-full bg-[#5E5CE6]" />
            <span>Tomorrow at 10:00 AM</span>
          </div>

          <p className="text-[11px] text-slate-500 font-medium mb-3">
            Annual test with RTA Inspector, Tasjeel Al Barsha Center.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {}}
              className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all text-center cursor-pointer"
            >
              Reschedule
            </button>
            <button
              onClick={() => setMeetingConfirmed(!meetingConfirmed)}
              className={`py-2 px-2 rounded-xl text-[10px] font-black transition-all text-center cursor-pointer ${
                meetingConfirmed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#5E5CE6] hover:bg-[#4E4CD4] text-white'
              }`}
            >
              {meetingConfirmed ? 'Confirmed' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
