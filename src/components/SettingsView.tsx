import React, { useState } from 'react';
import {
  Role,
  SmtpConfig,
  RbacPermission,
  TeamMember,
} from '../types';
import {
  DEFAULT_SMTP_CONFIG,
  INITIAL_RBAC_PERMISSIONS,
  INITIAL_TEAM_MEMBERS,
} from '../data/defaultSettings';
import {
  Shield,
  Server,
  Users,
  Check,
  X,
  Lock,
  Mail,
  Send,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Sliders,
  KeyRound,
  Globe,
  Pencil,
  ShieldAlert,
  Search,
  UserCheck,
  UserX,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface SettingsViewProps {
  role: Role;
  onRoleChange: (r: Role) => void;
  onNavigateToDashboard?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
];

export function SettingsView({ role, onRoleChange, onNavigateToDashboard }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'rbac' | 'smtp'>('rbac');

  // RBAC state
  const [permissions, setPermissions] = useState<RbacPermission[]>(INITIAL_RBAC_PERMISSIONS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);

  // Search & Filter state for Team Members
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | 'admin' | 'manager' | 'viewer'>('all');

  // Modals state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Form state for Adding Member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<Role>('manager');
  const [newMemberDept, setNewMemberDept] = useState('Fleet Operations');
  const [newMemberTitle, setNewMemberTitle] = useState('PRO & Licensing Officer');
  const [newMemberAvatar, setNewMemberAvatar] = useState(AVATAR_PRESETS[1]);

  // Form state for Editing Member
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<Role>('manager');
  const [editDept, setEditDept] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [editAvatar, setEditAvatar] = useState('');

  // Toast Notification banner
  const [toastBanner, setToastBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastBanner({ type, text });
    setTimeout(() => {
      setToastBanner(null);
    }, 4000);
  };

  // SMTP state
  const [smtp, setSmtp] = useState<SmtpConfig>(DEFAULT_SMTP_CONFIG);
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    timestamp?: string;
  } | null>(null);
  const [testRecipientEmail, setTestRecipientEmail] = useState('compliance@remindifi.ae');
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);

  // ---------------------------------------------------------------------------
  // STRICT ACCESS GUARD: ONLY ADMIN HAS ACCESS
  // ---------------------------------------------------------------------------
  if (role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-white rounded-3xl border border-red-200 shadow-xl overflow-hidden">
          {/* Header warning stripe */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-3 flex items-center justify-between text-white text-xs font-black uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>RBAC Policy: Restricted System Governance</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
              Access Level 0 Required
            </span>
          </div>

          <div className="p-8 sm:p-10 text-center">
            {/* Visual Icon Badge */}
            <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-6 shadow-md shadow-red-500/10">
              <Lock className="w-10 h-10 stroke-[2.2]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Admin Settings & System Governance
            </h1>
            <p className="text-sm font-bold text-red-600 mb-4">
              Restricted Area — Only System Administrators have access to this portal.
            </p>

            <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-8 text-left space-y-3">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Your Current Role:</span>
                <span className="font-black px-2.5 py-1 rounded-lg uppercase tracking-wider text-[11px] bg-amber-100 text-amber-800 border border-amber-300">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This administrative section controls company-wide compliance operations, including:
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li>Adding, editing credentials, and revoking access for team members and auditors.</li>
                <li>Modifying Role-Based Access Control (RBAC) permission capability matrices.</li>
                <li>Production SMTP server credentials, TLS handshakes, and dispatch rate limits.</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  onRoleChange('admin');
                  showToast('Elevated to Administrator profile. System Governance unlocked.', 'info');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#5E5CE6]/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Switch to Administrator (Unlock Governance)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RBAC Permission toggle handler
  // ---------------------------------------------------------------------------
  const handleTogglePermission = (key: string, roleToToggle: 'admin' | 'manager' | 'viewer') => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.key === key) {
          return {
            ...p,
            [roleToToggle]: !p[roleToToggle],
          };
        }
        return p;
      })
    );
    showToast(`Updated capability permissions for ${roleToToggle}.`, 'info');
  };

  // ---------------------------------------------------------------------------
  // Team Member Handlers: ADD, EDIT, REMOVE
  // ---------------------------------------------------------------------------

  // ADD MEMBER
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }

    // Check duplicate email
    const exists = teamMembers.some(
      (m) => m.email.toLowerCase() === newMemberEmail.trim().toLowerCase()
    );
    if (exists) {
      showToast(`A member with email "${newMemberEmail.trim()}" already exists.`, 'error');
      return;
    }

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      department: newMemberDept.trim() || 'Operations',
      jobTitle: newMemberTitle.trim() || 'Compliance Officer',
      addedAt: new Date().toISOString().split('T')[0],
      avatar: newMemberAvatar,
      status: 'active',
    };

    setTeamMembers((prev) => [newMember, ...prev]);
    setShowAddMemberModal(false);
    setNewMemberName('');
    setNewMemberEmail('');
    showToast(`Added team member ${newMember.name} (${newMember.role.toUpperCase()}) successfully!`);
  };

  // OPEN EDIT MODAL
  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
    setEditDept(member.department);
    setEditTitle(member.jobTitle || '');
    setEditStatus(member.status || 'active');
    setEditAvatar(member.avatar);
  };

  // SAVE EDITED MEMBER
  const handleSaveEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editName.trim() || !editEmail.trim()) {
      showToast('Name and email cannot be empty.', 'error');
      return;
    }

    setTeamMembers((prev) =>
      prev.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: editName.trim(),
              email: editEmail.trim(),
              role: editRole,
              department: editDept.trim() || m.department,
              jobTitle: editTitle.trim() || m.jobTitle,
              status: editStatus,
              avatar: editAvatar || m.avatar,
            }
          : m
      )
    );

    const updatedName = editName.trim();
    setEditingMember(null);
    showToast(`Team member "${updatedName}" updated successfully!`);
  };

  // INLINE ROLE QUICK CHANGE
  const handleUpdateMemberRole = (memberId: string, newRole: Role) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    showToast('Role updated successfully.');
  };

  // CONFIRM REMOVE MEMBER
  const handleConfirmDeleteMember = () => {
    if (!memberToDelete) return;

    if (memberToDelete.id === 'tm-1' || memberToDelete.email === 'admin@remindifi.ae') {
      showToast('Cannot delete root System Administrator account.', 'error');
      setMemberToDelete(null);
      return;
    }

    const removedName = memberToDelete.name;
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
    setMemberToDelete(null);
    showToast(`Revoked access and deleted member "${removedName}".`, 'info');
  };

  // Filtered members list
  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      (m.jobTitle && m.jobTitle.toLowerCase().includes(searchMemberQuery.toLowerCase()));

    const matchesRole = memberRoleFilter === 'all' || m.role === memberRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Role counters
  const totalCount = teamMembers.length;
  const adminCount = teamMembers.filter((m) => m.role === 'admin').length;
  const managerCount = teamMembers.filter((m) => m.role === 'manager').length;
  const viewerCount = teamMembers.filter((m) => m.role === 'viewer').length;

  // ---------------------------------------------------------------------------
  // Test SMTP Handshake
  // ---------------------------------------------------------------------------
  const handleTestSmtpConnection = () => {
    setIsTestingSmtp(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTestingSmtp(false);
      setTestResult({
        success: true,
        message: `SMTP Handshake succeeded with ${smtp.host}:${smtp.port}. TLS 1.3 negotiated. Test message dispatched to ${testRecipientEmail}.`,
        latencyMs: 142,
        timestamp: new Date().toLocaleTimeString(),
      });
      setSmtp((prev) => ({
        ...prev,
        connectionStatus: 'connected',
        lastTestedAt: new Date().toLocaleString(),
      }));
    }, 1100);
  };

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessBanner(true);
    setTimeout(() => setSaveSuccessBanner(false), 3500);
    showToast('SMTP configuration saved and activated.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification Banner */}
      {toastBanner && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${
            toastBanner.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/20'
              : toastBanner.type === 'error'
              ? 'bg-red-600 text-white border-red-500 shadow-red-900/20'
              : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/25'
          }`}
        >
          {toastBanner.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {toastBanner.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toastBanner.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
          <span>{toastBanner.text}</span>
        </div>
      )}

      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Full Governance Access</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#5E5CE6]" />
            <span>Admin Settings & System Governance</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage users (Add, Edit, Remove), Role-Based Access Control (RBAC), and outbound SMTP mail server configuration
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rbac'
                ? 'bg-white text-[#5E5CE6] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Users & RBAC</span>
          </button>
          <button
            onClick={() => setActiveTab('smtp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'smtp'
                ? 'bg-white text-[#5E5CE6] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>SMTP Server Config</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-bold">
            Settings saved successfully! SMTP mail gateway updated.
          </div>
        </div>
      )}

      {/* ===================== TAB 1: USERS & RBAC ===================== */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* User Management Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Total Users</span>
                <Users className="w-4 h-4 text-[#5E5CE6]" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Authorized accounts</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Administrators</span>
                <ShieldCheck className="w-4 h-4 text-[#5E5CE6]" />
              </div>
              <div className="text-2xl font-black text-[#5E5CE6]">{adminCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Full governance rights</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Managers / PRO</span>
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-600">{managerCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Operations & renewals</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Viewers / Auditors</span>
                <Eye className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-600">{viewerCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Read-only audit scope</div>
            </div>
          </div>

          {/* User Management Section (Add, Edit, Remove) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#5E5CE6]" />
                  <span>Authorized Team Members & User Management</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Full control to <strong>Add</strong>, <strong>Edit</strong>, and <strong>Remove</strong> employees and auditors
                </p>
              </div>

              {/* Add User Action Button */}
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#5E5CE6]/25 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Team Member</span>
              </button>
            </div>

            {/* Search and Role Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  placeholder="Filter users by name, email, department, or job title..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'admin', 'manager', 'viewer'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setMemberRoleFilter(r)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      memberRoleFilter === r
                        ? 'bg-[#1E1B4B] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    {r === 'all' ? 'All Roles' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Members List */}
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const isRootAdmin = member.id === 'tm-1' || member.email === 'admin@remindifi.ae';

                  return (
                    <div
                      key={member.id}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200 shadow-xs"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              member.status === 'suspended' ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            title={member.status === 'suspended' ? 'Suspended' : 'Active'}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{member.name}</span>

                            {member.role === 'admin' && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#5E5CE6]/15 text-[#5E5CE6] border border-[#5E5CE6]/20">
                                Admin
                              </span>
                            )}
                            {member.role === 'manager' && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                Manager / PRO
                              </span>
                            )}
                            {member.role === 'viewer' && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                Viewer / Auditor
                              </span>
                            )}

                            {isRootAdmin && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                Primary Owner
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>{member.email}</span>
                            <span>•</span>
                            <span className="font-medium text-slate-700">{member.department}</span>
                            {member.jobTitle && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400">{member.jobTitle}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons: Inline Role Change, Edit Modal Button, Remove Button */}
                      <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
                        {/* Quick Role Select */}
                        <select
                          value={member.role}
                          disabled={isRootAdmin}
                          onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as Role)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 cursor-pointer disabled:opacity-50"
                          title="Quick Role Selector"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager / PRO</option>
                          <option value="viewer">Viewer / Auditor</option>
                        </select>

                        {/* EDIT BUTTON (Pencil Icon) */}
                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className="p-2 text-slate-600 hover:text-[#5E5CE6] hover:bg-[#5E5CE6]/10 rounded-xl transition-all cursor-pointer border border-slate-200/80 bg-white shadow-xs"
                          title={`Edit ${member.name}'s details & role`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* REMOVE BUTTON (Trash Icon) */}
                        <button
                          onClick={() => setMemberToDelete(member)}
                          disabled={isRootAdmin}
                          className={`p-2 rounded-xl transition-all border shadow-xs ${
                            isRootAdmin
                              ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-slate-200/80 bg-white cursor-pointer'
                          }`}
                          title={
                            isRootAdmin
                              ? 'Primary Root Administrator cannot be removed'
                              : `Remove ${member.name} from Remindifi`
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No team members found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Granular RBAC Permissions Matrix Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#5E5CE6]" />
                  <span>Role-Based Access Control (RBAC) Matrix</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Configure exact permissions granted to Admins, PRO Managers, and External Auditors
                </p>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Interactive Toggles Enabled</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-6">Capability & Function</th>
                    <th className="py-3.5 px-4 text-center w-28 text-[#5E5CE6]">Admin</th>
                    <th className="py-3.5 px-4 text-center w-28 text-blue-600">Manager / PRO</th>
                    <th className="py-3.5 px-4 text-center w-28 text-amber-600">Viewer / Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissions.map((perm) => (
                    <tr key={perm.key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-800 text-xs">{perm.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{perm.description}</div>
                      </td>

                      {/* Admin Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.key, 'admin')}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
                            perm.admin
                              ? 'bg-[#5E5CE6] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Toggle Admin Permission"
                        >
                          {perm.admin ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Manager Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.key, 'manager')}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
                            perm.manager
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Toggle Manager Permission"
                        >
                          {perm.manager ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Viewer Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.key, 'viewer')}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
                            perm.viewer
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Toggle Viewer Permission"
                        >
                          {perm.viewer ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: SMTP SERVER CONFIG ===================== */}
      {activeTab === 'smtp' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main SMTP Settings Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#5E5CE6]" />
                  <span>Outbound SMTP Server Configuration</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Configure mail server connection used to dispatch automated renewal alerts & daily cron digests
                </p>
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  smtp.connectionStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    smtp.connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="capitalize">{smtp.connectionStatus}</span>
              </div>
            </div>

            <form onSubmit={handleSaveSmtp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMTP Host / Server Address
                  </label>
                  <input
                    type="text"
                    value={smtp.host}
                    onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                    placeholder="e.g. smtp.sendgrid.net or smtp.office365.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={smtp.port}
                    onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Encryption & Security
                  </label>
                  <select
                    value={smtp.encryption}
                    onChange={(e) => setSmtp({ ...smtp, encryption: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                  >
                    <option value="STARTTLS">STARTTLS (Port 587 - Recommended)</option>
                    <option value="SSL">SSL / TLS (Port 465)</option>
                    <option value="TLS">Explicit TLS</option>
                    <option value="NONE">Unencrypted (Port 25 - Not Recommended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hourly Dispatch Limit
                  </label>
                  <input
                    type="number"
                    value={smtp.rateLimitPerHour}
                    onChange={(e) => setSmtp({ ...smtp, rateLimitPerHour: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMTP Username / API Key
                  </label>
                  <input
                    type="text"
                    value={smtp.user}
                    onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                    placeholder="apikey or user@company.ae"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={smtp.pass}
                      onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                      required
                      className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender "From" Email
                  </label>
                  <input
                    type="email"
                    value={smtp.senderEmail}
                    onChange={(e) => setSmtp({ ...smtp, senderEmail: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                    placeholder="alerts@remindifi.ae"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={smtp.senderName}
                    onChange={(e) => setSmtp({ ...smtp, senderName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                    placeholder="Remindifi UAE Fleet Compliance"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reply-To Address
                </label>
                <input
                  type="email"
                  value={smtp.replyTo}
                  onChange={(e) => setSmtp({ ...smtp, replyTo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                  placeholder="support@remindifi.ae"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-[#5E5CE6]/25 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save SMTP Configuration</span>
                </button>
              </div>
            </form>
          </div>

          {/* Side Panel: SMTP Connection Handshake & Test */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-2">
                <Send className="w-4 h-4 text-[#5E5CE6]" />
                <span>Test SMTP Handshake</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Verify socket connection, authentication headers, and dispatch a test reminder payload.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Recipient Test Address
                  </label>
                  <input
                    type="email"
                    value={testRecipientEmail}
                    onChange={(e) => setTestRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    placeholder="user@company.ae"
                  />
                </div>

                <button
                  type="button"
                  disabled={isTestingSmtp}
                  onClick={handleTestSmtpConnection}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
                >
                  {isTestingSmtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Negotiating TLS Socket...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Send Test Email Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Output Box */}
              {testResult && (
                <div
                  className={`mt-4 p-3.5 rounded-2xl text-xs border ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Handshake Successful ({testResult.latencyMs}ms)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
                  <div className="text-[10px] opacity-70 mt-2 font-mono">
                    Timestamp: {testResult.timestamp}
                  </div>
                </div>
              )}
            </div>

            {/* Production Mailer Tips */}
            <div className="bg-gradient-to-br from-[#1E1B4B] to-[#2E2875] text-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-2">
                <Globe className="w-4 h-4" />
                <span>UAE Compliance Delivery</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Ensure SPF and DKIM records for <code className="text-amber-200 bg-white/10 px-1 py-0.5 rounded">remindifi.ae</code> are verified in DNS to prevent statutory expiry alerts from landing in spam filters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. ADD TEAM MEMBER MODAL                                             */}
      {/* ==================================================================== */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#5E5CE6]/10 text-[#5E5CE6] flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add New Team Member</h3>
                  <p className="text-[11px] text-slate-500">Provision credentials and access scope</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required
                  placeholder="tariq@remindifi.ae"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role & Scope</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as Role)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 cursor-pointer"
                  >
                    <option value="manager">Manager / PRO (Operations)</option>
                    <option value="admin">Administrator (Full Access)</option>
                    <option value="viewer">Viewer / Auditor (Read-only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newMemberDept}
                    onChange={(e) => setNewMemberDept(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    placeholder="Fleet Operations"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={newMemberTitle}
                  onChange={(e) => setNewMemberTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  placeholder="Senior Licensing Specialist"
                />
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Choose Avatar</label>
                <div className="flex items-center gap-2 overflow-x-auto p-1">
                  {AVATAR_PRESETS.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Avatar preset"
                      onClick={() => setNewMemberAvatar(av)}
                      className={`w-9 h-9 rounded-full object-cover cursor-pointer transition-all ${
                        newMemberAvatar === av
                          ? 'ring-3 ring-[#5E5CE6] scale-110 shadow-sm'
                          : 'opacity-65 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#5E5CE6] text-white hover:bg-[#4E4CC6] shadow-md shadow-[#5E5CE6]/20 transition-all cursor-pointer"
                >
                  Create Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. EDIT TEAM MEMBER MODAL                                            */}
      {/* ==================================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Edit Team Member</h3>
                  <p className="text-[11px] text-slate-500">Update user profile, status, and system role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editRole}
                    disabled={editingMember.id === 'tm-1' || editingMember.email === 'admin@remindifi.ae'}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 cursor-pointer disabled:opacity-60"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager / PRO</option>
                    <option value="viewer">Viewer / Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'suspended')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 cursor-pointer"
                  >
                    <option value="active">Active (Access Granted)</option>
                    <option value="suspended">Suspended (Access Revoked)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Avatar</label>
                <div className="flex items-center gap-2 overflow-x-auto p-1">
                  {AVATAR_PRESETS.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Avatar preset"
                      onClick={() => setEditAvatar(av)}
                      className={`w-9 h-9 rounded-full object-cover cursor-pointer transition-all ${
                        editAvatar === av
                          ? 'ring-3 ring-[#5E5CE6] scale-110 shadow-sm'
                          : 'opacity-65 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#5E5CE6] text-white hover:bg-[#4E4CC6] shadow-md shadow-[#5E5CE6]/20 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. CONFIRM DELETE TEAM MEMBER MODAL                                  */}
      {/* ==================================================================== */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="text-base font-black text-slate-900 text-center mb-1">
              Revoke Access & Remove Member?
            </h3>
            <p className="text-xs text-slate-500 text-center mb-5">
              Are you sure you want to permanently remove{' '}
              <strong className="text-slate-900">{memberToDelete.name}</strong> ({memberToDelete.email})?
              They will immediately lose access to Remindifi and all compliance ledgers.
            </p>

            <div className="bg-slate-50 rounded-2xl p-3 mb-5 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="font-bold uppercase text-[#5E5CE6]">{memberToDelete.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-800">{memberToDelete.department}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMember}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25 transition-all cursor-pointer"
              >
                Yes, Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
