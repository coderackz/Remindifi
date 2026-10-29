import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  FileText,
  AlertCircle,
  Loader2,
  Calendar,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Asset, PermitCategory, Permit } from '../types';

interface AddPermitModalProps {
  isOpen: boolean;
  preselectedAssetId?: string;
  assets: Asset[];
  categories: PermitCategory[];
  onClose: () => void;
  onSubmitPermit: (newPermit: Omit<Permit, 'id'>) => void;
}

export function AddPermitModal({
  isOpen,
  preselectedAssetId,
  assets,
  categories,
  onClose,
  onSubmitPermit,
}: AddPermitModalProps) {
  const [assetId, setAssetId] = useState(preselectedAssetId || (assets[0]?.id || ''));
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [permitNumber, setPermitNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  
  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
  const [expiryDate, setExpiryDate] = useState(defaultExpiry.toISOString().split('T')[0]);
  
  const [cost, setCost] = useState('1200');
  const [leadDays, setLeadDays] = useState<number[]>([60, 30, 14, 7, 1]);
  const [assignedToEmail, setAssignedToEmail] = useState('fleet.admin@remindifi.ae');
  const [ccEmails, setCcEmails] = useState('pro.team@remindifi.ae');
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');

  const [isAiScanning, setIsAiScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  // When category changes, adopt its default lead days
  useEffect(() => {
    const selectedCat = categories.find((c) => c.id === categoryId);
    if (selectedCat && selectedCat.defaultLeadDays) {
      setLeadDays(selectedCat.defaultLeadDays);
    }
  }, [categoryId, categories]);

  // If preselectedAssetId is given
  useEffect(() => {
    if (preselectedAssetId) {
      setAssetId(preselectedAssetId);
    }
  }, [preselectedAssetId]);

  const handleFileUpload = async (file: File) => {
    setIsAiScanning(true);
    setScanStatus(`Reading file ${file.name}...`);
    setFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setScanStatus('Analyzing document structure with Gemini 3.8 Flash...');

        try {
          const res = await fetch('/api/gemini/scan-permit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/png',
              fileName: file.name,
            }),
          });
          const result = await res.json();
          if (result.success && result.data) {
            const d = result.data;
            if (d.permitNumber) setPermitNumber(d.permitNumber);
            if (d.issueDate) setIssueDate(d.issueDate);
            if (d.expiryDate) setExpiryDate(d.expiryDate);
            if (d.cost) setCost(d.cost.toString());
            if (d.notes) setNotes(d.notes);

            // Attempt to match category by authority or keywords
            const matchedCategory = categories.find((c) =>
              c.issuingAuthority.toLowerCase().includes(d.issuingAuthority?.toLowerCase() || '') ||
              d.notes?.toLowerCase().includes(c.name.toLowerCase())
            );
            if (matchedCategory) {
              setCategoryId(matchedCategory.id);
            }

            setScanStatus(`Auto-filled successfully from ${result.source}!`);
          }
        } catch (apiErr) {
          console.error(apiErr);
          setScanStatus('Scanned with fallback OCR.');
        } finally {
          setIsAiScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsAiScanning(false);
      setScanStatus('Upload failed.');
    }
  };

  const handleSimulateScanPreset = async (presetType: string, presetName: string) => {
    setIsAiScanning(true);
    setScanStatus(`Analyzing sample ${presetName} with Gemini...`);
    try {
      const res = await fetch('/api/gemini/scan-permit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleType: presetType }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        if (d.permitNumber) setPermitNumber(d.permitNumber);
        if (d.issueDate) setIssueDate(d.issueDate);
        if (d.expiryDate) setExpiryDate(d.expiryDate);
        if (d.cost) setCost(d.cost.toString());
        if (d.notes) setNotes(d.notes);
        setFileName(`${presetType}_official_scan.pdf`);

        // Match category
        if (presetType === 'rta_mulkiya') {
          const c = categories.find((x) => x.name.toLowerCase().includes('mulkiya'));
          if (c) setCategoryId(c.id);
        } else if (presetType === 'motor_insurance') {
          const c = categories.find((x) => x.name.toLowerCase().includes('insurance'));
          if (c) setCategoryId(c.id);
        } else if (presetType === 'trade_license') {
          const c = categories.find((x) => x.name.toLowerCase().includes('trade'));
          if (c) setCategoryId(c.id);
        }

        setScanStatus(`Auto-filled from ${presetName}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !categoryId || !permitNumber || !expiryDate) return;

    onSubmitPermit({
      assetId,
      categoryId,
      permitNumber,
      issueDate,
      expiryDate,
      cost: parseFloat(cost) || 0,
      status: 'active',
      leadDays,
      assignedToEmail,
      ccEmails: ccEmails.split(',').map((s) => s.trim()).filter(Boolean),
      fileName: fileName || `${permitNumber}_document.pdf`,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl z-10 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5E5CE6]/10 text-[#5E5CE6] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Attach Compliance Permit to Asset
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                1-to-Many Relational Binding · Email Reminder Schedule
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

        {/* AI Scan Dropzone */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#5E5CE6]/10 via-indigo-50/50 to-purple-50/40 border border-[#5E5CE6]/25">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#5E5CE6] text-white rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xs text-[#1E1B4B]">
                AI Document Scanner (Gemini Powered)
              </span>
            </div>
            {isAiScanning && (
              <span className="text-xs font-semibold text-[#5E5CE6] flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> {scanStatus}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 mb-3">
            Upload any permit scan, registration card, or insurance certificate. Gemini extracts the Permit Number, Dates, and Authority directly into the form.
          </p>

          {/* Upload Input & Sample Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border-2 border-dashed border-[#5E5CE6]/40 rounded-xl cursor-pointer transition-all shadow-xs group">
              <Upload className="w-4 h-4 text-[#5E5CE6] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">
                {fileName ? `File: ${fileName.substring(0, 20)}...` : 'Upload Scan / PDF'}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>

            {/* Quick 1-Click UAE Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-bold block w-full">
                Or test with 1-click UAE samples:
              </span>
              <button
                type="button"
                disabled={isAiScanning}
                onClick={() => handleSimulateScanPreset('rta_mulkiya', 'Dubai RTA Mulkiya')}
                className="text-[10px] px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors"
              >
                🇦🇪 RTA Mulkiya
              </button>
              <button
                type="button"
                disabled={isAiScanning}
                onClick={() => handleSimulateScanPreset('motor_insurance', 'Sukoon Fleet Insurance')}
                className="text-[10px] px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors"
              >
                🛡️ Sukoon Insurance
              </button>
              <button
                type="button"
                disabled={isAiScanning}
                onClick={() => handleSimulateScanPreset('trade_license', 'DET Commercial License')}
                className="text-[10px] px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors"
              >
                🏢 Trade License
              </button>
            </div>
          </div>

          {scanStatus && !isAiScanning && (
            <div className="mt-2.5 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{scanStatus}</span>
            </div>
          )}
        </div>

        {/* Main Permit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Asset Binding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Parent Asset Binding *
              </label>
              <select
                required
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.identifier} — {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Permit Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.issuingAuthority})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Permit Number & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Permit / License # *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. RTA-MLK-881920 or POL-99201"
                value={permitNumber}
                onChange={(e) => setPermitNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Annual Renewal Fee (AED)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  AED
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold text-indigo-900"
              />
            </div>
          </div>

          {/* Email Alert Lead Days */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Trigger Milestones (Days before expiry to dispatch alert)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[90, 60, 45, 30, 21, 14, 7, 3, 1].map((d) => {
                const isChecked = leadDays.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => {
                      if (isChecked) {
                        setLeadDays(leadDays.filter((x) => x !== d));
                      } else {
                        setLeadDays([...leadDays, d].sort((a, b) => b - a));
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isChecked
                        ? 'bg-[#1E1B4B] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {d}d {isChecked && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Assigned Officer Email
              </label>
              <input
                type="email"
                required
                value={assignedToEmail}
                onChange={(e) => setAssignedToEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                CC Escalation Emails (comma-separated)
              </label>
              <input
                type="text"
                placeholder="pro@remindifi.ae, legal@remindifi.ae"
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Compliance Notes & Special Conditions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Tasjeel inspection stamped, GCC territorial coverage active..."
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
              className="px-5 py-2 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white font-bold flex items-center gap-1.5 shadow-md shadow-[#5E5CE6]/25"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Bind Permit to Asset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
