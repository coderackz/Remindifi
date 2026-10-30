import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Shield,
  FolderPlus,
  Tag,
  Check,
  AlertCircle,
  Truck,
  Building2,
  Cpu,
  Users,
  Ship,
  Boxes,
  Briefcase,
  FileText,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { AssetGroup, PermitCategory, Role } from '../types';
import { DynamicIcon } from './IconHelper';

interface CategoriesViewProps {
  assetGroups: AssetGroup[];
  categories: PermitCategory[];
  role: Role;
  onAddAssetGroup: (group: Omit<AssetGroup, 'id'>) => void;
  onEditAssetGroup?: (group: AssetGroup) => void;
  onDeleteAssetGroup?: (groupId: string) => void;
  onAddCategory: (category: Omit<PermitCategory, 'id'>) => void;
  onEditCategory?: (category: PermitCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export function CategoriesView({
  assetGroups,
  categories,
  role,
  onAddAssetGroup,
  onEditAssetGroup,
  onDeleteAssetGroup,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoriesViewProps) {
  // New Asset Group Form State
  const [groupName, setGroupName] = useState('');
  const [groupIcon, setGroupIcon] = useState('Ship');
  const [groupCustomLabels, setGroupCustomLabels] = useState('Hull No, Marine Call Sign, Port of Registry');
  const [groupDescription, setGroupDescription] = useState('Commercial marine boats, yachts, and water transport.');
  const [groupSuccess, setGroupSuccess] = useState(false);

  // New Permit Category Form State
  const [catName, setCatName] = useState('');
  const [catAssetGroupId, setCatAssetGroupId] = useState(assetGroups[0]?.id || '');
  const [catAuthority, setCatAuthority] = useState('');
  const [catLeadDays, setCatLeadDays] = useState('60, 30, 14, 7, 1');
  const [catColor, setCatColor] = useState('#8B5CF6');
  const [catSuccess, setCatSuccess] = useState(false);

  // Edit Modal States
  const [editingCategory, setEditingCategory] = useState<PermitCategory | null>(null);
  const [editingGroup, setEditingGroup] = useState<AssetGroup | null>(null);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;

    onAddAssetGroup({
      name: groupName,
      icon: groupIcon,
      customFieldLabels: groupCustomLabels.split(',').map((s) => s.trim()).filter(Boolean),
      description: groupDescription,
    });

    setGroupName('');
    setGroupSuccess(true);
    setTimeout(() => setGroupSuccess(false), 3000);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catAuthority) return;

    const parsedLeadDays = catLeadDays
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))
      .sort((a, b) => b - a);

    onAddCategory({
      name: catName,
      assetGroupId: catAssetGroupId,
      issuingAuthority: catAuthority,
      defaultLeadDays: parsedLeadDays.length > 0 ? parsedLeadDays : [60, 30, 14, 7, 1],
      color: catColor,
    });

    setCatName('');
    setCatAuthority('');
    setCatSuccess(true);
    setTimeout(() => setCatSuccess(false), 3000);
  };

  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !onEditCategory) return;
    onEditCategory(editingCategory);
    setEditingCategory(null);
  };

  const handleSaveEditGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !onEditGroup) return;
    onEditGroup(editingGroup);
    setEditingGroup(null);
  };

  const onEditGroup = onEditAssetGroup;

  const availableIcons = [
    { name: 'Ship', label: 'Marine / Vessels' },
    { name: 'Boxes', label: 'Warehouse / Goods' },
    { name: 'Briefcase', label: 'Executive' },
    { name: 'Cpu', label: 'Machinery' },
    { name: 'Truck', label: 'Fleet' },
    { name: 'Building2', label: 'Facility' },
    { name: 'Users', label: 'Personnel' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Role notice banner if not Admin */}
      {role !== 'admin' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs">
              <strong>Admin Privileges Required to Edit/Remove:</strong> You are currently viewing as{' '}
              <strong className="capitalize">{role}</strong>. Switch to <strong>Admin</strong> in the top navigation bar to add, edit, or remove categories.
            </p>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Categoory & Asset Group Manager</span>
            <span className="text-xs bg-[#5E5CE6]/10 text-[#5E5CE6] font-bold px-2.5 py-0.5 rounded-full">
              Full Add, Edit & Remove
            </span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage your parent Asset Groups and Permit Categories with custom reminder lead days.
          </p>
        </div>
      </div>

      {/* Two Column Layout for Builders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Asset Groups */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5E5CE6]/10 text-[#5E5CE6] flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Asset Groups ({assetGroups.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Parent templates (e.g. Commercial Vehicles, Branches)
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Asset Groups List with Edit & Remove Buttons */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-1">
              {assetGroups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-[#5E5CE6] flex items-center justify-center shrink-0">
                      <DynamicIcon name={group.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {group.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {group.id}
                        </span>
                      </div>
                      {group.description && (
                        <p className="text-slate-500 text-[11px] mt-0.5">{group.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <span className="text-[10px] font-bold text-slate-400">Custom Attributes:</span>
                        {group.customFieldLabels.map((f) => (
                          <span key={f} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 font-mono">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Remove */}
                  {role === 'admin' && (
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        onClick={() => setEditingGroup(group)}
                        title="Edit Asset Group"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteAssetGroup && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove asset group "${group.name}"?`)) {
                              onDeleteAssetGroup(group.id);
                            }
                          }}
                          title="Remove Asset Group"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Create Asset Group Form */}
            <form onSubmit={handleCreateGroup} className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#5E5CE6]" />
                <span>Add New Asset Group</span>
              </h4>

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  disabled={role !== 'admin'}
                  placeholder="e.g. Marine Vessels & Barges"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 disabled:opacity-60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Icon Theme
                  </label>
                  <select
                    disabled={role !== 'admin'}
                    value={groupIcon}
                    onChange={(e) => setGroupIcon(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 disabled:opacity-60"
                  >
                    {availableIcons.map((ic) => (
                      <option key={ic.name} value={ic.name}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Custom Field Labels
                  </label>
                  <input
                    type="text"
                    disabled={role !== 'admin'}
                    placeholder="Comma-separated labels"
                    value={groupCustomLabels}
                    onChange={(e) => setGroupCustomLabels(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  disabled={role !== 'admin'}
                  placeholder="Scope of assets..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 disabled:opacity-60"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {groupSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Asset Group added!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={role !== 'admin'}
                  className="ml-auto px-4 py-2 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Asset Group</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Categories */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Categoory Registry ({categories.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Child document types with custom lead alert milestones
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Categories List with Edit and Remove */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 mb-6">
              {categories.map((cat) => {
                const parentGroup = assetGroups.find((g) => g.id === cat.assetGroupId);
                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color || '#5E5CE6' }}
                      />
                      <div className="truncate">
                        <span className="font-extrabold text-slate-900 block truncate">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {cat.issuingAuthority} · Target: <strong className="text-slate-700">{parentGroup?.name}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex items-center gap-1">
                        {cat.defaultLeadDays.map((d) => (
                          <span key={d} className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-600 font-bold">
                            {d}d
                          </span>
                        ))}
                      </div>

                      {role === 'admin' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingCategory(cat)}
                            title="Edit Category"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-white transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteCategory && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove category "${cat.name}"?`)) {
                                  onDeleteCategory(cat.id);
                                }
                              }}
                              title="Remove Category"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                <span>Add New Categoory</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Categoory Name *
                  </label>
                  <input
                    type="text"
                    disabled={role !== 'admin'}
                    placeholder="e.g. Marine Navigation License"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Asset Group Target *
                  </label>
                  <select
                    disabled={role !== 'admin'}
                    value={catAssetGroupId}
                    onChange={(e) => setCatAssetGroupId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 disabled:opacity-60 font-semibold"
                  >
                    {assetGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Issuing Authority *
                  </label>
                  <input
                    type="text"
                    disabled={role !== 'admin'}
                    placeholder="e.g. Dubai Maritime City Authority"
                    value={catAuthority}
                    onChange={(e) => setCatAuthority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Default Alert Days
                  </label>
                  <input
                    type="text"
                    disabled={role !== 'admin'}
                    placeholder="60, 30, 14, 7, 1"
                    value={catLeadDays}
                    onChange={(e) => setCatLeadDays(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {catSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Category registered!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={role !== 'admin'}
                  className="ml-auto px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Categoory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- EDIT CATEGORY MODAL --- */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setEditingCategory(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Edit Categoory
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoory Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Asset Group</label>
                <select
                  value={editingCategory.assetGroupId}
                  onChange={(e) => setEditingCategory({ ...editingCategory, assetGroupId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                >
                  {assetGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issuing Authority</label>
                <input
                  type="text"
                  required
                  value={editingCategory.issuingAuthority}
                  onChange={(e) => setEditingCategory({ ...editingCategory, issuingAuthority: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Default Alert Lead Days (Comma-separated)</label>
                <input
                  type="text"
                  value={editingCategory.defaultLeadDays.join(', ')}
                  onChange={(e) => {
                    const days = e.target.value
                      .split(',')
                      .map((s) => parseInt(s.trim(), 10))
                      .filter((n) => !isNaN(n));
                    setEditingCategory({ ...editingCategory, defaultLeadDays: days });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Categoory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT ASSET GROUP MODAL --- */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setEditingGroup(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Edit Asset Group
              </h3>
              <button
                onClick={() => setEditingGroup(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Icon</label>
                <select
                  value={editingGroup.icon}
                  onChange={(e) => setEditingGroup({ ...editingGroup, icon: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                >
                  {availableIcons.map((ic) => (
                    <option key={ic.name} value={ic.name}>
                      {ic.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Field Labels (Comma-separated)</label>
                <input
                  type="text"
                  value={editingGroup.customFieldLabels.join(', ')}
                  onChange={(e) => {
                    const labels = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    setEditingGroup({ ...editingGroup, customFieldLabels: labels });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editingGroup.description || ''}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Group</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
