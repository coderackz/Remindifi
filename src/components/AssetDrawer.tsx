import React from 'react';
import {
  X,
  Plus,
  AlertTriangle,
  FileCheck2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Building2,
  History,
  ShieldCheck,
  Coins,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Asset, Permit, PermitCategory, AssetGroup, RenewalHistory, Role } from '../types';
import {
  calculateDaysRemaining,
  getPermitUrgency,
  getMilestoneStatuses,
  detectAssetDependencies,
  formatAED,
} from '../utils/compliance';
import { DynamicIcon } from './IconHelper';

interface AssetDrawerProps {
  assetId: string | null;
  assets: Asset[];
  permits: Permit[];
  categories: PermitCategory[];
  assetGroups: AssetGroup[];
  renewalHistory: RenewalHistory[];
  role: Role;
  onClose: () => void;
  onOpenAttachPermit: (assetId: string) => void;
  onOpenLogRenewal: (permitId: string) => void;
  onMarkInRenewal: (permitId: string) => void;
  onOpenDocViewer: (permit: Permit) => void;
}

export function AssetDrawer({
  assetId,
  assets,
  permits,
  categories,
  assetGroups,
  renewalHistory,
  role,
  onClose,
  onOpenAttachPermit,
  onOpenLogRenewal,
  onMarkInRenewal,
  onOpenDocViewer,
}: AssetDrawerProps) {
  if (!assetId) return null;

  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return null;

  const assetGroup = assetGroups.find((g) => g.id === asset.assetGroupId);
  const boundPermits = permits.filter((p) => p.assetId === asset.id);
  const totalSpend = boundPermits.reduce((acc, p) => acc + (p.cost || 0), 0);
  const dependencyAlert = detectAssetDependencies(asset, boundPermits, categories);

  const categoryMap = new Map<string, PermitCategory>(categories.map((c) => [c.id, c]));
  const boundPermitIds = new Set(boundPermits.map((p) => p.id));
  const assetHistory = renewalHistory.filter((h) => boundPermitIds.has(h.permitId));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-[#1E1B4B] to-[#2B2763] text-white flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20 shrink-0">
              <DynamicIcon name={assetGroup?.icon || 'Truck'} className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xl font-extrabold tracking-tight">
                  {asset.identifier}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/15 text-white border border-white/20">
                  {assetGroup?.name}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  asset.status === 'active' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300'
                }`}>
                  {asset.status}
                </span>
              </div>
              <h2 className="text-sm font-medium text-slate-200">
                {asset.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Top Quick Stats & Cost */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Total Annual Spend
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {formatAED(totalSpend)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Bound Permits
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {boundPermits.length} Records
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Compliance Health
              </span>
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100% Tracked
              </span>
            </div>
          </div>

          {/* Asset Metadata Grid */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Asset Specifications & Registration Tags
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.entries(asset.metadata || {}).map(([key, val]) => (
                <div key={key} className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-medium block">{key}</span>
                  <span className="font-mono font-semibold text-slate-800">{val}</span>
                </div>
              ))}
              {asset.location && (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs col-span-2">
                  <span className="text-[10px] text-slate-400 font-medium block">Stationed Location</span>
                  <span className="text-slate-800 font-medium">{asset.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Smart Dependency Banner */}
          {dependencyAlert && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              dependencyAlert.type === 'critical'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                dependencyAlert.type === 'critical' ? 'text-red-600' : 'text-amber-600'
              }`} />
              <div>
                <h5 className="font-bold text-sm mb-1">{dependencyAlert.title}</h5>
                <p className="text-xs leading-relaxed">{dependencyAlert.message}</p>
              </div>
            </div>
          )}

          {/* Permits Header with + Attach Permit */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Bound Compliance Permits ({boundPermits.length})
              </h3>
              <p className="text-xs text-slate-500">
                Child licenses and permits linked to parent entity {asset.identifier}
              </p>
            </div>

            {role !== 'viewer' && (
              <button
                onClick={() => onOpenAttachPermit(asset.id)}
                className="px-3.5 py-1.5 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Attach Permit</span>
              </button>
            )}
          </div>

          {/* Permits Detailed Cards */}
          <div className="space-y-3">
            {boundPermits.map((permit) => {
              const category = categoryMap.get(permit.categoryId);
              const daysRemaining = calculateDaysRemaining(permit.expiryDate);
              const urgency = getPermitUrgency(permit);
              const milestones = getMilestoneStatuses(permit.leadDays || [60, 30, 14, 7, 1], daysRemaining);

              return (
                <div
                  key={permit.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: category?.color || '#5E5CE6' }}
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {category?.name || 'Compliance Permit'}
                        </h4>
                        <span className="font-mono text-xs text-slate-500">
                          #{permit.permitNumber} · {category?.issuingAuthority}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {formatAED(permit.cost)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">annual fee</span>
                    </div>
                  </div>

                  {/* Dates & Urgency Countdown */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Valid Until:</span>
                      <span className="font-mono font-bold text-slate-800">{permit.expiryDate}</span>
                    </div>

                    <div>
                      {urgency === 'in_renewal' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Renewal (Paperwork Submitted)
                        </span>
                      ) : urgency === 'critical' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-red-100 text-red-800">
                          <AlertTriangle className="w-3.5 h-3.5" /> Urgent ({daysRemaining} days remaining)
                        </span>
                      ) : urgency === 'warning' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" /> Expiring Soon ({daysRemaining} days)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Compliant ({daysRemaining} days)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Milestones Pills */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Email Trigger Milestones Schedule
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {milestones.map((m) => (
                        <span
                          key={m.days}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            m.triggered
                              ? 'bg-slate-800 text-white font-bold shadow-2xs'
                              : 'bg-white text-slate-400 border border-slate-200'
                          }`}
                        >
                          {m.days}d {m.triggered ? '✓ Sent' : '○ Pending'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-500">
                      Assigned: <strong className="text-slate-700 font-mono">{permit.assignedToEmail}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {permit.fileName && (
                        <button
                          onClick={() => onOpenDocViewer(permit)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Doc</span>
                        </button>
                      )}

                      {role !== 'viewer' && (
                        <>
                          {permit.status !== 'in_renewal' && (
                            <button
                              onClick={() => onMarkInRenewal(permit.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Mark In-Renewal</span>
                            </button>
                          )}

                          <button
                            onClick={() => onOpenLogRenewal(permit.id)}
                            className="px-3 py-1 rounded-lg bg-[#1E1B4B] hover:bg-[#2F2B66] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Log Renewal</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Past Renewal Audit Trail Timeline */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-slate-500" />
              <h4 className="font-extrabold text-slate-900 text-sm">
                Past Renewal Audit Trail & Compliance Archive
              </h4>
            </div>

            {assetHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                No archived renewals logged yet. Log a renewal above to populate the audit timeline.
              </p>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {assetHistory.map((hist) => (
                  <div key={hist.id} className="relative pl-8 text-xs">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#5E5CE6] ring-4 ring-white" />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">
                          Renewed on {hist.renewedOnDate}
                        </span>
                        <span className="font-extrabold text-emerald-700">
                          {formatAED(hist.cost)}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-1">
                        Previous Expiry: <span className="font-mono">{hist.previousExpiryDate}</span> · Processed by: <span className="font-medium text-slate-800">{hist.renewedBy}</span>
                      </p>
                      {hist.notes && (
                        <p className="text-slate-500 italic text-[11px]">{hist.notes}</p>
                      )}
                      {hist.archivedFileName && (
                        <div className="mt-1.5 text-[11px] text-[#5E5CE6] font-mono flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Archived: {hist.archivedFileName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
