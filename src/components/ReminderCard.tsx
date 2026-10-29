import React from 'react';
import {
  Permit,
  Asset,
  PermitCategory,
  Role,
} from '../types';
import {
  calculateDaysRemaining,
  getPermitUrgency,
  getMilestoneStatuses,
  formatAED,
} from '../utils/compliance';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  FileCheck2,
  FileText,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  Mail,
  ExternalLink,
} from 'lucide-react';

interface ReminderCardProps {
  permit: Permit;
  asset?: Asset;
  category?: PermitCategory;
  role: Role;
  onOpenAssetDrawer: (assetId: string) => void;
  onOpenLogRenewal: (permitId: string) => void;
  onMarkInRenewal: (permitId: string) => void;
  onOpenDocViewer: (permit: Permit) => void;
  onEditReminder: (permit: Permit) => void;
  onDeleteReminder: (permitId: string) => void;
}

export function ReminderCard({
  permit,
  asset,
  category,
  role,
  onOpenAssetDrawer,
  onOpenLogRenewal,
  onMarkInRenewal,
  onOpenDocViewer,
  onEditReminder,
  onDeleteReminder,
}: ReminderCardProps) {
  const daysRemaining = calculateDaysRemaining(permit.expiryDate);
  const urgency = getPermitUrgency(permit);
  const milestones = getMilestoneStatuses(permit.leadDays || [60, 30, 14, 7, 1], daysRemaining);

  const isCritical = urgency === 'critical' || urgency === 'expired';
  const isWarning = urgency === 'warning';
  const isInRenewal = urgency === 'in_renewal';

  return (
    <div className={`p-5 rounded-3xl bg-white border transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 ${
      isCritical
        ? 'border-red-200 ring-1 ring-red-100 bg-gradient-to-br from-white via-white to-red-50/20'
        : isWarning
        ? 'border-amber-200 bg-gradient-to-br from-white via-white to-amber-50/20'
        : isInRenewal
        ? 'border-blue-200 bg-gradient-to-br from-white via-white to-blue-50/20'
        : 'border-slate-200/90'
    }`}>
      {/* Top Header: Category, Status & Urgency Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
            style={{ backgroundColor: category?.color || '#5E5CE6' }}
          />
          <div>
            <span className="font-extrabold text-slate-900 text-sm block">
              {category?.name || 'Compliance Renewal'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              #{permit.permitNumber} · {category?.issuingAuthority || 'Govt Department'}
            </span>
          </div>
        </div>

        {/* Urgency Badge */}
        <div>
          {isInRenewal ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-100 text-blue-700 shadow-2xs">
              <RefreshCw className="w-3 h-3 animate-spin" /> In Renewal
            </span>
          ) : urgency === 'expired' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-red-100 text-red-700 shadow-2xs">
              <AlertCircle className="w-3 h-3" /> Expired ({Math.abs(daysRemaining)}d ago)
            </span>
          ) : isCritical ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-red-100 text-red-700 shadow-2xs animate-pulse">
              <AlertTriangle className="w-3 h-3" /> Due in {daysRemaining} days (Urgent)
            </span>
          ) : isWarning ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 shadow-2xs">
              <Clock className="w-3 h-3" /> Due in {daysRemaining} days
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs">
              <CheckCircle2 className="w-3 h-3" /> {daysRemaining} days remaining
            </span>
          )}
        </div>
      </div>

      {/* Parent Asset Binding Link & Meta */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
            Parent Asset
          </span>
          {asset ? (
            <button
              onClick={() => onOpenAssetDrawer(asset.id)}
              className="text-left group cursor-pointer flex items-center gap-1.5"
            >
              <span className="font-mono font-bold text-xs text-[#5E5CE6] group-hover:underline">
                {asset.identifier}
              </span>
              <span className="text-[11px] text-slate-600 truncate max-w-[200px]">
                · {asset.name}
              </span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">Unassigned Asset</span>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
            Annual Fee
          </span>
          <span className="text-sm font-extrabold text-slate-900">
            {formatAED(permit.cost)}
          </span>
        </div>
      </div>

      {/* Expiry Date & Milestones */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Deadline: <strong className="font-mono text-slate-900">{permit.expiryDate}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Mail className="w-3 h-3" />
            <span className="font-mono">{permit.assignedToEmail}</span>
          </div>
        </div>

        {/* Milestone Schedule */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-slate-400 font-bold mr-1">Alerts:</span>
          {milestones.map((m) => (
            <span
              key={m.days}
              title={`${m.days} days notice`}
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                m.triggered
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              {m.days}d {m.triggered ? '✓' : '○'}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons: Log Renewal, In-Renewal, Edit, Delete, View Doc */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          {permit.fileName && (
            <button
              onClick={() => onOpenDocViewer(permit)}
              title="View Document Scan"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          {role !== 'viewer' && (
            <>
              <button
                onClick={() => onEditReminder(permit)}
                title="Edit Reminder"
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Remove reminder for ${permit.permitNumber}?`)) {
                    onDeleteReminder(permit.id);
                  }
                }}
                title="Delete Reminder"
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {role !== 'viewer' && (
          <div className="flex items-center gap-2">
            {permit.status !== 'in_renewal' ? (
              <button
                onClick={() => onMarkInRenewal(permit.id)}
                title="Mark In-Renewal"
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>In-Renewal</span>
              </button>
            ) : (
              <span className="text-[11px] text-blue-700 font-bold px-2 py-1 bg-blue-50 rounded-xl">
                Processing
              </span>
            )}

            <button
              onClick={() => onOpenLogRenewal(permit.id)}
              title="Log Renewal"
              className="px-3 py-1.5 rounded-xl bg-[#1E1B4B] hover:bg-[#2F2B66] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Renew</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
