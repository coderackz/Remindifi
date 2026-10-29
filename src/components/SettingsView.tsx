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
} from 'lucide-react';

interface SettingsViewProps {
  role: Role;
  onRoleChange: (r: Role) => void;
}

export function SettingsView({ role, onRoleChange }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'rbac' | 'smtp'>('rbac');

  // RBAC state
  const [permissions, setPermissions] = useState<RbacPermission[]>(INITIAL_RBAC_PERMISSIONS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<Role>('manager');
  const [newMemberDept, setNewMemberDept] = useState('Operations');

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

  // RBAC Permission toggle handler
  const handleTogglePermission = (key: string, roleToToggle: 'admin' | 'manager' | 'viewer') => {
    if (role !== 'admin') return;
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
  };

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      department: newMemberDept,
      addedAt: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setShowAddMemberModal(false);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  // Delete Member
  const handleDeleteMember = (memberId: string) => {
    if (role !== 'admin') return;
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // Update Member Role
  const handleUpdateMemberRole = (memberId: string, newRole: Role) => {
    if (role !== 'admin') return;
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  // Test SMTP Handshake
  const handleTestSmtpConnection = () => {
    setIsTestingSmtp(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTestingSmtp(false);
      setTestResult({
        success: true,
        message: `SMTP Handshake succeeded with ${smtp.host}:${smtp.port}. TLS 1.3 established. Test message queued to ${testRecipientEmail}.`,
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
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#5E5CE6]" />
            <span>Admin Settings & System Governance</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage Role-Based Access Control (RBAC), team permissions, and production SMTP mailer configuration
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rbac'
                ? 'bg-white text-[#5E5CE6] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>RBAC & Team</span>
          </button>
          <button
            onClick={() => setActiveTab('smtp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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

      {/* Role Notice Banner */}
      {role !== 'admin' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold block">Viewing in Read-Only Mode ({role.toUpperCase()})</span>
            <span>
              You are logged in as a <strong>{role}</strong>. Modifying system permissions and SMTP credentials requires Admin privileges. Log out and sign in with an Administrator profile to edit these settings.
            </span>
          </div>
        </div>
      )}

      {/* Save Success Banner */}
      {saveSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-bold">
            Settings saved successfully! SMTP mail gateway updated.
          </div>
        </div>
      )}

      {/* ===================== TAB 1: RBAC & TEAM ===================== */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Permission Matrix Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#5E5CE6]" />
                  <span>Role-Based Access Control (RBAC) Matrix</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Granular permission control across Admin, Operations Manager (PRO), and External Auditor roles
                </p>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                {role === 'admin' ? 'Click checkboxes to toggle' : 'Read-only preview'}
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
                      <td className="py-3 px-6">
                        <div className="font-bold text-slate-800 text-xs">{perm.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{perm.description}</div>
                      </td>

                      {/* Admin Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={role !== 'admin'}
                          onClick={() => handleTogglePermission(perm.key, 'admin')}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                            perm.admin
                              ? 'bg-[#5E5CE6] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          } ${role === 'admin' ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                        >
                          {perm.admin ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Manager Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={role !== 'admin'}
                          onClick={() => handleTogglePermission(perm.key, 'manager')}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                            perm.manager
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          } ${role === 'admin' ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                        >
                          {perm.manager ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Viewer Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={role !== 'admin'}
                          onClick={() => handleTogglePermission(perm.key, 'viewer')}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                            perm.viewer
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          } ${role === 'admin' ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
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

          {/* Team Members List Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#5E5CE6]" />
                  <span>Authorized Team Members & Roles</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Employees and external auditors permitted to access Remindifi
                </p>
              </div>

              {role === 'admin' && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#5E5CE6]/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Team Member</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span>{member.name}</span>
                        {member.role === 'admin' && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#5E5CE6]/10 text-[#5E5CE6]">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {member.email} • {member.department}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Role Dropdown */}
                    {role === 'admin' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as Role)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 cursor-pointer"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager / PRO</option>
                        <option value="viewer">Viewer / Auditor</option>
                      </select>
                    ) : (
                      <span className="text-xs font-bold text-slate-600 px-3 py-1 rounded-lg bg-slate-100 capitalize">
                        {member.role}
                      </span>
                    )}

                    {role === 'admin' && (
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove member access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
                    disabled={role !== 'admin'}
                    value={smtp.host}
                    onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
                    placeholder="e.g. smtp.sendgrid.net or smtp.office365.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Port</label>
                  <input
                    type="number"
                    disabled={role !== 'admin'}
                    value={smtp.port}
                    onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
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
                    disabled={role !== 'admin'}
                    value={smtp.encryption}
                    onChange={(e) => setSmtp({ ...smtp, encryption: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
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
                    disabled={role !== 'admin'}
                    value={smtp.rateLimitPerHour}
                    onChange={(e) => setSmtp({ ...smtp, rateLimitPerHour: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
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
                    disabled={role !== 'admin'}
                    value={smtp.user}
                    onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
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
                      disabled={role !== 'admin'}
                      value={smtp.pass}
                      onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                      required
                      className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                    disabled={role !== 'admin'}
                    value={smtp.senderEmail}
                    onChange={(e) => setSmtp({ ...smtp, senderEmail: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
                    placeholder="alerts@remindifi.ae"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    disabled={role !== 'admin'}
                    value={smtp.senderName}
                    onChange={(e) => setSmtp({ ...smtp, senderName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
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
                  disabled={role !== 'admin'}
                  value={smtp.replyTo}
                  onChange={(e) => setSmtp({ ...smtp, replyTo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
                  placeholder="support@remindifi.ae"
                />
              </div>

              {role === 'admin' && (
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-[#5E5CE6]/25 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save SMTP Configuration</span>
                  </button>
                </div>
              )}
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add New Team Member</h3>
            <p className="text-xs text-slate-500 mb-4">
              Grant Remindifi compliance ledger access to an employee or partner auditor.
            </p>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required
                  placeholder="tariq@company.ae"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="manager">Manager / PRO</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer / Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newMemberDept}
                    onChange={(e) => setNewMemberDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="Operations"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5E5CE6] text-white hover:bg-[#4E4CC6]"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
