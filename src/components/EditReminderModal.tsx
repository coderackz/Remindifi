import React, { useState, useEffect } from 'react';
import {
  X,
  Edit,
  Save,
  Trash2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Asset, PermitCategory, Permit } from '../types';

interface EditReminderModalProps {
  permit: Permit | null;
  assets: Asset[];
  categories: PermitCategory[];
  onClose: () => void;
  onSubmitEdit: (updatedPermit: Permit) => void;
  onDeletePermit?: (permitId: string) => void;
}

export function EditReminderModal({
  permit,
  assets,
  categories,
  onClose,
  onSubmitEdit,
  onDeletePermit,
}: EditReminderModalProps) {
  const [assetId, setAssetId] = useState(permit?.assetId || '');
  const [categoryId, setCategoryId] = useState(permit?.categoryId || '');
  const [permitNumber, setPermitNumber] = useState(permit?.permitNumber || '');
  const [issueDate, setIssueDate] = useState(permit?.issueDate || '');
  const [expiryDate, setExpiryDate] = useState(permit?.expiryDate || '');
  const [cost, setCost] = useState(permit?.cost?.toString() || '0');
  const [status, setStatus] = useState<Permit['status']>(permit?.status || 'active');
  const [assignedToEmail, setAssignedToEmail] = useState(permit?.assignedToEmail || '');
  const [notes, setNotes] = useState(permit?.notes || '');

  useEffect(() => {
    if (permit) {
      setAssetId(permit.assetId);
      setCategoryId(permit.categoryId);
      setPermitNumber(permit.permitNumber);
      setIssueDate(permit.issueDate);
      setExpiryDate(permit.expiryDate);
      setCost(permit.cost?.toString() || '0');
      setStatus(permit.status);
      setAssignedToEmail(permit.assignedToEmail);
      setNotes(permit.notes || '');
    }
  }, [permit]);

  if (!permit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitEdit({
      ...permit,
      assetId,
      categoryId,
      permitNumber,
      issueDate,
      expiryDate,
      cost: parseFloat(cost) || 0,
      status,
      assignedToEmail,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5E5CE6] flex items-center justify-center">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Edit Compliance Reminder
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Update deadline dates, status, fee, or assigned contact
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Parent Asset
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.identifier}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Permit / License #
              </label>
              <input
                type="text"
                required
                value={permitNumber}
                onChange={(e) => setPermitNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Compliance Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Permit['status'])}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
              >
                <option value="active">Active & Tracked</option>
                <option value="in_renewal">In Renewal Process</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                Expiry / Renewal Deadline
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Annual Fee (AED)
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
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {onDeletePermit ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete reminder for ${permit.permitNumber}?`)) {
                    onDeletePermit(permit.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Reminder</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
