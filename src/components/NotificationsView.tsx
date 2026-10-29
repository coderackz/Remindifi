import React, { useState } from 'react';
import {
  Mail,
  Zap,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Calendar,
  Building,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Permit, Asset, PermitCategory, NotificationLog } from '../types';
import {
  calculateDaysRemaining,
  getPermitUrgency,
  formatAED,
} from '../utils/compliance';

interface NotificationsViewProps {
  permits: Permit[];
  assets: Asset[];
  categories: PermitCategory[];
  notificationLogs: NotificationLog[];
  onTriggerCron: () => void;
}

export function NotificationsView({
  permits,
  assets,
  categories,
  notificationLogs,
  onTriggerCron,
}: NotificationsViewProps) {
  // Cron Settings State
  const [dispatchTime, setDispatchTime] = useState('08:00 AM GST');
  const [primaryRecipients, setPrimaryRecipients] = useState('fleet.admin@remindifi.ae, pro.team@remindifi.ae');
  const [escalationCc, setEscalationCc] = useState('cfo@remindifi.ae, operations.director@remindifi.ae');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastCronRunTime, setLastCronRunTime] = useState<string | null>(null);

  const assetMap = new Map<string, Asset>(assets.map((a) => [a.id, a]));
  const categoryMap = new Map<string, PermitCategory>(categories.map((c) => [c.id, c]));

  // Calculate items grouped by urgency for the live email digest
  const criticalPermits = permits.filter((p) => getPermitUrgency(p) === 'critical' || getPermitUrgency(p) === 'expired');
  const warningPermits = permits.filter((p) => getPermitUrgency(p) === 'warning');
  const inRenewalPermits = permits.filter((p) => p.status === 'in_renewal');

  const handleRunCron = () => {
    setIsSimulating(true);
    setTimeout(() => {
      onTriggerCron();
      setLastCronRunTime(new Date().toLocaleTimeString());
      setIsSimulating(false);
    }, 700);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Email Notification Engine & Cron Digest
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Simulate automated daily compliance scanning and inspect the live morning email digest dispatched to operations.
          </p>
        </div>

        <button
          onClick={handleRunCron}
          disabled={isSimulating}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#5E5CE6] to-[#7875FA] hover:from-[#4E4CC6] hover:to-[#6360E8] text-white font-extrabold text-xs shadow-lg shadow-[#5E5CE6]/30 flex items-center gap-2 self-start md:self-auto transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning All Permits & Dispatching...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Run Daily Cron Check Now</span>
            </>
          )}
        </button>
      </div>

      {/* Top Config Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <Clock className="w-4 h-4 text-[#5E5CE6]" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Cron Dispatch Time
            </span>
          </div>
          <input
            type="text"
            value={dispatchTime}
            onChange={(e) => setDispatchTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
          />
          <p className="text-[11px] text-slate-400 mt-1.5">
            Automated serverless execution at 08:00 AM Dubai Gulf Standard Time
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Primary Recipients
            </span>
          </div>
          <input
            type="text"
            value={primaryRecipients}
            onChange={(e) => setPrimaryRecipients(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
          />
          <p className="text-[11px] text-slate-400 mt-1.5">
            Default operational recipients for daily morning compliance report
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Urgent Escalation CC (&lt;7 Days)
            </span>
          </div>
          <input
            type="text"
            value={escalationCc}
            onChange={(e) => setEscalationCc(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
          />
          <p className="text-[11px] text-slate-400 mt-1.5">
            Automatically CC executive leadership when permits reach &lt;7 days
          </p>
        </div>
      </div>

      {lastCronRunTime && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Simulated Cron Executed at {lastCronRunTime}:</strong> Evaluated {permits.length} permits against milestone lead rules. Check the Email Preview and Notification Logs below!
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Live Email Preview & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 cols: Live HTML Email Preview */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          {/* Email Client Simulated Header */}
          <div className="bg-slate-100 p-4 border-b border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400 font-mono text-[11px] ml-2">Remindifi Automated Mailer Client</span>
            </div>
            <div className="pt-2 text-slate-700">
              <span className="text-slate-400">From:</span> <strong>compliance-bot@remindifi.ae</strong>
            </div>
            <div className="text-slate-700">
              <span className="text-slate-400">To:</span> <span className="font-mono">{primaryRecipients}</span>
            </div>
            <div className="text-slate-700">
              <span className="text-slate-400">Subject:</span>{' '}
              <strong className="text-indigo-950 font-bold">
                [DAILY DIGEST] 🚨 {criticalPermits.length} Critical Compliance Deadlines Requiring Action
              </strong>
            </div>
          </div>

          {/* Email Body Template */}
          <div className="p-6 md:p-8 space-y-6 text-slate-800 bg-[#FAFAFC]">
            {/* Remindifi Brand Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5E5CE6] text-white flex items-center justify-center font-black text-lg">
                  R
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                    Remindifi Compliance
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Daily Operations Morning Brief · 2026-10-29
                  </span>
                </div>
              </div>
              <span className="text-xs bg-indigo-100 text-[#5E5CE6] font-bold px-3 py-1 rounded-full">
                08:00 AM Dispatch
              </span>
            </div>

            {/* Email Greeting & Highlights */}
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-1">
                Good morning Operations & PRO Team,
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                This is your daily automated compliance scan summary across your parent assets (Vehicles, Corporate Branches, Heavy Machinery, and Personnel).
              </p>
            </div>

            {/* 1. Critical Section (< 7 Days) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Urgent / Critical Deadlines (&lt; 7 Days)
                </h4>
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  {criticalPermits.length} Action Needed
                </span>
              </div>

              {criticalPermits.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 text-center">
                  ✅ No permits currently in critical status!
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-red-200 shadow-2xs overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-red-50/70 border-b border-red-100 text-red-900 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Parent Asset</th>
                        <th className="py-2 px-3">Permit</th>
                        <th className="py-2 px-2">Days Left</th>
                        <th className="py-2 px-3 text-right">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100">
                      {criticalPermits.map((p) => {
                        const asset = assetMap.get(p.assetId);
                        const category = categoryMap.get(p.categoryId);
                        const days = calculateDaysRemaining(p.expiryDate);
                        return (
                          <tr key={p.id} className="hover:bg-red-50/30">
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-slate-900 block">{asset?.identifier}</span>
                              <span className="text-[10px] text-slate-500">{asset?.name}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-800 block">{category?.name}</span>
                              <span className="font-mono text-[10px] text-slate-500">#{p.permitNumber}</span>
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded text-[10px]">
                                {days <= 0 ? 'EXPIRED' : `${days} DAYS`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {formatAED(p.cost)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2. Warning Section (< 30 Days) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Expiring Within 30 Days (Warning)
                </h4>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {warningPermits.length} Records
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-amber-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-50/70 border-b border-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Parent Asset</th>
                      <th className="py-2 px-3">Permit</th>
                      <th className="py-2 px-2">Deadline</th>
                      <th className="py-2 px-3 text-right">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {warningPermits.map((p) => {
                      const asset = assetMap.get(p.assetId);
                      const category = categoryMap.get(p.categoryId);
                      const days = calculateDaysRemaining(p.expiryDate);
                      return (
                        <tr key={p.id} className="hover:bg-amber-50/30">
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            {asset?.identifier}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-medium text-slate-800">{category?.name}</span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                              {days} days
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800">
                            {formatAED(p.cost)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. In-Renewal Section */}
            {inRenewalPermits.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
                <span className="font-bold text-blue-900 block mb-1">
                  🔄 In-Renewal Paperwork Under Review ({inRenewalPermits.length}):
                </span>
                <p className="text-blue-700 text-[11px]">
                  {inRenewalPermits.map((p) => `${categoryMap.get(p.categoryId)?.name} (${assetMap.get(p.assetId)?.identifier})`).join(', ')}
                </p>
              </div>
            )}

            {/* Email Footer */}
            <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
              <p>Generated by Remindifi Cloud Cron Scheduler · UAE Compliance Engine</p>
              <p className="mt-0.5">Please do not reply directly to this automated email.</p>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Notification Dispatch Logs */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-[#5E5CE6]" />
              <span>Notification Dispatch History</span>
            </h3>
            <span className="text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600 font-mono font-bold">
              {notificationLogs.length} Dispatches
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {notificationLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">
                    {log.assetIdentifier}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md uppercase">
                    {log.status}
                  </span>
                </div>

                <p className="text-slate-600 text-[11px] font-medium">
                  {log.digestSubject || `Milestone alert triggered at ${log.milestoneDays} days.`}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                  <span>To: {log.recipientEmail}</span>
                  <span>{new Date(log.sentAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
