import React, { useState } from 'react';
import { User, Role } from '../types';
import { DEMO_USERS } from '../data/defaultSettings';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState<User>(DEMO_USERS[0]);
  const [email, setEmail] = useState(DEMO_USERS[0].email);
  const [password, setPassword] = useState('••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSelectDemoUser = (user: User) => {
    setSelectedUser(user);
    setEmail(user.email);
    setPassword('••••••••••');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(selectedUser);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F0F2FA] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background soft ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#5E5CE6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-indigo-950/10 border border-slate-200/80 p-8 sm:p-10 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#5E5CE6] text-white font-black text-2xl shadow-lg shadow-[#5E5CE6]/35 mb-4 transform hover:scale-105 transition-transform">
            <span>R</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Remindi<span className="text-[#5E5CE6]">fi</span>
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20">
              Pro
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Asset-Centric Permit, License & Renewal Ledger
          </p>
        </div>

        {/* Quick Role Selection / Demo Personas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Select Demo Account</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">One-Click Switch</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map((u) => {
              const isSelected = selectedUser.id === u.id;
              const roleColor =
                u.role === 'admin'
                  ? 'border-[#5E5CE6] text-[#5E5CE6] bg-[#5E5CE6]/5'
                  : u.role === 'manager'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-amber-500 text-amber-700 bg-amber-50';

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectDemoUser(u)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? `${roleColor} ring-2 ring-offset-1 ${
                          u.role === 'admin'
                            ? 'ring-[#5E5CE6]'
                            : u.role === 'manager'
                            ? 'ring-blue-500'
                            : 'ring-amber-500'
                        } shadow-xs font-bold`
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-7 h-7 rounded-full object-cover border border-white shadow-xs"
                  />
                  <div className="text-[11px] font-bold leading-tight capitalize truncate w-full">
                    {u.role}
                  </div>
                  <span className="text-[9px] text-slate-400 leading-none truncate w-full">
                    {u.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Persona Brief Card */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <img
            src={selectedUser.avatar}
            alt={selectedUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 truncate">
                {selectedUser.name}
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                {selectedUser.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {selectedUser.jobTitle}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6] transition-all"
                placeholder="name@company.ae"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-[#5E5CE6] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 focus:border-[#5E5CE6] transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#5E5CE6] focus:ring-[#5E5CE6] border-slate-300"
              />
              <span className="text-xs text-slate-600 font-medium">
                Keep me signed in for 30 days
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#5E5CE6]/25 hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Compliance Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security / Compliance Badges */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit TLS
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-blue-500" /> UAE RTA & DED Ready
          </span>
          <span>•</span>
          <span>SOC2 Type II</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your corporate email address to receive a secure recovery code.
            </p>
            {resetEmailSent ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password reset link sent to {email}</span>
              </div>
            ) : (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-4"
                placeholder="name@company.ae"
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setResetEmailSent(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              {!resetEmailSent && (
                <button
                  onClick={() => setResetEmailSent(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5E5CE6] text-white hover:bg-[#4E4CC6]"
                >
                  Send Recovery Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
