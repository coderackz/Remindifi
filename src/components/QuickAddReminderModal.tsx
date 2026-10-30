import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  Loader2,
  BellRing,
  Building,
} from 'lucide-react';
import { Asset, PermitCategory, Permit } from '../types';

interface QuickAddReminderModalProps {
  isOpen: boolean;
  assets: Asset[];
  categories: PermitCategory[];
  onClose: () => void;
  onSubmitReminder: (newReminder: Omit<Permit, 'id'>) => void;
}

export function QuickAddReminderModal({
  isOpen,
  assets,
  categories,
  onClose,
  onSubmitReminder,
}: QuickAddReminderModalProps) {
  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [permitNumber, setPermitNumber] = useState('');
  
  // Default to 30 days ahead for quick reminders
  const defaultExp = new Date();
  defaultExp.setDate(defaultExp.getDate() + 30);
  const [expiryDate, setExpiryDate] = useState(defaultExp.toISOString().split('T')[0]);
  
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState('850');
  const [leadDays, setLeadDays] = useState<number[]>([60, 30, 14, 7, 1]);
  const [assignedToEmail, setAssignedToEmail] = useState('fleet.admin@remindifi.ae');
  const [notes, setNotes] = useState('');
  const [isAiScanning, setIsAiScanning] = useState(false);

  // Synchronize category default lead days when category changes
  useEffect(() => {
    const selectedCat = categories.find((c) => c.id === categoryId);
    if (selectedCat && selectedCat.defaultLeadDays) {
      setLeadDays(selectedCat.defaultLeadDays);
    }
  }, [categoryId, categories]);

  if (!isOpen) return null;

  const setQuickExpiry = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setExpiryDate(target.toISOString().split('T')[0]);
  };

  const handleSimulateQuickScan = async (sampleType: string) => {
    setIsAiScanning(true);
    try {
      const res = await fetch('/api/gemini/scan-permit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleType }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        if (d.permitNumber) setPermitNumber(d.permitNumber);
        if (d.expiryDate) setExpiryDate(d.expiryDate);
        if (d.cost) setCost(d.cost.toString());
        if (d.notes) setNotes(d.notes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !categoryId || !expiryDate) return;

    onSubmitReminder({
      assetId,
      categoryId,
      permitNumber: permitNumber || `REM-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate,
      expiryDate,
      cost: parseFloat(cost) || 0,
      status: 'active',
      leadDays,
      assignedToEmail: assignedToEmail || 'compliance@remindifi.ae',
      ccEmails: ['operations@remindifi.ae'],
      fileName: 'Reminder_Doc.pdf',
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Quick Add Reminder
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Set a compliance renewal alert in 30 seconds
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

        {/* AI Auto-Fill Helper */}
        <div className="mb-4 p-3 rounded-2xl bg-[#5E5CE6]/5 border border-[#5E5CE6]/20 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-bold text-[#5E5CE6] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click AI Sample:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isAiScanning}
              onClick={() => handleSimulateQuickScan('rta_mulkiya')}
              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium text-[11px]"
            >
              Mulkiya
            </button>
            <button
              type="button"
              disabled={isAiScanning}
              onClick={() => handleSimulateQuickScan('motor_insurance')}
              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium text-[11px]"
            >
              Insurance
            </button>
            <button
              type="button"
              disabled={isAiScanning}
              onClick={() => handleSimulateQuickScan('trade_license')}
              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium text-[11px]"
            >
              Trade License
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Parent Asset *
            </label>
            <select
              required
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-[#5E5CE6]/30"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.identifier} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-[#5E5CE6]/30"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Permit / Doc # (Optional)
              </label>
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={permitNumber}
                onChange={(e) => setPermitNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">
                Deadline / Expiry Date *
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuickExpiry(7)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
                >
                  +7d
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry(30)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
                >
                  +30d
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry(90)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
                >
                  +90d
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiry(365)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
                >
                  +1yr
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
            />
          </div>

          {/* Lead Days Milestones */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Alert Milestones (Days before expiry)
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[90, 60, 30, 14, 7, 3, 1].map((d) => {
                const isSelected = leadDays.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => {
                      if (isSelected) setLeadDays(leadDays.filter((x) => x !== d));
                      else setLeadDays([...leadDays, d].sort((a, b) => b - a));
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {d}d {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Estimated Renewal Fee (AED)
              </label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Assigned Contact Email
              </label>
              <input
                type="email"
                required
                value={assignedToEmail}
                onChange={(e) => setAssignedToEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Reminder Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Schedule inspection at Tasjeel Al Barsha..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/25"
            >
              <BellRing className="w-4 h-4" />
              <span>Create Quick Reminder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
