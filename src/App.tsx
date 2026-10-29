/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  INITIAL_ASSET_GROUPS,
  INITIAL_PERMIT_CATEGORIES,
  INITIAL_ASSETS,
  INITIAL_PERMITS,
  INITIAL_RENEWAL_HISTORY,
  INITIAL_NOTIFICATION_LOGS,
} from './data/initialData';
import { DEMO_USERS } from './data/defaultSettings';
import {
  AssetGroup,
  PermitCategory,
  Asset,
  Permit,
  RenewalHistory,
  NotificationLog,
  Role,
  UrgencyFilter,
  User,
} from './types';
import {
  calculateFleetMetrics,
  getPermitUrgency,
  calculateDaysRemaining,
  formatAED,
} from './utils/compliance';
import { Sidebar } from './components/Sidebar';
import { CurvedSidebar } from './components/CurvedSidebar';
import { Header } from './components/Header';
import { TopNavBar } from './components/TopNavBar';
import { TopSectionWidgets } from './components/TopSectionWidgets';
import { MiddleSectionWidgets } from './components/MiddleSectionWidgets';
import { BottomSectionWidgets } from './components/BottomSectionWidgets';
import { LoginScreen } from './components/LoginScreen';
import { ReminderCard } from './components/ReminderCard';
import { AssetCard } from './components/AssetCard';
import { PermitsTable } from './components/PermitsTable';
import { AssetDrawer } from './components/AssetDrawer';
import { AllRemindersView } from './components/AllRemindersView';
import { SettingsView } from './components/SettingsView';
import { EmailTemplatesView } from './components/EmailTemplatesView';
import { QuickAddReminderModal } from './components/QuickAddReminderModal';
import { EditReminderModal } from './components/EditReminderModal';
import { AddPermitModal } from './components/AddPermitModal';
import { AddAssetModal } from './components/AddAssetModal';
import { LogRenewalModal } from './components/LogRenewalModal';
import { CategoriesView } from './components/CategoriesView';
import { NotificationsView } from './components/NotificationsView';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { RenewalCalendar } from './components/RenewalCalendar';
import {
  LayoutGrid,
  Calendar as CalendarIcon,
  Table as TableIcon,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Coins,
  Zap,
  Plus,
  BellRing,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export type AppTab =
  | 'dashboard'
  | 'all_reminders'
  | 'categories'
  | 'notifications'
  | 'email_templates'
  | 'settings';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0]);

  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [role, setRole] = useState<Role>('admin');

  // Core Relational Data State
  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>(INITIAL_ASSET_GROUPS);
  const [categories, setCategories] = useState<PermitCategory[]>(INITIAL_PERMIT_CATEGORIES);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [permits, setPermits] = useState<Permit[]>(INITIAL_PERMITS);
  const [renewalHistory, setRenewalHistory] = useState<RenewalHistory[]>(INITIAL_RENEWAL_HISTORY);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(INITIAL_NOTIFICATION_LOGS);

  // Filters & Search for Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUrgencyFilter, setActiveUrgencyFilter] = useState<UrgencyFilter>('all');
  const [selectedAssetGroupId, setSelectedAssetGroupId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'reminders' | 'calendar' | 'table' | 'grouped'>('reminders');

  // Modals & Drawer State
  const [drawerAssetId, setDrawerAssetId] = useState<string | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState<Permit | null>(null);
  const [isAddPermitOpen, setIsAddPermitOpen] = useState(false);
  const [attachToAssetId, setAttachToAssetId] = useState<string | undefined>(undefined);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [logRenewalPermitId, setLogRenewalPermitId] = useState<string | null>(null);
  const [viewingDocPermit, setViewingDocPermit] = useState<Permit | null>(null);

  // Computed Metrics
  const metrics = useMemo(() => calculateFleetMetrics(permits), [permits]);

  // Lookup maps
  const categoryMap = useMemo(() => new Map<string, PermitCategory>(categories.map((c) => [c.id, c])), [categories]);
  const assetMap = useMemo(() => new Map<string, Asset>(assets.map((a) => [a.id, a])), [assets]);

  // ---------------------------------------------------------------------------
  // DASHBOARD SPECIFIC: ONLY NEAR-TO-EXPIRY PERMITS (<= 30 Days or Expired/Urgent)
  // Sorted strictly based on near to expiry (ascending days remaining)
  // ---------------------------------------------------------------------------
  const dashboardNearExpiryPermits = useMemo(() => {
    // 1. Filter: ONLY near to expiry (<= 30 days remaining or urgent / critical / expired)
    const nearList = permits.filter((permit) => {
      const days = calculateDaysRemaining(permit.expiryDate);
      const urgency = getPermitUrgency(permit);
      return days <= 30 || urgency === 'critical' || urgency === 'warning' || urgency === 'expired';
    });

    // 2. Sort: Strictly based on near to expiry (closest deadline first)
    nearList.sort((a, b) => {
      const daysA = calculateDaysRemaining(a.expiryDate);
      const daysB = calculateDaysRemaining(b.expiryDate);
      return daysA - daysB;
    });

    // 3. Apply dashboard search and subgroup filters
    return nearList.filter((permit) => {
      const asset = assetMap.get(permit.assetId);
      const category = categoryMap.get(permit.categoryId);

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPermitNo = permit.permitNumber.toLowerCase().includes(q);
        const matchesAssetId = asset?.identifier.toLowerCase().includes(q);
        const matchesAssetName = asset?.name.toLowerCase().includes(q);
        const matchesCategory = category?.name.toLowerCase().includes(q);
        const matchesAuthority = category?.issuingAuthority.toLowerCase().includes(q);
        const matchesNotes = permit.notes?.toLowerCase().includes(q);
        if (!matchesPermitNo && !matchesAssetId && !matchesAssetName && !matchesCategory && !matchesAuthority && !matchesNotes) {
          return false;
        }
      }

      if (activeUrgencyFilter !== 'all') {
        const urgency = getPermitUrgency(permit);
        if (activeUrgencyFilter === 'critical' && urgency !== 'critical' && urgency !== 'expired') return false;
        if (activeUrgencyFilter === 'warning' && urgency !== 'warning') return false;
        if (activeUrgencyFilter === 'in_renewal' && urgency !== 'in_renewal') return false;
        if (activeUrgencyFilter === 'active' && urgency !== 'healthy') return false;
        if (activeUrgencyFilter === 'expired' && urgency !== 'expired') return false;
      }

      if (selectedAssetGroupId !== 'all' && asset?.assetGroupId !== selectedAssetGroupId) {
        return false;
      }

      if (selectedCategoryId !== 'all' && permit.categoryId !== selectedCategoryId) {
        return false;
      }

      return true;
    });
  }, [permits, searchQuery, activeUrgencyFilter, selectedAssetGroupId, selectedCategoryId, assetMap, categoryMap]);

  // Filtered Assets for Dashboard Grouped View
  const dashboardFilteredAssets = useMemo(() => {
    const matchingPermitAssetIds = new Set(dashboardNearExpiryPermits.map((p) => p.assetId));
    return assets.filter((asset) => {
      if (searchQuery.trim() || activeUrgencyFilter !== 'all' || selectedCategoryId !== 'all') {
        const matchesSearch =
          asset.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        const hasMatchingPermits = matchingPermitAssetIds.has(asset.id);
        if (!hasMatchingPermits && !matchesSearch) return false;
      }

      if (selectedAssetGroupId !== 'all' && asset.assetGroupId !== selectedAssetGroupId) {
        return false;
      }

      return matchingPermitAssetIds.has(asset.id);
    });
  }, [assets, dashboardNearExpiryPermits, searchQuery, activeUrgencyFilter, selectedCategoryId, selectedAssetGroupId]);

  // --- Handlers: Permits / Reminders ---

  const handleOpenAttachPermit = (assetId?: string) => {
    setAttachToAssetId(assetId);
    setIsAddPermitOpen(true);
  };

  const handleCreatePermit = (newPermitData: Omit<Permit, 'id'>) => {
    const newPermit: Permit = {
      ...newPermitData,
      id: `permit-${Date.now()}`,
    };
    setPermits((prev) => [newPermit, ...prev]);
  };

  const handleEditPermit = (updatedPermit: Permit) => {
    setPermits((prev) =>
      prev.map((p) => (p.id === updatedPermit.id ? updatedPermit : p))
    );
  };

  const handleDeletePermit = (permitId: string) => {
    setPermits((prev) => prev.filter((p) => p.id !== permitId));
    setRenewalHistory((prev) => prev.filter((h) => h.permitId !== permitId));
    setNotificationLogs((prev) => prev.filter((l) => l.permitId !== permitId));
  };

  // --- Handlers: Assets ---

  const handleCreateAsset = (newAssetData: Omit<Asset, 'id'>) => {
    const newAsset: Asset = {
      ...newAssetData,
      id: `asset-${Date.now()}`,
    };
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleDeleteAsset = (assetId: string) => {
    if (role !== 'admin') return;
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    setPermits((prev) => prev.filter((p) => p.assetId !== assetId));
  };

  // --- Handlers: Categories & Asset Groups ---

  const handleAddCategory = (category: Omit<PermitCategory, 'id'>) => {
    const newCategory: PermitCategory = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleEditCategory = (updatedCat: PermitCategory) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (role !== 'admin') return;
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const handleAddAssetGroup = (group: Omit<AssetGroup, 'id'>) => {
    const newGroup: AssetGroup = {
      ...group,
      id: `ag-${Date.now()}`,
    };
    setAssetGroups((prev) => [...prev, newGroup]);
  };

  const handleEditAssetGroup = (updatedGroup: AssetGroup) => {
    setAssetGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  const handleDeleteAssetGroup = (groupId: string) => {
    if (role !== 'admin') return;
    setAssetGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  // --- Handlers: In-Renewal & Log Renewal ---

  const handleMarkInRenewal = (permitId: string) => {
    setPermits((prev) =>
      prev.map((p) => (p.id === permitId ? { ...p, status: 'in_renewal' } : p))
    );
  };

  const handleLogRenewal = (data: {
    permitId: string;
    newIssueDate: string;
    newExpiryDate: string;
    renewalCost: number;
    fileName: string;
    notes: string;
  }) => {
    const target = permits.find((p) => p.id === data.permitId);
    if (!target) return;

    const historyItem: RenewalHistory = {
      id: `hist-${Date.now()}`,
      permitId: target.id,
      previousExpiryDate: target.expiryDate,
      renewedOnDate: data.newIssueDate,
      cost: data.renewalCost,
      renewedBy: role === 'admin' ? 'System Administrator' : 'PRO Fleet Operations',
      archivedFileName: data.fileName,
      notes: data.notes,
    };
    setRenewalHistory((prev) => [historyItem, ...prev]);

    setPermits((prev) =>
      prev.map((p) =>
        p.id === data.permitId
          ? {
              ...p,
              issueDate: data.newIssueDate,
              expiryDate: data.newExpiryDate,
              cost: data.renewalCost,
              status: 'active',
              fileName: data.fileName,
              notes: data.notes,
              lastRenewedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const handleTriggerDailyCron = () => {
    const newLogs: NotificationLog[] = [];
    const nowIso = new Date().toISOString();

    for (const permit of permits) {
      const days = calculateDaysRemaining(permit.expiryDate);
      const asset = assetMap.get(permit.assetId);
      const category = categoryMap.get(permit.categoryId);

      const matchingMilestones = (permit.leadDays || []).filter((ld) => days <= ld && days >= ld - 1);
      if (matchingMilestones.length > 0 || days <= 7) {
        newLogs.push({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          permitId: permit.id,
          assetIdentifier: asset?.identifier || 'Asset',
          milestoneDays: days,
          sentAt: nowIso,
          recipientEmail: permit.assignedToEmail || 'compliance@remindifi.ae',
          status: 'sent',
          digestSubject: `Daily Alert: ${category?.name} expires in ${days} days for ${asset?.identifier}`,
        });
      }
    }

    setNotificationLogs((prev) => [...newLogs, ...prev]);
  };

  const handleExportData = () => {
    const headers = ['Permit ID', 'Asset Identifier', 'Category', 'Authority', 'Permit #', 'Issue Date', 'Expiry Date', 'Cost AED', 'Status'];
    const rows = permits.map((p) => {
      const asset = assetMap.get(p.assetId);
      const cat = categoryMap.get(p.categoryId);
      return [
        p.id,
        asset?.identifier || '',
        cat?.name || '',
        cat?.issuingAuthority || '',
        p.permitNumber,
        p.issueDate,
        p.expiryDate,
        p.cost,
        p.status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Remindifi_Reminders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Role change with profile synchronization
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: newRole,
      });
    }
  };

  // ---------------------------------------------------------------------------
  // AUTH GUARD: If not logged in, show Login Screen
  // ---------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={(user) => {
          setCurrentUser(user);
          setRole(user.role);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEBF8] text-[#1E244B] flex flex-row">
      {/* 1. Left Curved Indigo/Violet Sidebar (Exact match to reference design) */}
      <CurvedSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as AppTab)}
        role={role}
        unreadAlertsCount={metrics.criticalCount}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navigation Bar with search, light/dark, export and action button */}
        <TopNavBar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab as AppTab)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          role={role}
          currentUser={currentUser}
          onSignOut={() => setCurrentUser(null)}
          onOpenAddPermit={() => handleOpenAttachPermit()}
          onExportData={handleExportData}
          unreadCount={metrics.criticalCount}
        />

        {/* Content Body */}
        <main className="px-6 lg:px-10 pb-10 space-y-6 max-w-[1500px] w-full mx-auto">
          {/* ================================================================= */}
          {/* TAB: DASHBOARD (EXACT REFERENCE DESIGN WIDGETS + QUEUE)           */}
          {/* ================================================================= */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 1. Top Section: Hero Greeting + 4 Illustrated Action Cards */}
              <TopSectionWidgets
                currentUser={currentUser}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                onOpenAddAsset={() => setIsAddAssetOpen(true)}
                onOpenAddPermit={() => handleOpenAttachPermit()}
                onExportData={handleExportData}
                urgentCount={metrics.criticalCount + metrics.expiredCount}
              />

              {/* 2. Middle Section: Urgent Notifications + Assignments + Mini Calendar Timeline */}
              <MiddleSectionWidgets
                nearExpiryPermits={dashboardNearExpiryPermits}
                allPermits={permits}
                notificationLogs={notificationLogs}
                assetMap={assetMap}
                categoryMap={categoryMap}
                onLogRenewal={(id) => setLogRenewalPermitId(id)}
                onEditPermit={(p) => setEditingPermit(p)}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                onSelectAsset={(id) => setDrawerAssetId(id)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onViewCalendar={() => setCurrentTab('all_reminders')}
              />

              {/* 3. Bottom Section: Upcoming Renewals + Email Templates Action Widget + Gauges & Inspection */}
              <BottomSectionWidgets
                permits={permits}
                assetMap={assetMap}
                categoryMap={categoryMap}
                onTriggerDailyCron={handleTriggerDailyCron}
                onLogRenewal={(id) => setLogRenewalPermitId(id)}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                criticalCount={metrics.criticalCount + metrics.expiredCount}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onSelectAsset={(id) => setDrawerAssetId(id)}
              />
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: ALL REMINDERS (NEW MODULE: COMPLETE CATALOG OF ALL PERMITS)  */}
          {/* ================================================================= */}
          {currentTab === 'all_reminders' && (
            <AllRemindersView
              permits={permits}
              assets={assets}
              categories={categories}
              assetGroups={assetGroups}
              role={role}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onOpenAttachPermit={handleOpenAttachPermit}
              onOpenAssetDrawer={setDrawerAssetId}
              onEditPermit={setEditingPermit}
              onMarkInRenewal={handleMarkInRenewal}
              onLogRenewal={(id) => setLogRenewalPermitId(id)}
              onDeletePermit={handleDeletePermit}
              onViewDoc={setViewingDocPermit}
            />
          )}

          {/* ================================================================= */}
          {/* TAB: CATEGOORY & GROUPS                                           */}
          {/* ================================================================= */}
          {currentTab === 'categories' && (
            <CategoriesView
              assetGroups={assetGroups}
              categories={categories}
              role={role}
              onAddAssetGroup={handleAddAssetGroup}
              onEditAssetGroup={handleEditAssetGroup}
              onDeleteAssetGroup={handleDeleteAssetGroup}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* ================================================================= */}
          {/* TAB: NOTIFICATIONS & DAILY CRON SIMULATOR                         */}
          {/* ================================================================= */}
          {currentTab === 'notifications' && (
            <NotificationsView
              permits={permits}
              assets={assets}
              categories={categories}
              notificationLogs={notificationLogs}
              onTriggerCron={handleTriggerDailyCron}
            />
          )}

          {/* ================================================================= */}
          {/* TAB: EMAIL TEMPLATES (CUSTOMIZATION & LIVE IN-BOX PREVIEW)        */}
          {/* ================================================================= */}
          {currentTab === 'email_templates' && (
            <EmailTemplatesView role={role} />
          )}

          {/* ================================================================= */}
          {/* TAB: SETTINGS (RBAC PERMISSIONS MATRIX & SMTP SERVER CONFIG)     */}
          {/* ================================================================= */}
          {currentTab === 'settings' && (
            <SettingsView role={role} onRoleChange={handleRoleChange} />
          )}
        </main>
      </div>

      {/* --- Slide-Over Drawers & Modals --- */}

      {/* 1. Quick Add Reminder Modal */}
      {isQuickAddOpen && (
        <QuickAddReminderModal
          isOpen={isQuickAddOpen}
          assets={assets}
          categories={categories}
          onClose={() => setIsQuickAddOpen(false)}
          onSubmitReminder={handleCreatePermit}
        />
      )}

      {/* 2. Edit Reminder Modal (ADD, EDIT & REMOVE OPTIONS) */}
      {editingPermit && (
        <EditReminderModal
          permit={editingPermit}
          assets={assets}
          categories={categories}
          onClose={() => setEditingPermit(null)}
          onSubmitEdit={handleEditPermit}
          onDeletePermit={handleDeletePermit}
        />
      )}

      {/* 3. Asset Detail Slide-Over Drawer (1:N Binding View) */}
      {drawerAssetId && (
        <AssetDrawer
          assetId={drawerAssetId}
          assets={assets}
          permits={permits}
          categories={categories}
          assetGroups={assetGroups}
          renewalHistory={renewalHistory}
          role={role}
          onClose={() => setDrawerAssetId(null)}
          onOpenAttachPermit={handleOpenAttachPermit}
          onOpenLogRenewal={setLogRenewalPermitId}
          onMarkInRenewal={handleMarkInRenewal}
          onOpenDocViewer={setViewingDocPermit}
        />
      )}

      {/* 4. Add / Attach Permit Modal with Gemini AI Scanner */}
      {isAddPermitOpen && (
        <AddPermitModal
          isOpen={isAddPermitOpen}
          preselectedAssetId={attachToAssetId}
          assets={assets}
          categories={categories}
          onClose={() => {
            setIsAddPermitOpen(false);
            setAttachToAssetId(undefined);
          }}
          onSubmitPermit={handleCreatePermit}
        />
      )}

      {/* 5. Add Asset Modal */}
      {isAddAssetOpen && (
        <AddAssetModal
          isOpen={isAddAssetOpen}
          assetGroups={assetGroups}
          onClose={() => setIsAddAssetOpen(false)}
          onSubmitAsset={handleCreateAsset}
        />
      )}

      {/* 6. Log Renewal Modal */}
      {logRenewalPermitId && (
        <LogRenewalModal
          permitId={logRenewalPermitId}
          permits={permits}
          assets={assets}
          categories={categories}
          onClose={() => setLogRenewalPermitId(null)}
          onSubmitRenewal={handleLogRenewal}
        />
      )}

      {/* 7. Document Viewer Modal */}
      {viewingDocPermit && (
        <DocumentViewerModal
          permit={viewingDocPermit}
          assets={assets}
          categories={categories}
          onClose={() => setViewingDocPermit(null)}
        />
      )}
    </div>
  );
}
