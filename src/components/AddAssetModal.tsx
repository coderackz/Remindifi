import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Building2,
  Cpu,
  Users,
  Plus,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Asset, AssetGroup } from '../types';
import { DynamicIcon } from './IconHelper';

interface AddAssetModalProps {
  isOpen: boolean;
  assetGroups: AssetGroup[];
  onClose: () => void;
  onSubmitAsset: (newAsset: Omit<Asset, 'id'>) => void;
}

export function AddAssetModal({
  isOpen,
  assetGroups,
  onClose,
  onSubmitAsset,
}: AddAssetModalProps) {
  const [assetGroupId, setAssetGroupId] = useState(assetGroups[0]?.id || '');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Dubai Al Quoz Service Hub');
  const [assignedDepartment, setAssignedDepartment] = useState('Operations & Fleet Logistics');
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  const selectedGroup = assetGroups.find((g) => g.id === assetGroupId) || assetGroups[0];

  // Initialize metadata fields based on group custom field labels
  useEffect(() => {
    if (selectedGroup?.customFieldLabels) {
      const initialMeta: Record<string, string> = {};
      selectedGroup.customFieldLabels.forEach((lbl) => {
        initialMeta[lbl] = '';
      });
      setMetadata(initialMeta);
    }
  }, [assetGroupId, selectedGroup]);

  const handleMetadataChange = (key: string, value: string) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !name) return;

    onSubmitAsset({
      assetGroupId,
      identifier,
      name,
      metadata,
      status: 'active',
      location,
      assignedDepartment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5E5CE6]/10 text-[#5E5CE6] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Create Parent Asset
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Parent entity to which multiple permits bind
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Asset Group Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Select Asset Group
            </label>
            <div className="grid grid-cols-2 gap-2">
              {assetGroups.map((g) => {
                const isSelected = g.id === assetGroupId;
                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => setAssetGroupId(g.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-[#5E5CE6] bg-[#5E5CE6]/10 text-[#5E5CE6] font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <DynamicIcon name={g.icon} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{g.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Identifier & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Asset Identifier *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DXB CC 99120 or HQ-BRANCH"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold uppercase focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ford Transit Delivery 04"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
              />
            </div>
          </div>

          {/* Dynamic Custom Metadata fields for this Asset Group */}
          {selectedGroup?.customFieldLabels && selectedGroup.customFieldLabels.length > 0 && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {selectedGroup.name} Custom Attributes
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {selectedGroup.customFieldLabels.map((lbl) => (
                  <div key={lbl}>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      {lbl}
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter ${lbl}`}
                      value={metadata[lbl] || ''}
                      onChange={(e) => handleMetadataChange(lbl, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Stationed Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Assigned Department
              </label>
              <input
                type="text"
                value={assignedDepartment}
                onChange={(e) => setAssignedDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
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
              className="px-5 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#2F2B66] text-white font-bold flex items-center gap-1.5 shadow-md shadow-slate-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Asset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
