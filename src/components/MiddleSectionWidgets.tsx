import React, { useState, useMemo } from 'react';
import {
  Bell,
  Trash2,
  Edit2,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Car,
  Building2,
  UserCheck,
  ExternalLink,
  Flame,
  FileText,
  Send,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Permit, Asset, PermitCategory, NotificationLog } from '../types';
import { calculateDaysRemaining, getPermitUrgency, formatAED } from '../utils/compliance';

interface MiddleSectionWidgetsProps {
  nearExpiryPermits: Permit[];
  allPermits?: Permit[];
  notificationLogs?: NotificationLog[];
  assetMap: Map<string, Asset>;
  categoryMap: Map<string, PermitCategory>;
  onLogRenewal: (permitId: string) => void;
  onEditPermit: (permit: Permit) => void;
  onOpenQuickAdd: () => void;
  onSelectAsset: (assetId: string) => void;
  onNavigateTab?: (tab: 'dashboard' | 'all_reminders' | 'calendar' | 'categories' | 'notifications' | 'email_templates' | 'settings') => void;
  onViewCalendar?: () => void;
}

export function MiddleSectionWidgets({
  nearExpiryPermits,
  allPermits = [],
  notificationLogs = [],
  assetMap,
  categoryMap,
  onLogRenewal,
  onEditPermit,
  onOpenQuickAdd,
  onSelectAsset,
  onNavigateTab,
  onViewCalendar,
}: MiddleSectionWidgetsProps) {
  // Use all permits if provided, else fall back to nearExpiryPermits
  const permitsPool = allPermits.length > 0 ? allPermits : nearExpiryPermits;

  // ---------------------------------------------------------------------------
  // 1. NOTIFICATIONS STATE & LOGIC
  // ---------------------------------------------------------------------------
  const [notifFilter, setNotifFilter] = useState<'all' | 'critical' | 'logs'>('all');
  const [dismissedNotifIds, setDismissedNotifIds] = useState<Set<string>>(new Set());

  // Critical / near-expiry permits sorted by urgency
  const criticalPermits = useMemo(() => {
    return [...permitsPool]
      .filter((p) => {
        const days = calculateDaysRemaining(p.expiryDate);
        return days <= 14 || p.status === 'in_renewal' || p.status === 'expired';
      })
      .sort((a, b) => calculateDaysRemaining(a.expiryDate) - calculateDaysRemaining(b.expiryDate));
  }, [permitsPool]);

  // Combine dynamic permit alerts and day-to-day notification logs
  interface DisplayNotification {
    id: string;
    type: 'critical_permit' | 'warning_permit' | 'in_renewal' | 'system_log';
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
    dateLabel: string;
    permitId?: string;
    assetId?: string;
    amount?: number;
    rawDate: string;
  }

  const allNotifications = useMemo<DisplayNotification[]>(() => {
    const list: DisplayNotification[] = [];

    // Critical and imminent permits
    for (const p of criticalPermits) {
      const asset = assetMap.get(p.assetId);
      const cat = categoryMap.get(p.categoryId);
      const days = calculateDaysRemaining(p.expiryDate);

      let type: DisplayNotification['type'] = 'critical_permit';
      let badge = `${days}d left`;
      let badgeColor = 'bg-red-100 text-red-700 border-red-200';

      if (p.status === 'in_renewal') {
        type = 'in_renewal';
        badge = 'In Renewal';
        badgeColor = 'bg-blue-100 text-blue-700 border-blue-200';
      } else if (days <= 0) {
        badge = 'Expired!';
        badgeColor = 'bg-red-500 text-white border-red-600 animate-pulse';
      } else if (days <= 7) {
        badge = `Urgent: ${days}d`;
        badgeColor = 'bg-red-100 text-red-700 border-red-200';
      } else {
        type = 'warning_permit';
        badge = `Due in ${days}d`;
        badgeColor = 'bg-amber-100 text-amber-700 border-amber-200';
      }

      list.push({
        id: `permit-${p.id}`,
        type,
        title: `${cat?.name || 'Compliance Permit'} • ${asset?.identifier || 'Fleet Unit'}`,
        description: p.notes || `Authority: ${cat?.issuingAuthority || 'Govt Authority'} (Ref: ${p.permitNumber})`,
        badge,
        badgeColor,
        dateLabel: `Due: ${p.expiryDate}`,
        permitId: p.id,
        assetId: p.assetId,
        amount: p.cost,
        rawDate: p.expiryDate,
      });
    }

    // Day-to-day notification logs
    for (const log of notificationLogs) {
      list.push({
        id: `log-${log.id}`,
        type: 'system_log',
        title: log.digestSubject || `Compliance Digest: ${log.assetIdentifier} (${log.milestoneDays}d milestone)`,
        description: `Delivered to ${log.recipientEmail} via SMTP digest engine`,
        badge: `${log.milestoneDays}d Milestone`,
        badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        dateLabel: new Date(log.sentAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
        }),
        permitId: log.permitId,
        rawDate: log.sentAt,
      });
    }

    return list;
  }, [criticalPermits, notificationLogs, assetMap, categoryMap]);

  // Filter out dismissed notifications and apply active tab filter
  const visibleNotifications = useMemo(() => {
    return allNotifications
      .filter((n) => !dismissedNotifIds.has(n.id))
      .filter((n) => {
        if (notifFilter === 'critical') return n.type === 'critical_permit' || n.badge.includes('Expired');
        if (notifFilter === 'logs') return n.type === 'system_log';
        return true;
      });
  }, [allNotifications, dismissedNotifIds, notifFilter]);

  const handleDismissNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => new Set(prev).add(id));
  };

  const handleClearAllNotifs = () => {
    setDismissedNotifIds(new Set(allNotifications.map((n) => n.id)));
  };

  // ---------------------------------------------------------------------------
  // 2. ASSIGNMENTS (LATEST IN-RENEWAL TASKS WITH REAL DATA)
  // ---------------------------------------------------------------------------
  const inRenewalAssignments = useMemo(() => {
    // Collect permits explicitly in renewal or near critical deadline with assigned PRO
    const inRenewal = permitsPool.filter((p) => p.status === 'in_renewal');
    const urgentTasks = permitsPool
      .filter((p) => p.status === 'active' && calculateDaysRemaining(p.expiryDate) <= 14)
      .slice(0, 3);

    const merged = [...inRenewal, ...urgentTasks];
    // Remove duplicates
    const uniqueMap = new Map<string, Permit>();
    for (const p of merged) {
      uniqueMap.set(p.id, p);
    }
    return Array.from(uniqueMap.values());
  }, [permitsPool]);

  // Carousel / selection index for assignments
  const [activeAssignmentIdx, setActiveAssignmentIdx] = useState<number>(0);
  const currentAssignment = inRenewalAssignments[activeAssignmentIdx] || inRenewalAssignments[0];

  const currentAssignmentAsset = currentAssignment ? assetMap.get(currentAssignment.assetId) : null;
  const currentAssignmentCat = currentAssignment ? categoryMap.get(currentAssignment.categoryId) : null;
  const currentAssignmentDays = currentAssignment ? calculateDaysRemaining(currentAssignment.expiryDate) : 0;

  // ---------------------------------------------------------------------------
  // 3. ACTIVE CALENDAR WITH REAL DATA
  // ---------------------------------------------------------------------------
  // Find reference base date from permits or today
  const baseDate = useMemo(() => {
    if (permitsPool.length > 0) {
      // Find nearest active permit
      const sorted = [...permitsPool].sort((a, b) => {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
      const firstValid = sorted.find((p) => calculateDaysRemaining(p.expiryDate) >= 0) || sorted[0];
      if (firstValid?.expiryDate) {
        const d = new Date(firstValid.expiryDate);
        if (!isNaN(d.getTime())) {
          return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
      }
    }
    return new Date();
  }, [permitsPool]);

  // Current calendar view date (anchor date for the 7-day strip)
  const [calendarAnchorDate, setCalendarAnchorDate] = useState<Date>(() => {
    // Start at baseDate
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  });

  // Selected date key formatted as YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  };

  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => formatYMD(baseDate));

  // Build the 7-day strip centered or starting around calendarAnchorDate
  const weekDays = useMemo(() => {
    const days: { dateObj: Date; dayName: string; dayNum: number; dateKey: string; isToday: boolean }[] = [];
    const todayYMD = formatYMD(new Date());

    // Show 7 consecutive days starting from 2 days before the anchor
    const start = new Date(calendarAnchorDate);
    start.setDate(start.getDate() - 2);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = formatYMD(d);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.push({
        dateObj: d,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        dateKey: key,
        isToday: key === todayYMD,
      });
    }
    return days;
  }, [calendarAnchorDate]);

  // Navigation handlers for calendar
  const handlePrevDays = () => {
    setCalendarAnchorDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const handleNextDays = () => {
    setCalendarAnchorDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  // Month & Year display label
  const monthYearLabel = useMemo(() => {
    return calendarAnchorDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [calendarAnchorDate]);

  // Map permits expiring on each date
  const permitsByDateMap = useMemo(() => {
    const map = new Map<string, Permit[]>();
    for (const p of permitsPool) {
      if (!p.expiryDate) continue;
      const key = p.expiryDate.split('T')[0];
      const list = map.get(key) || [];
      list.push(p);
      map.set(key, list);
    }
    return map;
  }, [permitsPool]);

  // Permits on currently selected date
  const selectedDatePermits = permitsByDateMap.get(selectedDateKey) || [];

  // Fallback upcoming permits if none on selected exact date
  const upcomingEventsFallback = useMemo(() => {
    return [...permitsPool]
      .filter((p) => {
        const days = calculateDaysRemaining(p.expiryDate);
        return days >= 0;
      })
      .sort((a, b) => calculateDaysRemaining(a.expiryDate) - calculateDaysRemaining(b.expiryDate))
      .slice(0, 2);
  }, [permitsPool]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ------------------------------------------------------------- */}
      {/* 1. NOTIFICATIONS CARD (Left)                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#5E5CE6]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>Notifications</span>
                  {criticalPermits.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600 animate-pulse">
                      {criticalPermits.length} Critical
                    </span>
                  )}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {visibleNotifications.length > 0 && (
                <button
                  onClick={handleClearAllNotifs}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                  title="Clear all visible notifications"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sub-filter pills */}
          <div className="flex items-center gap-1.5 mb-3 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setNotifFilter('all')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                notifFilter === 'all'
                  ? 'bg-white text-[#5E5CE6] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({allNotifications.length})
            </button>
            <button
              onClick={() => setNotifFilter('critical')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                notifFilter === 'critical'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Critical ({criticalPermits.length})
            </button>
            <button
              onClick={() => setNotifFilter('logs')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                notifFilter === 'logs'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Logs ({notificationLogs.length})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {visibleNotifications.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl text-center flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-700">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No notifications matching your filter.</p>
              </div>
            ) : (
              visibleNotifications.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.permitId) onLogRenewal(item.permitId);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative ${
                    item.type === 'critical_permit'
                      ? 'bg-white shadow-md shadow-red-500/5 border-red-200/80 hover:border-red-400'
                      : item.type === 'in_renewal'
                      ? 'bg-white shadow-md shadow-blue-500/5 border-blue-200/80 hover:border-blue-400'
                      : 'bg-white border-slate-100 hover:border-[#5E5CE6]/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.type === 'critical_permit'
                            ? 'bg-red-500 animate-pulse'
                            : item.type === 'in_renewal'
                            ? 'bg-blue-500'
                            : 'bg-[#5E5CE6]'
                        }`}
                      />
                      <span className="text-xs font-black text-slate-900 group-hover:text-[#5E5CE6] transition-colors line-clamp-1">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                      <button
                        onClick={(e) => handleDismissNotif(item.id, e)}
                        className="text-slate-300 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mb-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.dateLabel}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.amount && (
                        <span className="font-bold text-[#5E5CE6] text-xs">
                          {formatAED(item.amount)}
                        </span>
                      )}
                      {item.permitId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLogRenewal(item.permitId!);
                          }}
                          className="px-2 py-0.5 bg-[#5E5CE6]/10 hover:bg-[#5E5CE6] text-[#5E5CE6] hover:text-white rounded-lg text-[10px] font-black transition-colors"
                        >
                          Renew
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-medium">
            {visibleNotifications.length} alerts pending
          </span>
          <button
            onClick={() => onNavigateTab?.('notifications')}
            className="text-[11px] font-bold text-[#5E5CE6] hover:text-[#4E4CC6] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. ASSIGNMENTS / ACTIVE RENEWALS CARD (Center)                */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[460px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Assignments</h2>
                <span className="text-[10px] text-slate-400 font-bold">
                  {inRenewalAssignments.length} In-Renewal Tasks
                </span>
              </div>
            </div>

            {/* Task Switcher Dots / Pagination */}
            {inRenewalAssignments.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                {inRenewalAssignments.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveAssignmentIdx(i)}
                    className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                      activeAssignmentIdx === i
                        ? 'bg-[#5E5CE6] text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentAssignment ? (
            <div className="space-y-3.5">
              {/* Tags Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                  {currentAssignmentCat?.name || 'Permit'}
                </span>
                <span
                  onClick={() => onSelectAsset(currentAssignment.assetId)}
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold hover:bg-[#5E5CE6]/10 hover:text-[#5E5CE6] transition-colors cursor-pointer"
                  title="View Asset Details"
                >
                  {currentAssignmentAsset?.identifier || 'Fleet Unit'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ml-auto ${
                    currentAssignmentDays <= 7
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {currentAssignmentDays <= 7 ? 'Critical' : 'Priority'}
                </span>
              </div>

              {/* Title & Authority */}
              <div>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  Renew {currentAssignmentCat?.name} for {currentAssignmentAsset?.identifier}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Authority: {currentAssignmentCat?.issuingAuthority || 'Govt Portal'} • Ref:{' '}
                  {currentAssignment.permitNumber}
                </p>
              </div>

              {/* Status Badge & Assignee Avatar Chip */}
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                    Processing Stage
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 text-xs font-black border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {currentAssignment.status === 'in_renewal'
                      ? 'In Renewal'
                      : `Expiring in ${currentAssignmentDays}d`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                    Assigned PRO
                  </span>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-black text-slate-800">
                      {currentAssignment.assignedToEmail
                        ? currentAssignment.assignedToEmail.split('@')[0].replace('.', ' ')
                        : 'Ahmad Al-Mansoor'}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#8E8DFF] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs">
                      {currentAssignment.assignedToEmail
                        ? currentAssignment.assignedToEmail[0].toUpperCase()
                        : 'A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Details Box */}
              <div className="p-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-xs">
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span className="font-semibold text-slate-500">Government Fee</span>
                  <span className="font-black text-slate-900">{formatAED(currentAssignment.cost)}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
                  {currentAssignment.notes || 'Documentation collected. Awaiting submission to government portal.'}
                </p>
              </div>

              {/* Quick Action Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onLogRenewal(currentAssignment.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-bold transition-all shadow-sm shadow-[#5E5CE6]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Update & Complete Renewal</span>
                </button>
                <button
                  onClick={() => onSelectAsset(currentAssignment.assetId)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="View Asset Details"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No active renewals pending.</p>
            </div>
          )}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ACTIVE CALENDAR & TIMELINE (Right)                          */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[460px]">
        <div>
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                {monthYearLabel}
              </h2>
              <span className="text-[10px] text-slate-400 font-bold block">
                Active Compliance Calendar
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevDays}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setCalendarAnchorDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
                  setSelectedDateKey(formatYMD(now));
                }}
                className="px-2 py-1 text-[10px] font-black rounded-lg hover:bg-slate-100 text-[#5E5CE6] cursor-pointer"
                title="Jump to Today"
              >
                Today
              </button>
              <button
                onClick={handleNextDays}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Week Days Strip with Active Real Data Indicators */}
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {weekDays.map((d) => {
              const isSelected = selectedDateKey === d.dateKey;
              const datePermits = permitsByDateMap.get(d.dateKey) || [];
              const hasEvents = datePermits.length > 0;
              const hasCritical = datePermits.some(
                (p) => calculateDaysRemaining(p.expiryDate) <= 7 || p.status === 'expired'
              );

              return (
                <button
                  key={d.dateKey}
                  onClick={() => setSelectedDateKey(d.dateKey)}
                  className={`flex flex-col items-center py-2 px-1 rounded-2xl transition-all relative cursor-pointer ${
                    isSelected
                      ? 'bg-[#5E5CE6] text-white shadow-md shadow-[#5E5CE6]/30 font-bold'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold ${
                      isSelected ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {d.dayName}
                  </span>
                  <span className="text-xs font-black mt-0.5">{d.dayNum}</span>

                  {/* Indicator Dot */}
                  {hasEvents && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isSelected
                          ? 'bg-white'
                          : hasCritical
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-[#5E5CE6]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Timeline Section Header */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
            <span>Schedule for {selectedDateKey}</span>
            {selectedDatePermits.length > 0 && (
              <span className="text-[10px] font-extrabold text-[#5E5CE6] bg-[#5E5CE6]/10 px-2 py-0.5 rounded-md">
                {selectedDatePermits.length} Events
              </span>
            )}
          </div>

          {/* Timeline Items with Real Data */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {selectedDatePermits.length > 0 ? (
              selectedDatePermits.map((permit, idx) => {
                const asset = assetMap.get(permit.assetId);
                const category = categoryMap.get(permit.categoryId);
                const days = calculateDaysRemaining(permit.expiryDate);

                return (
                  <div key={permit.id} className="group">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      <Clock className="w-3 h-3 text-[#5E5CE6]" />
                      <span>
                        {idx === 0 ? '09:00 - 10:30 AM' : idx === 1 ? '01:00 - 02:30 PM' : '04:00 - 05:00 PM'}
                      </span>
                      <span className="flex-1 border-b border-dashed border-slate-200" />
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            category?.name.toLowerCase().includes('insurance')
                              ? 'bg-emerald-50 text-emerald-600'
                              : category?.name.toLowerCase().includes('civil')
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-purple-50 text-[#5E5CE6]'
                          }`}
                        >
                          {category?.name.toLowerCase().includes('insurance') ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : category?.name.toLowerCase().includes('civil') ? (
                            <Building2 className="w-4 h-4" />
                          ) : (
                            <Car className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-tight">
                            {category?.name || 'Compliance Renewal'}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {asset?.identifier} • {formatAED(permit.cost)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onLogRenewal(permit.id)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#5E5CE6] hover:text-white text-slate-700 text-[10px] font-bold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        Renew
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div>
                <div className="p-3 bg-slate-50 rounded-2xl text-center mb-3">
                  <p className="text-xs font-bold text-slate-600">No expirations on {selectedDateKey}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Upcoming in this compliance cycle:</p>
                </div>

                {upcomingEventsFallback.map((permit, idx) => {
                  const asset = assetMap.get(permit.assetId);
                  const category = categoryMap.get(permit.categoryId);
                  const days = calculateDaysRemaining(permit.expiryDate);

                  return (
                    <div key={permit.id} className="mb-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        <span>Due {permit.expiryDate} ({days}d)</span>
                        <span className="flex-1 border-b border-dashed border-slate-200" />
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-slate-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#5E5CE6] flex items-center justify-center shrink-0">
                            <CalendarIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-black text-slate-900 leading-tight">
                              {category?.name}
                            </h4>
                            <p className="text-[9px] text-slate-400">
                              {asset?.identifier} • {formatAED(permit.cost)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onLogRenewal(permit.id)}
                          className="px-2 py-1 rounded-lg bg-[#5E5CE6]/10 hover:bg-[#5E5CE6] text-[#5E5CE6] hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
          <span className="text-[11px] text-slate-400 font-medium">
            Timeline syncs with fleet milestones
          </span>
          <button
            onClick={onViewCalendar}
            className="text-[11px] font-bold text-[#5E5CE6] hover:text-[#4E4CC6] flex items-center gap-1 cursor-pointer"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
