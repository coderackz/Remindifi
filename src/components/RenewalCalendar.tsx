import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Coins,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Permit, Asset, PermitCategory, Role } from '../types';
import { calculateDaysRemaining, getPermitUrgency, formatAED } from '../utils/compliance';

interface RenewalCalendarProps {
  permits: Permit[];
  assets: Asset[];
  categories: PermitCategory[];
  role: Role;
  onOpenAssetDrawer: (assetId: string) => void;
  onOpenLogRenewal: (permitId: string) => void;
  onOpenDocViewer: (permit: Permit) => void;
}

export function RenewalCalendar({
  permits,
  assets,
  categories,
  role,
  onOpenAssetDrawer,
  onOpenLogRenewal,
  onOpenDocViewer,
}: RenewalCalendarProps) {
  // Map lookups for performance
  const assetMap = useMemo(() => new Map<string, Asset>(assets.map((a) => [a.id, a])), [assets]);
  const categoryMap = useMemo(() => new Map<string, PermitCategory>(categories.map((c) => [c.id, c])), [categories]);

  // Determine initial month based on earliest near-expiry permit or current date
  const initialDate = useMemo(() => {
    if (permits.length > 0) {
      // Find earliest future or recent expiry date
      const sorted = [...permits].sort((a, b) => {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
      const firstValid = sorted.find((p) => calculateDaysRemaining(p.expiryDate) >= 0) || sorted[0];
      if (firstValid?.expiryDate) {
        const d = new Date(firstValid.expiryDate);
        if (!isNaN(d.getTime())) {
          return new Date(d.getFullYear(), d.getMonth(), 1);
        }
      }
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [permits]);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialDate);

  // Group permits by YYYY-MM-DD
  const permitsByDate = useMemo(() => {
    const map = new Map<string, Permit[]>();
    for (const permit of permits) {
      if (!permit.expiryDate) continue;
      // Normalise to YYYY-MM-DD
      const dateKey = permit.expiryDate.split('T')[0];
      const list = map.get(dateKey) || [];
      list.push(permit);
      map.set(dateKey, list);
    }
    return map;
  }, [permits]);

  // Initial selected date (first date in the active month that has events, or today)
  const initialSelectedDateKey = useMemo(() => {
    const yr = currentMonthDate.getFullYear();
    const mo = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${yr}-${mo}`;
    for (const [dateKey] of permitsByDate.entries()) {
      if (dateKey.startsWith(prefix)) {
        return dateKey;
      }
    }
    // Fallback to today formatted
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [currentMonthDate, permitsByDate]);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(initialSelectedDateKey);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDateKey(todayKey);
  };

  // Build calendar matrix for currentMonthDate
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth(); // 0-indexed

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    // Monday as 0, Sunday as 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday is 6

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      permits: Permit[];
    }> = [];

    // Today string
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevMo = month === 0 ? 12 : month;
      const prevYr = month === 0 ? year - 1 : year;
      const dateStr = `${prevYr}-${String(prevMo).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        permits: permitsByDate.get(dateStr) || [],
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        permits: permitsByDate.get(dateStr) || [],
      });
    }

    // Next month filler days to complete grid to 35 or 42
    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    for (let d = 1; d <= remainingSlots; d++) {
      const nextMo = month === 11 ? 1 : month + 2;
      const nextYr = month === 11 ? year + 1 : year;
      const dateStr = `${nextYr}-${String(nextMo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        permits: permitsByDate.get(dateStr) || [],
      });
    }

    return days;
  }, [currentMonthDate, permitsByDate]);

  // Selected date permits
  const selectedDatePermits = useMemo(() => {
    return permitsByDate.get(selectedDateKey) || [];
  }, [selectedDateKey, permitsByDate]);

  // Current month summary stats
  const monthStats = useMemo(() => {
    const yr = currentMonthDate.getFullYear();
    const mo = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${yr}-${mo}`;
    let count = 0;
    let critical = 0;
    let warning = 0;
    let cost = 0;

    for (const [key, list] of permitsByDate.entries()) {
      if (key.startsWith(prefix)) {
        count += list.length;
        for (const p of list) {
          cost += p.cost || 0;
          const urgency = getPermitUrgency(p);
          if (urgency === 'critical' || urgency === 'expired') critical++;
          else if (urgency === 'warning') warning++;
        }
      }
    }
    return { count, critical, warning, cost };
  }, [currentMonthDate, permitsByDate]);

  // Upcoming top 4 events in the whole fleet (for the quick timeline preview)
  const upcomingEvents = useMemo(() => {
    const sorted = [...permits].sort((a, b) => {
      return calculateDaysRemaining(a.expiryDate) - calculateDaysRemaining(b.expiryDate);
    });
    return sorted.slice(0, 4);
  }, [permits]);

  // Format month title
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Format readable selected date
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateKey) return '';
    const parts = selectedDateKey.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return selectedDateKey;
  }, [selectedDateKey]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xs space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5E5CE6]/10 text-[#5E5CE6] flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Compliance Renewal Calendar</h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#5E5CE6]/10 text-[#5E5CE6]">
                Interactive
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Track permit deadlines, schedule PRO renewals, and monitor renewal milestones
            </p>
          </div>
        </div>

        {/* Month Navigation & Today Jump */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleGoToday}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-black text-slate-800 min-w-32 text-center select-none">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            {monthStats.count}
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Expiries in {currentMonthDate.toLocaleString('default', { month: 'short' })}</span>
            <span className="text-xs font-black text-slate-800">{monthStats.count} Permits</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
            {monthStats.critical}
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Urgent Action</span>
            <span className="text-xs font-black text-red-600">{monthStats.critical} High Priority</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
            {monthStats.warning}
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Due Soon</span>
            <span className="text-xs font-black text-amber-600">{monthStats.warning} Approaching</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Renewal Budget</span>
            <span className="text-xs font-black text-slate-800">{formatAED(monthStats.cost)}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (7 cols), Events Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid Container (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          {/* Weekday Labels (Mon - Sun) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-[11px] font-bold text-slate-400 py-1 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day) => {
              const isSelected = day.dateStr === selectedDateKey;
              const hasEvents = day.permits.length > 0;

              // Check highest urgency in the day
              let highestUrgency = 'healthy';
              if (hasEvents) {
                if (day.permits.some((p) => getPermitUrgency(p) === 'critical' || getPermitUrgency(p) === 'expired')) {
                  highestUrgency = 'critical';
                } else if (day.permits.some((p) => getPermitUrgency(p) === 'warning')) {
                  highestUrgency = 'warning';
                }
              }

              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDateKey(day.dateStr)}
                  className={`min-h-16 md:min-h-18 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-[#5E5CE6] ring-2 ring-[#5E5CE6]/30 bg-[#5E5CE6]/5 shadow-xs'
                      : day.isCurrentMonth
                      ? 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      : 'border-transparent text-slate-300 hover:text-slate-400 hover:bg-slate-50/40 bg-slate-50/20'
                  }`}
                >
                  {/* Day Number & Today indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-black transition-colors ${
                        day.isToday
                          ? 'w-5 h-5 rounded-full bg-[#5E5CE6] text-white flex items-center justify-center text-[11px]'
                          : isSelected
                          ? 'text-[#5E5CE6]'
                          : day.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    {hasEvents && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                          highestUrgency === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : highestUrgency === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {day.permits.length}
                      </span>
                    )}
                  </div>

                  {/* Visual Event Dots or Title snippet */}
                  <div className="w-full mt-1 space-y-0.5">
                    {hasEvents && (
                      <div className="flex flex-col gap-0.5">
                        {day.permits.slice(0, 1).map((p) => {
                          const cat = categoryMap.get(p.categoryId);
                          return (
                            <div
                              key={p.id}
                              className={`text-[9px] font-bold truncate px-1 py-0.5 rounded-md ${
                                highestUrgency === 'critical'
                                  ? 'bg-red-500/10 text-red-700'
                                  : highestUrgency === 'warning'
                                  ? 'bg-amber-500/10 text-amber-800'
                                  : 'bg-[#5E5CE6]/10 text-[#5E5CE6]'
                              }`}
                              title={`${cat?.name}: ${p.permitNumber}`}
                            >
                              {cat?.name.split(' ')[0]}
                            </div>
                          );
                        })}
                        {day.permits.length > 1 && (
                          <span className="text-[8px] font-bold text-slate-400 pl-0.5 block">
                            +{day.permits.length - 1} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mt-4 pt-3 border-t border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Urgent (&lt;7d)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Due Soon (8-30d)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy (&gt;30d)
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Click any date to inspect details</span>
          </div>
        </div>

        {/* Selected Date Inspector Panel (5 cols) - Styled like the reference card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5E5CE6]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Events on {selectedDateFormatted}
                </h4>
              </div>
              <span className="text-xs font-extrabold text-[#5E5CE6] bg-[#5E5CE6]/10 px-2 py-0.5 rounded-full">
                {selectedDatePermits.length} {selectedDatePermits.length === 1 ? 'Permit' : 'Permits'}
              </span>
            </div>

            {selectedDatePermits.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-slate-700">No Expiries on This Date</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select a highlighted date with a colored badge to inspect expiring permits.
                </p>
                {upcomingEvents.length > 0 && (
                  <button
                    onClick={() => {
                      if (upcomingEvents[0]?.expiryDate) {
                        setSelectedDateKey(upcomingEvents[0].expiryDate.split('T')[0]);
                        const d = new Date(upcomingEvents[0].expiryDate);
                        setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
                      }
                    }}
                    className="mt-3 text-xs font-black text-[#5E5CE6] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Jump to Next Deadline ({upcomingEvents[0]?.expiryDate.split('T')[0]})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDatePermits.map((permit) => {
                  const asset = assetMap.get(permit.assetId);
                  const category = categoryMap.get(permit.categoryId);
                  const daysRemaining = calculateDaysRemaining(permit.expiryDate);
                  const urgency = getPermitUrgency(permit);

                  return (
                    <div
                      key={permit.id}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:border-[#5E5CE6]/40 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-900">{category?.name}</span>
                            {urgency === 'critical' && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                Urgent ({daysRemaining}d)
                              </span>
                            )}
                            {urgency === 'warning' && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                Due Soon ({daysRemaining}d)
                              </span>
                            )}
                            {urgency === 'in_renewal' && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                In Renewal
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {category?.issuingAuthority} &bull; #{permit.permitNumber}
                          </span>
                        </div>

                        <span className="text-xs font-black text-slate-800 shrink-0">
                          {formatAED(permit.cost)}
                        </span>
                      </div>

                      {/* Bound Asset Details */}
                      {asset && (
                        <div
                          onClick={() => onOpenAssetDrawer(asset.id)}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer group"
                          title="Click to view full asset compliance ledger"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-800 group-hover:text-[#5E5CE6]">
                              {asset.identifier}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-36">
                              {asset.name}
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#5E5CE6]" />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {role !== 'viewer' && (
                          <button
                            onClick={() => onOpenLogRenewal(permit.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Log Renewal</span>
                          </button>
                        )}
                        {permit.fileName && (
                          <button
                            onClick={() => onOpenDocViewer(permit)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            View PDF
                          </button>
                        )}
                        {asset && (
                          <button
                            onClick={() => onOpenAssetDrawer(asset.id)}
                            className="text-[11px] font-bold text-[#5E5CE6] hover:underline ml-auto cursor-pointer"
                          >
                            Asset Details &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Schedule Mini-Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Next Upcoming Deadlines</span>
            </h4>
            <div className="space-y-2">
              {upcomingEvents.map((p) => {
                const asset = assetMap.get(p.assetId);
                const cat = categoryMap.get(p.categoryId);
                const days = calculateDaysRemaining(p.expiryDate);
                const urgency = getPermitUrgency(p);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (p.expiryDate) {
                        setSelectedDateKey(p.expiryDate.split('T')[0]);
                        const d = new Date(p.expiryDate);
                        setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
                      }
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          urgency === 'critical' || urgency === 'expired'
                            ? 'bg-red-500'
                            : urgency === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-slate-800">{cat?.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {asset?.identifier} &bull; {p.expiryDate}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        urgency === 'critical' || urgency === 'expired'
                          ? 'bg-red-100 text-red-700'
                          : urgency === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {days < 0 ? 'Expired' : `${days} days`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
