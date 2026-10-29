import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Upload,
  Sparkles,
  Calendar,
  Coins,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Permit, Asset, PermitCategory } from '../types';

interface LogRenewalModalProps {
  permitId: string | null;
  permits: Permit[];
  assets: Asset[];
  categories: PermitCategory[];
  onClose: () => void;
  onSubmitRenewal: (data: {
    permitId: string;
    newIssueDate: string;
    newExpiryDate: string;
    renewalCost: number;
    fileName: string;
    notes: string;
  }) => void;
}

export function LogRenewalModal({
  permitId,
  permits,
  assets,
  categories,
  onClose,
  onSubmitRenewal,
}: LogRenewalModalProps) {
  const permit = permits.find((p) => p.id === permitId);
  const asset = assets.find((a) => a.id === permit?.assetId);
  const category = categories.find((c) => c.id === permit?.categoryId);

  // Compute suggested next dates (1 year forward from today or old expiry)
  const todayStr = new Date().toISOString().split('T')[0];
  const nextYearDate = new Date();
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  const defaultNextExpiry = nextYearDate.toISOString().split('T')[0];

  const [issueDate, setIssueDate] = useState(todayStr);
  const [expiryDate, setExpiryDate] = useState(defaultNextExpiry);
  const [cost, setCost] = useState(permit?.cost?.toString() || '1500');
  const [fileName, setFileName] = useState(`${asset?.identifier || 'Asset'}_Renewed_${category?.name.replace(/\s+/g, '_') || 'Permit'}_2027.pdf`);
  const [notes, setNotes] = useState('Annual renewal successfully processed and stamped by authority.');
  const [isAiScanning, setIsAiScanning] = useState(false);

  if (!permitId || !permit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRenewal({
      permitId: permit.id,
      newIssueDate: issueDate,
      newExpiryDate: expiryDate,
      renewalCost: parseFloat(cost) || 0,
      fileName,
      notes,
    });
    onClose();
  };

  const handleSimulateAiScan = async (sampleType: string) => {
    setIsAiScanning(true);
    try {
      const res = await fetch('/api/gemini/scan-permit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleType }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.issueDate) setIssueDate(data.data.issueDate);
        if (data.data.expiryDate) setExpiryDate(data.data.expiryDate);
        if (data.data.cost) setCost(data.data.cost.toString());
        if (data.data.notes) setNotes(data.data.notes);
        setFileName(`${data.data.permitNumber}_Certificate_Scan.pdf`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Log Completed Renewal
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {category?.name} for <strong className="text-slate-800">{asset?.identifier}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Info */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-5 text-xs grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Expiry</span>
            <span className="font-mono font-bold text-slate-800">{permit.expiryDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Previous Cost</span>
            <span className="font-mono font-bold text-slate-800">{permit.cost} AED</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
            ℹ️ Submitting will archive the previous expiry into Renewal History and reset email milestone alerts.
          </div>
        </div>

        {/* AI Quick Auto-Fill preset */}
        <div className="mb-5 p-3 rounded-2xl bg-[#5E5CE6]/5 border border-[#5E5CE6]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5E5CE6] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Scan Auto-Fill:
            </span>
            {isAiScanning && (
              <span className="text-xs text-[#5E5CE6] flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Extracting with Gemini...
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isAiScanning}
              onClick={() => handleSimulateAiScan('rta_mulkiya')}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              📄 RTA Mulkiya Renewal
            </button>
            <button
              type="button"
              disabled={isAiScanning}
              onClick={() => handleSimulateAiScan('motor_insurance')}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              📄 Motor Insurance Schedule
            </button>
            <button
              type="button"
              disabled={isAiScanning}
              onClick={() => handleSimulateAiScan('trade_license')}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              📄 Commercial Trade License
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                New Issue Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                New Expiry Date
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Renewal Cost (AED)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                AED
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Archived Document Name / File
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
              />
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFileName(file.name);
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Renewal Audit Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Confirm & Archive Renewal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
