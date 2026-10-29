import React, { useState } from 'react';
import {
  Permit,
  Asset,
  PermitCategory,
  Role,
} from '../types';
import {
  calculateDaysRemaining,
  getPermitUrgency,
  formatAED,
} from '../utils/compliance';
import {
  RefreshCw,
  FileCheck2,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Mail,
  Edit,
  Trash2,
} from 'lucide-react';

interface PermitsTableProps {
  permits: Permit[];
  assets: Asset[];
  categories: PermitCategory[];
  role: Role;
  onOpenAssetDrawer: (assetId: string) => void;
  onOpenLogRenewal: (permitId: string) => void;
  onMarkInRenewal: (permitId: string) => void;
  onOpenDocViewer: (permit: Permit) => void;
  onEditReminder?: (permit: Permit) => void;
  onDeleteReminder?: (permitId: string) => void;
}

export function PermitsTable({
  permits,
  assets,
  categories,
  role,
  onOpenAssetDrawer,
  onOpenLogRenewal,
  onMarkInRenewal,
  onOpenDocViewer,
  onEditReminder,
  onDeleteReminder,
}: PermitsTableProps) {
  const [sortField, setSortField] = useState<'expiryDate' | 'cost' | 'permitNumber'>('expiryDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const assetMap = new Map<string, Asset>(assets.map((a) => [a.id, a]));
  const categoryMap = new Map<string, PermitCategory>(categories.map((c) => [c.id, c]));

  const sortedPermits = [...permits].sort((a, b) => {
    if (sortField === 'expiryDate') {
      const diff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      return sortAsc ? diff : -diff;
    }
    if (sortField === 'cost') {
      const diff = (a.cost || 0) - (b.cost || 0);
      return sortAsc ? diff : -diff;
    }
    return sortAsc
      ? a.permitNumber.localeCompare(b.permitNumber)
      : b.permitNumber.localeCompare(a.permitNumber);
  });

  const toggleSort = (field: 'expiryDate' | 'cost' | 'permitNumber') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-extrabold text-slate-800 text-sm">
          Master Compliance Registry ({permits.length} Records)
        </h3>
        <span className="text-xs text-slate-400">
          Click column headers to sort by deadline or cost
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-6 cursor-pointer select-none" onClick={() => toggleSort('permitNumber')}>
                <div className="flex items-center gap-1">
                  <span>Permit / License #</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Parent Asset</th>
              <th className="py-3 px-4">Authority</th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('expiryDate')}>
                <div className="flex items-center gap-1">
                  <span>Expiry & Urgency</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('cost')}>
                <div className="flex items-center gap-1">
                  <span>Annual Fee</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Assigned Officer</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedPermits.map((permit) => {
              const asset = assetMap.get(permit.assetId);
              const category = categoryMap.get(permit.categoryId);
              const daysRemaining = calculateDaysRemaining(permit.expiryDate);
              const urgency = getPermitUrgency(permit);

              return (
                <tr key={permit.id} className="hover:bg-slate-50 transition-colors">
                  {/* Permit Info */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: category?.color || '#5E5CE6' }}
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {category?.name || 'Permit'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          #{permit.permitNumber}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Bound Parent Asset */}
                  <td className="py-3.5 px-4">
                    {asset ? (
                      <button
                        onClick={() => onOpenAssetDrawer(asset.id)}
                        className="text-left group cursor-pointer"
                      >
                        <span className="font-bold text-[#5E5CE6] group-hover:underline block font-mono text-xs">
                          {asset.identifier}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {asset.name}
                        </span>
                      </button>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>

                  {/* Issuing Authority */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {category?.issuingAuthority || 'Govt Department'}
                  </td>

                  {/* Expiry Date */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-semibold text-slate-800 block">
                      {permit.expiryDate}
                    </span>
                    <div className="mt-0.5">
                      {urgency === 'in_renewal' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" /> In Renewal
                        </span>
                      ) : urgency === 'expired' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                          <AlertCircle className="w-2.5 h-2.5" /> Expired ({Math.abs(daysRemaining)}d ago)
                        </span>
                      ) : urgency === 'critical' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                          <AlertTriangle className="w-2.5 h-2.5" /> Critical ({daysRemaining}d left)
                        </span>
                      ) : urgency === 'warning' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                          <Clock className="w-2.5 h-2.5" /> Warning ({daysRemaining}d left)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Compliant ({daysRemaining}d)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cost */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {formatAED(permit.cost)}
                  </td>

                  {/* Assigned Officer */}
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{permit.assignedToEmail || 'compliance@remindifi.ae'}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-right">
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
                          {onEditReminder && (
                            <button
                              onClick={() => onEditReminder(permit)}
                              title="Edit Reminder"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onDeleteReminder && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete reminder for ${permit.permitNumber}?`)) {
                                  onDeleteReminder(permit.id);
                                }
                              }}
                              title="Delete Reminder"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {permit.status !== 'in_renewal' ? (
                            <button
                              onClick={() => onMarkInRenewal(permit.id)}
                              title="Mark In-Renewal"
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>In-Renewal</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-blue-600 font-semibold px-2 py-1 bg-blue-50/50 rounded-lg">
                              In Review
                            </span>
                          )}

                          <button
                            onClick={() => onOpenLogRenewal(permit.id)}
                            title="Log Renewal"
                            className="px-2.5 py-1 rounded-lg bg-[#1E1B4B] hover:bg-[#2F2B66] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <FileCheck2 className="w-3 h-3 text-emerald-400" />
                            <span>Renew</span>
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
      </div>
    </div>
  );
}
