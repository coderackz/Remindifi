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
  | 'calendar'
  | 'categories'
  | 'notifications'
  | 'email_templates'
  | 'settings';

export default function App() {
  // Authentication State: Landing page defaults directly to Login Screen
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem('remindifi_active_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Storage unavailable or disabled
    }
    return null;
  });

  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [role, setRole] = useState<Role>(() => {
    try {
      const saved = sessionStorage.getItem('remindifi_active_session');
      if (saved) {
        return JSON.parse(saved).role || 'admin';
      }
    } catch {}
    return 'admin';
  });

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
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

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
    // Security Patch: Prevent CSV Formula Injection (CWE-1236)
    const sanitizeCsvCell = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      let str = String(val).trim();
      // If cell begins with unsafe spreadsheet formula characters (=, +, -, @, tab, CR)
      if (/^[=\+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      'Permit ID',
      'Asset Identifier',
      'Category',
      'Authority',
      'Permit #',
      'Issue Date',
      'Expiry Date',
      'Cost AED',
      'Status',
    ].map(sanitizeCsvCell);

    const rows = permits.map((p) => {
      const asset = assetMap.get(p.assetId);
      const cat = categoryMap.get(p.categoryId);
      return [
        sanitizeCsvCell(p.id),
        sanitizeCsvCell(asset?.identifier || ''),
        sanitizeCsvCell(cat?.name || ''),
        sanitizeCsvCell(cat?.issuingAuthority || ''),
        sanitizeCsvCell(p.permitNumber),
        sanitizeCsvCell(p.issueDate),
        sanitizeCsvCell(p.expiryDate),
        sanitizeCsvCell(p.cost),
        sanitizeCsvCell(p.status),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
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
      const updatedUser = {
        ...currentUser,
        role: newRole,
      };
      setCurrentUser(updatedUser);
      try {
        sessionStorage.setItem('remindifi_active_session', JSON.stringify(updatedUser));
      } catch {}
    }
  };

  // ---------------------------------------------------------------------------
  // AUTH GUARD: If not logged in, show Login Screen (Landing Page)
  // ---------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={(user) => {
          setCurrentUser(user);
          setRole(user.role);
          try {
            sessionStorage.setItem('remindifi_active_session', JSON.stringify(user));
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEBF8] text-[#1E244B] flex flex-col md:flex-row">
      {/* 1. Left Curved Indigo/Violet Sidebar (Exact match to reference design on desktop, docked bottom bar on mobile) */}
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
          onSignOut={() => {
            try {
              sessionStorage.removeItem('remindifi_active_session');
            } catch {}
            setCurrentUser(null);
          }}
          onOpenAddPermit={() => handleOpenAttachPermit()}
          onExportData={handleExportData}
          unreadCount={metrics.criticalCount}
          notifications={notificationLogs}
          onClearNotifications={() => setNotificationLogs([])}
        />

        {/* Content Body - Responsive margins and bottom padding for mobile safe area */}
        <main className="mt-4 sm:mt-8 lg:mt-10 px-3 sm:px-6 lg:px-10 pb-28 md:pb-12 space-y-6 sm:space-y-8 max-w-[1500px] w-full mx-auto">
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
                annualBudget={metrics.totalSpend}
                onViewBudget={() => setIsBudgetModalOpen(true)}
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
                onViewCalendar={() => setCurrentTab('calendar')}
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
          {/* TAB: RENEWAL CALENDAR (INTERACTIVE TIMELINE & MONTH MATRIX)       */}
          {/* ================================================================= */}
          {currentTab === 'calendar' && (
            <RenewalCalendar
              permits={permits}
              assets={assets}
              categories={categories}
              role={role}
              onOpenAssetDrawer={setDrawerAssetId}
              onOpenLogRenewal={setLogRenewalPermitId}
              onOpenDocViewer={setViewingDocPermit}
            />
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
          {currentTab === 'settings' && (
            <SettingsView
              role={role}
              onRoleChange={handleRoleChange}
              onNavigateToDashboard={() => setCurrentTab('dashboard')}
            />
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

      {/* 8. Annual Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5E5CE6]/10 text-[#5E5CE6] flex items-center justify-center font-black">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Annual Compliance Budget</h3>
                  <p className="text-xs text-slate-400 font-medium">Permit renewal costs & department allocations</p>
                </div>
              </div>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FAF9FF] border border-[#5E5CE6]/15 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Annual Spend</p>
                <p className="text-2xl font-black text-[#5E5CE6] mt-1">{formatAED(metrics.totalSpend)}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Across {metrics.totalPermits} managed permits
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average / Renewal</p>
                <p className="text-2xl font-black text-slate-800 mt-1">
                  {formatAED(metrics.totalPermits > 0 ? Math.round(metrics.totalSpend / metrics.totalPermits) : 0)}
                </p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Government & statutory fees</p>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Spend by Permit Category</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const catPermits = permits.filter((p) => p.categoryId === cat.id);
                  const catSpend = catPermits.reduce((acc, p) => acc + (p.cost || 0), 0);
                  const pct = metrics.totalSpend > 0 ? Math.round((catSpend / metrics.totalSpend) * 100) : 0;
                  return (
                    <div key={cat.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{cat.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{cat.issuingAuthority} • {catPermits.length} permits</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-900">{formatAED(catSpend)}</div>
                        <div className="text-[10px] font-bold text-[#5E5CE6]">{pct}% of budget</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsBudgetModalOpen(false);
                  handleExportData();
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                Export Budget Ledger (.xls)
              </button>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#2C276E] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
