import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Plus,
  RefreshCw,
  FileCheck2,
  Calendar,
  ExternalLink,
  ShieldAlert,
  FileText,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Edit,
} from 'lucide-react';
import { Asset, Permit, PermitCategory, AssetGroup, Role } from '../types';
import {
  calculateDaysRemaining,
  getPermitUrgency,
  getMilestoneStatuses,
  detectAssetDependencies,
  formatAED,
} from '../utils/compliance';
import { DynamicIcon } from './IconHelper';

interface AssetCardProps {
  asset: Asset;
  permits: Permit[];
  categories: PermitCategory[];
  assetGroup?: AssetGroup;
  role: Role;
  onOpenAssetDrawer: (assetId: string) => void;
  onOpenAttachPermit: (assetId: string) => void;
  onOpenLogRenewal: (permitId: string) => void;
  onMarkInRenewal: (permitId: string) => void;
  onOpenDocViewer: (permit: Permit) => void;
  onDeleteAsset?: (assetId: string) => void;
  onEditPermit?: (permit: Permit) => void;
  onDeletePermit?: (permitId: string) => void;
}

export function AssetCard({
  asset,
  permits,
  categories,
  assetGroup,
  role,
  onOpenAssetDrawer,
  onOpenAttachPermit,
  onOpenLogRenewal,
  onMarkInRenewal,
  onOpenDocViewer,
  onDeleteAsset,
  onEditPermit,
  onDeletePermit,
}: AssetCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const boundPermits = permits.filter((p) => p.assetId === asset.id);
  const totalAssetSpend = boundPermits.reduce((acc, p) => acc + (p.cost || 0), 0);
  const dependencyAlert = detectAssetDependencies(asset, boundPermits, categories);

  const categoryMap = new Map<string, PermitCategory>(categories.map((c) => [c.id, c]));

  // Check highest urgency level among permits
  const hasCritical = boundPermits.some((p) => getPermitUrgency(p) === 'critical' || getPermitUrgency(p) === 'expired');
  const hasWarning = boundPermits.some((p) => getPermitUrgency(p) === 'warning');
  const hasInRenewal = boundPermits.some((p) => p.status === 'in_renewal');

  return (
    <div className={`bg-white rounded-3xl border transition-all shadow-xs hover:shadow-md overflow-hidden ${
      hasCritical
        ? 'border-red-200 ring-1 ring-red-100'
        : hasWarning
        ? 'border-amber-200'
        : 'border-slate-200/90'
    }`}>
      {/* Asset Header Section */}
      <div className="p-5 md:p-6 bg-gradient-to-r from-slate-50/70 to-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Asset Group Icon Pill */}
          <div className="w-12 h-12 rounded-2xl bg-[#5E5CE6]/10 text-[#5E5CE6] flex items-center justify-center shrink-0 border border-[#5E5CE6]/20">
            <DynamicIcon name={assetGroup?.icon || 'Truck'} className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight hover:text-[#5E5CE6] cursor-pointer" onClick={() => onOpenAssetDrawer(asset.id)}>
                {asset.identifier}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {assetGroup?.name || 'Asset'}
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                asset.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : asset.status === 'maintenance'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {asset.status}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-600">
              {asset.name}
            </p>

            {/* Dynamic Metadata tags */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {Object.entries(asset.metadata || {}).map(([key, val]) => (
                <span
                  key={key}
                  className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-mono shadow-2xs"
                >
                  <strong className="text-slate-400 font-sans font-medium">{key}:</strong> {val}
                </span>
              ))}
              {asset.location && (
                <span className="text-[11px] text-slate-500 bg-slate-100/70 px-2 py-0.5 rounded-lg">
                  📍 {asset.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Asset Stats & Actions */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Annual Spend
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {formatAED(totalAssetSpend)}
            </span>
          </div>

          <button
            onClick={() => onOpenAssetDrawer(asset.id)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          {role !== 'viewer' && (
            <button
              onClick={() => onOpenAttachPermit(asset.id)}
              className="px-3 py-1.5 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach Permit</span>
            </button>
          )}

          {role === 'admin' && onDeleteAsset && (
            <button
              onClick={() => onDeleteAsset(asset.id)}
              title="Delete Asset (Admin Only)"
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isExpanded ? 'Collapse Permits' : 'Expand Permits'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Smart Dependency Banner */}
      {dependencyAlert && (
        <div className={`px-6 py-3 border-b flex items-start gap-3 ${
          dependencyAlert.type === 'critical'
            ? 'bg-red-50/90 border-red-200 text-red-800'
            : 'bg-amber-50/90 border-amber-200 text-amber-800'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
            dependencyAlert.type === 'critical' ? 'text-red-600' : 'text-amber-600'
          }`} />
          <div className="flex-1 text-xs">
            <span className="font-bold mr-1.5">{dependencyAlert.title}:</span>
            <span>{dependencyAlert.message}</span>
          </div>
        </div>
      )}

      {/* Child Permits Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          {boundPermits.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No compliance permits bound to this asset yet.{' '}
              {role !== 'viewer' && (
                <button
                  onClick={() => onOpenAttachPermit(asset.id)}
                  className="text-[#5E5CE6] font-semibold underline ml-1"
                >
                  Attach first permit
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-6">Permit / License</th>
                  <th className="py-2.5 px-4">Authority</th>
                  <th className="py-2.5 px-4">Expiry & Urgency</th>
                  <th className="py-2.5 px-4">Annual Cost</th>
                  <th className="py-2.5 px-4">Email Alert Milestones</th>
                  <th className="py-2.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {boundPermits.map((permit) => {
                  const category = categoryMap.get(permit.categoryId);
                  const daysRemaining = calculateDaysRemaining(permit.expiryDate);
                  const urgency = getPermitUrgency(permit);
                  const milestones = getMilestoneStatuses(permit.leadDays || [60, 30, 14, 7, 1], daysRemaining);

                  return (
                    <tr key={permit.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Permit Info */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: category?.color || '#5E5CE6' }}
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {category?.name || 'General Permit'}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              #{permit.permitNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Issuing Authority */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {category?.issuingAuthority || 'Govt Department'}
                      </td>

                      {/* Expiry Date & Countdown */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-slate-800 font-semibold">
                            {permit.expiryDate}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {urgency === 'in_renewal' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                                <RefreshCw className="w-3 h-3 animate-spin" /> In Renewal
                              </span>
                            ) : urgency === 'expired' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                                <AlertCircle className="w-3 h-3" /> Expired ({Math.abs(daysRemaining)}d ago)
                              </span>
                            ) : urgency === 'critical' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                                <AlertTriangle className="w-3 h-3" /> Urgent ({daysRemaining}d left)
                              </span>
                            ) : urgency === 'warning' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                                <Clock className="w-3 h-3" /> Warning ({daysRemaining}d left)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" /> {daysRemaining}d left
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 font-extrabold text-slate-800">
                        {formatAED(permit.cost)}
                      </td>

                      {/* Alert Milestones Progress Pills */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {milestones.map((m) => (
                            <span
                              key={m.days}
                              title={`${m.days} days alert: ${m.triggered ? 'Fired / Active' : 'Pending'}`}
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
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {permit.fileName && (
                            <button
                              onClick={() => onOpenDocViewer(permit)}
                              title="View Document Scan"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}

                          {role !== 'viewer' && (
                            <>
                              {onEditPermit && (
                                <button
                                  onClick={() => onEditPermit(permit)}
                                  title="Edit Reminder / Permit"
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {onDeletePermit && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete reminder for ${permit.permitNumber}?`)) {
                                      onDeletePermit(permit.id);
                                    }
                                  }}
                                  title="Delete Reminder / Permit"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {permit.status !== 'in_renewal' ? (
                                <button
                                  onClick={() => onMarkInRenewal(permit.id)}
                                  title="Mark paperwork submitted to authority (pauses alerts)"
                                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>In-Renewal</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-blue-600 font-semibold px-2 py-1 bg-blue-50/50 rounded-lg">
                                  Processing
                                </span>
                              )}

                              <button
                                onClick={() => onOpenLogRenewal(permit.id)}
                                title="Log completed renewal with new expiry and receipt"
                                className="px-2.5 py-1 rounded-lg bg-[#1E1B4B] hover:bg-[#2F2B66] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all hover:scale-[1.02]"
                              >
                                <FileCheck2 className="w-3 h-3 text-emerald-400" />
                                <span>Log Renewal</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
