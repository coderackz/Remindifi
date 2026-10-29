import React, { useState, useMemo } from 'react';
import {
  Permit,
  Asset,
  PermitCategory,
  AssetGroup,
  Role,
  UrgencyFilter,
} from '../types';
import {
  calculateDaysRemaining,
  getPermitUrgency,
  formatAED,
} from '../utils/compliance';
import { ReminderCard } from './ReminderCard';
import { PermitsTable } from './PermitsTable';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Zap,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Coins,
  ShieldCheck,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

interface AllRemindersViewProps {
  permits: Permit[];
  assets: Asset[];
  categories: PermitCategory[];
  assetGroups: AssetGroup[];
  role: Role;
  onOpenQuickAdd: () => void;
  onOpenAttachPermit: (assetId?: string) => void;
  onOpenAssetDrawer: (assetId: string) => void;
  onEditPermit: (permit: Permit) => void;
  onMarkInRenewal: (permitId: string) => void;
  onLogRenewal: (permitId: string) => void;
  onDeletePermit: (permitId: string) => void;
  onViewDoc: (permit: Permit) => void;
}

type SortOption = 'expiry_asc' | 'expiry_desc' | 'cost_desc' | 'cost_asc' | 'name_asc' | 'asset_asc';

export function AllRemindersView({
  permits,
  assets,
  categories,
  assetGroups,
  role,
  onOpenQuickAdd,
  onOpenAttachPermit,
  onOpenAssetDrawer,
  onEditPermit,
  onMarkInRenewal,
  onLogRenewal,
  onDeletePermit,
  onViewDoc,
}: AllRemindersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('expiry_asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const assetMap = useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);

  // Comprehensive sorting and filtering
  const processedReminders = useMemo(() => {
    let list = permits.filter((permit) => {
      const asset = assetMap.get(permit.assetId);
      const category = categoryMap.get(permit.categoryId);

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPermitNo = permit.permitNumber.toLowerCase().includes(q);
        const matchesAssetId = asset?.identifier.toLowerCase().includes(q);
        const matchesAssetName = asset?.name.toLowerCase().includes(q);
        const matchesCategory = category?.name.toLowerCase().includes(q);
        const matchesAuthority = category?.issuingAuthority.toLowerCase().includes(q);
        const matchesNotes = permit.notes?.toLowerCase().includes(q);
        if (
          !matchesPermitNo &&
          !matchesAssetId &&
          !matchesAssetName &&
          !matchesCategory &&
          !matchesAuthority &&
          !matchesNotes
        ) {
          return false;
        }
      }

      // Urgency Filter
      if (urgencyFilter !== 'all') {
        const urgency = getPermitUrgency(permit);
        if (urgencyFilter === 'critical' && urgency !== 'critical' && urgency !== 'expired') return false;
        if (urgencyFilter === 'warning' && urgency !== 'warning') return false;
        if (urgencyFilter === 'in_renewal' && urgency !== 'in_renewal') return false;
        if (urgencyFilter === 'active' && urgency !== 'healthy') return false;
        if (urgencyFilter === 'expired' && urgency !== 'expired') return false;
      }

      // Group
      if (selectedGroupId !== 'all' && asset?.assetGroupId !== selectedGroupId) {
        return false;
      }

      // Category
      if (selectedCategoryId !== 'all' && permit.categoryId !== selectedCategoryId) {
        return false;
      }

      return true;
    });

    // Sort: Near to expiry is primary requirement
    list.sort((a, b) => {
      const daysA = calculateDaysRemaining(a.expiryDate);
      const daysB = calculateDaysRemaining(b.expiryDate);
      const assetA = assetMap.get(a.assetId)?.identifier || '';
      const assetB = assetMap.get(b.assetId)?.identifier || '';
      const catA = categoryMap.get(a.categoryId)?.name || '';
      const catB = categoryMap.get(b.categoryId)?.name || '';

      switch (sortBy) {
        case 'expiry_asc':
          return daysA - daysB;
        case 'expiry_desc':
          return daysB - daysA;
        case 'cost_desc':
          return b.cost - a.cost;
        case 'cost_asc':
          return a.cost - b.cost;
        case 'name_asc':
          return catA.localeCompare(catB);
        case 'asset_asc':
          return assetA.localeCompare(assetB);
        default:
          return daysA - daysB;
      }
    });

    return list;
  }, [permits, searchQuery, urgencyFilter, selectedGroupId, selectedCategoryId, sortBy, assetMap, categoryMap]);

  // Aggregate stats
  const totalCost = useMemo(() => permits.reduce((sum, p) => sum + (p.cost || 0), 0), [permits]);
  const criticalCount = useMemo(
    () => permits.filter((p) => getPermitUrgency(p) === 'critical' || getPermitUrgency(p) === 'expired').length,
    [permits]
  );
  const warningCount = useMemo(
    () => permits.filter((p) => getPermitUrgency(p) === 'warning').length,
    [permits]
  );
  const inRenewalCount = useMemo(
    () => permits.filter((p) => p.status === 'in_renewal').length,
    [permits]
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#5E5CE6]" />
              <span>All Compliance Reminders</span>
            </h1>
            <span className="text-xs bg-[#5E5CE6] text-white font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
              {processedReminders.length} of {permits.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Complete central repository of all fleet licenses, RTA Mulkiya, and statutory permits
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {role !== 'viewer' && (
            <>
              <button
                onClick={onOpenQuickAdd}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>+ Quick Add Reminder</span>
              </button>

              <button
                onClick={() => onOpenAttachPermit()}
                className="px-4 py-2.5 rounded-2xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#5E5CE6]/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Permit</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total In Database</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{permits.length}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Active tracking records</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Urgent (&le; 7 Days)
          </div>
          <div className="text-2xl font-black text-red-700 mt-1">{criticalCount}</div>
          <span className="text-[11px] text-red-600/80 mt-0.5 block">Action required</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Approaching (8-30 Days)
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1">{warningCount}</div>
          <span className="text-[11px] text-amber-700/80 mt-0.5 block">Prepare renewal documents</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
            <Coins className="w-3 h-3" /> Total Annual Cost
          </div>
          <div className="text-2xl font-black text-indigo-900 mt-1">{formatAED(totalCost)}</div>
          <span className="text-[11px] text-indigo-700/80 mt-0.5 block">Fleet compliance budget</span>
        </div>
      </div>

      {/* Filter and Sorting Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by plate, vehicle name, permit number, or issuing authority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6]"
            />
          </div>

          {/* Controls: Asset Group Filter, Category Filter, Sort By, View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Asset Group */}
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              aria-label="Filter by asset group"
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
            >
              <option value="all">All Asset Groups</option>
              {assetGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              aria-label="Filter by category"
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
            >
              <option value="all">All Categoories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort reminders by"
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="expiry_asc">Sort: Near to Expiry (Earliest First)</option>
                <option value="expiry_desc">Sort: Furthest Expiry First</option>
                <option value="cost_desc">Sort: Highest Cost (AED)</option>
                <option value="cost_asc">Sort: Lowest Cost (AED)</option>
                <option value="name_asc">Sort: Permit Name (A-Z)</option>
                <option value="asset_asc">Sort: Asset Identifier (A-Z)</option>
              </select>
            </div>

            {/* Grid / Table Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#5E5CE6] shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-[#5E5CE6] shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table Ledger View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Urgency Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>

          <button
            onClick={() => setUrgencyFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              urgencyFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All ({permits.length})
          </button>

          <button
            onClick={() => setUrgencyFilter('critical')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              urgencyFilter === 'critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 hover:bg-red-100 text-red-700'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Urgent &lt; 7d ({criticalCount})
          </button>

          <button
            onClick={() => setUrgencyFilter('warning')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              urgencyFilter === 'warning'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
            }`}
          >
            <Clock className="w-3 h-3" />
            Approaching 8-30d ({warningCount})
          </button>

          <button
            onClick={() => setUrgencyFilter('in_renewal')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              urgencyFilter === 'in_renewal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            In Renewal ({inRenewalCount})
          </button>

          <button
            onClick={() => setUrgencyFilter('active')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              urgencyFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Healthy &gt; 30d
          </button>
        </div>
      </div>

      {/* Results Content */}
      {processedReminders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Reminders Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No compliance records match your current search and filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setUrgencyFilter('all');
              setSelectedGroupId('all');
              setSelectedCategoryId('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedReminders.map((permit) => (
            <ReminderCard
              key={permit.id}
              permit={permit}
              asset={assetMap.get(permit.assetId)}
              category={categoryMap.get(permit.categoryId)}
              role={role}
              onOpenAssetDrawer={onOpenAssetDrawer}
              onOpenLogRenewal={onLogRenewal}
              onMarkInRenewal={onMarkInRenewal}
              onOpenDocViewer={onViewDoc}
              onEditReminder={onEditPermit}
              onDeleteReminder={onDeletePermit}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <PermitsTable
            permits={processedReminders}
            assets={assets}
            categories={categories}
            role={role}
            onOpenAssetDrawer={onOpenAssetDrawer}
            onOpenLogRenewal={onLogRenewal}
            onMarkInRenewal={onMarkInRenewal}
            onOpenDocViewer={onViewDoc}
            onEditReminder={onEditPermit}
            onDeleteReminder={onDeletePermit}
          />
        </div>
      )}
    </div>
  );
}
