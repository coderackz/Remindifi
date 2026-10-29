import React, { useState } from 'react';
import { EmailTemplate, Role } from '../types';
import { DEFAULT_EMAIL_TEMPLATES } from '../data/defaultSettings';
import {
  Mail,
  Palette,
  Eye,
  Send,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Tag,
  AlertTriangle,
  Clock,
  Layers,
  FileCheck,
  Check,
} from 'lucide-react';

interface EmailTemplatesViewProps {
  role: Role;
}

const AVAILABLE_TOKENS = [
  { token: '{{permit_name}}', desc: 'Permit Category (e.g. RTA Mulkiya)' },
  { token: '{{asset_identifier}}', desc: 'Asset Plate / Code (e.g. DXB CC 12345)' },
  { token: '{{permit_number}}', desc: 'Official Permit #' },
  { token: '{{expiry_date}}', desc: 'Permit Expiry Date' },
  { token: '{{days_remaining}}', desc: 'Days Until Expiry' },
  { token: '{{issuing_authority}}', desc: 'Issuing Authority (RTA / DED)' },
  { token: '{{cost_aed}}', desc: 'Renewal Cost in AED' },
  { token: '{{assigned_officer}}', desc: 'Assigned Compliance Officer' },
  { token: '{{renewed_by}}', desc: 'Name of Person Logging Renewal' },
];

const ACCENT_COLORS = [
  { name: 'Alert Red', hex: '#EF4444' },
  { name: 'Warning Amber', hex: '#F59E0B' },
  { name: 'Remindifi Indigo', hex: '#5E5CE6' },
  { name: 'Success Emerald', hex: '#10B981' },
  { name: 'Executive Slate', hex: '#1E293B' },
];

export function EmailTemplatesView({ role }: EmailTemplatesViewProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_EMAIL_TEMPLATES[0].id);
  const [saveToast, setSaveToast] = useState(false);
  const [testSentToast, setTestSentToast] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleUpdateCurrentTemplate = (updates: Partial<EmailTemplate>) => {
    if (role === 'viewer') return;
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplate.id ? { ...t, ...updates, lastUpdated: 'Just now' } : t))
    );
  };

  const handleInsertToken = (token: string) => {
    if (role === 'viewer') return;
    handleUpdateCurrentTemplate({
      body: selectedTemplate.body + ' ' + token,
    });
  };

  const handleResetDefaults = () => {
    const original = DEFAULT_EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate.id);
    if (original) {
      handleUpdateCurrentTemplate(original);
    }
  };

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleSendTest = () => {
    setTestSentToast(true);
    setTimeout(() => setTestSentToast(false), 3500);
  };

  // Preview replacement renderer
  const renderPreviewContent = (text: string) => {
    return text
      .replace(/\{\{permit_name\}\}/g, 'RTA Mulkiya Commercial Registration')
      .replace(/\{\{asset_identifier\}\}/g, 'DXB CC 12345')
      .replace(/\{\{permit_number\}\}/g, 'MUL-2024-99812')
      .replace(/\{\{expiry_date\}\}/g, '2026-11-05')
      .replace(/\{\{days_remaining\}\}/g, '7')
      .replace(/\{\{issuing_authority\}\}/g, 'Roads & Transport Authority (RTA)')
      .replace(/\{\{cost_aed\}\}/g, '1,250')
      .replace(/\{\{assigned_officer\}\}/g, 'Rashid Khan (PRO)')
      .replace(/\{\{critical_count\}\}/g, '3')
      .replace(/\{\{warning_count\}\}/g, '5')
      .replace(/\{\{total_assets\}\}/g, '24')
      .replace(/\{\{in_renewal_count\}\}/g, '2')
      .replace(/\{\{renewed_by\}\}/g, 'Hassan Al-Maktoum')
      .replace(/\{\{uploaded_document\}\}/g, 'Mulkiya_DXB_12345_2026.pdf')
      .replace(/\{\{renewal_id\}\}/g, 'RNW-98412');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#5E5CE6]" />
            <span>Email Notification Templates</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Customize HTML layouts, dynamic tags, branding, and trigger wording for all compliance alerts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            disabled={role === 'viewer'}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Template</span>
          </button>

          <button
            onClick={handleSendTest}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>Send Test Preview</span>
          </button>

          {role !== 'viewer' && (
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#5E5CE6] hover:bg-[#4E4CC6] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#5E5CE6]/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Toast */}
      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Template saved successfully! Ready for automated SMTP trigger dispatch.</span>
        </div>
      )}

      {/* Test Sent Toast */}
      {testSentToast && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Test email dispatched using active SMTP gateway to compliance@remindifi.ae</span>
        </div>
      )}

      {/* Template Selector Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {templates.map((tmpl) => {
          const isSelected = tmpl.id === selectedTemplateId;
          return (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplateId(tmpl.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-white border-[#5E5CE6] shadow-md ring-2 ring-[#5E5CE6]/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tmpl.accentColor }}
                />
                <span className="text-[10px] text-slate-400 font-semibold">{tmpl.lastUpdated}</span>
              </div>
              <div className="font-bold text-xs text-slate-900 leading-tight mb-1">
                {tmpl.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate">{tmpl.subject}</div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Editor on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#5E5CE6]" />
              <span>Template Settings & Copy</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-400 capitalize">
              {selectedTemplate.category.replace('_', ' ')}
            </span>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Subject Line
            </label>
            <input
              type="text"
              disabled={role === 'viewer'}
              value={selectedTemplate.subject}
              onChange={(e) => handleUpdateCurrentTemplate({ subject: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
            />
          </div>

          {/* Preheader */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preheader Preview Text
            </label>
            <input
              type="text"
              disabled={role === 'viewer'}
              value={selectedTemplate.preheader}
              onChange={(e) => handleUpdateCurrentTemplate({ preheader: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
            />
          </div>

          {/* Header Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Card Headline / Banner Title
              </label>
              <input
                type="text"
                disabled={role === 'viewer'}
                value={selectedTemplate.headline}
                onChange={(e) => handleUpdateCurrentTemplate({ headline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Call-to-Action Button Label
              </label>
              <input
                type="text"
                disabled={role === 'viewer'}
                value={selectedTemplate.actionButtonText}
                onChange={(e) => handleUpdateCurrentTemplate({ actionButtonText: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Dynamic Token Insert Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#5E5CE6]" />
                <span>Dynamic Tokens (Click to insert)</span>
              </label>
              <span className="text-[10px] text-slate-400">Replaced automatically at runtime</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
              {AVAILABLE_TOKENS.map((item) => (
                <button
                  key={item.token}
                  type="button"
                  disabled={role === 'viewer'}
                  onClick={() => handleInsertToken(item.token)}
                  title={item.desc}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#5E5CE6] text-[11px] font-mono text-[#5E5CE6] hover:bg-[#5E5CE6]/5 transition-all cursor-pointer shadow-2xs"
                >
                  {item.token}
                </button>
              ))}
            </div>
          </div>

          {/* Email Body Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Body Content (Markdown Supported)
            </label>
            <textarea
              rows={8}
              disabled={role === 'viewer'}
              value={selectedTemplate.body}
              onChange={(e) => handleUpdateCurrentTemplate({ body: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]/30 disabled:opacity-60"
            />
          </div>

          {/* Styling Options: Accent Color & Logo Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Accent Theme Color
              </label>
              <div className="flex items-center gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    disabled={role === 'viewer'}
                    onClick={() => handleUpdateCurrentTemplate({ accentColor: color.hex })}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      selectedTemplate.accentColor === color.hex
                        ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedTemplate.accentColor === color.hex && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-3 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={role === 'viewer'}
                  checked={selectedTemplate.includeLogo}
                  onChange={(e) => handleUpdateCurrentTemplate({ includeLogo: e.target.checked })}
                  className="w-4 h-4 rounded text-[#5E5CE6] focus:ring-[#5E5CE6] border-slate-300"
                />
                <span className="text-xs text-slate-700 font-semibold">Include Remindifi Monogram</span>
              </label>
            </div>
          </div>

          {/* Footer Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Footer Statutory Compliance Note
            </label>
            <input
              type="text"
              disabled={role === 'viewer'}
              value={selectedTemplate.footerNote}
              onChange={(e) => handleUpdateCurrentTemplate({ footerNote: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Live Email Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#5E5CE6]" />
              <span>Live In-Box Rendering</span>
            </span>
            <span className="text-[10px] text-slate-400">Sample Data Preview</span>
          </div>

          {/* Mock Email Client Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden">
            {/* Fake Email Client Bar */}
            <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[11px] font-mono text-slate-500 truncate flex-1 text-center font-bold">
                {renderPreviewContent(selectedTemplate.subject)}
              </div>
            </div>

            {/* Email Headers */}
            <div className="p-4 border-b border-slate-100 text-[11px] space-y-1 bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-bold text-slate-400 w-12">From:</span>
                <span className="font-semibold text-slate-900">
                  Remindifi Compliance Alerts &lt;compliance-alerts@remindifi.ae&gt;
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-bold text-slate-400 w-12">To:</span>
                <span className="text-slate-700">rashid.pro@remindifi.ae, compliance@remindifi.ae</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-bold text-slate-400 w-12">Subject:</span>
                <span className="font-bold text-slate-800">
                  {renderPreviewContent(selectedTemplate.subject)}
                </span>
              </div>
            </div>

            {/* Rendered Email Body Card */}
            <div className="p-6 bg-slate-50">
              <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Header Accent Bar */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: selectedTemplate.accentColor }}
                />

                <div className="p-6">
                  {/* Remindifi Monogram Brand */}
                  {selectedTemplate.includeLogo && (
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                      <div
                        className="w-7 h-7 rounded-xl text-white font-black text-sm flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: selectedTemplate.accentColor }}
                      >
                        R
                      </div>
                      <span className="text-xs font-black tracking-tight text-slate-900">
                        Remindifi
                      </span>
                    </div>
                  )}

                  {/* Headline */}
                  <h3
                    className="text-base font-black mb-3"
                    style={{ color: selectedTemplate.accentColor }}
                  >
                    {renderPreviewContent(selectedTemplate.headline)}
                  </h3>

                  {/* Body Content */}
                  <div className="text-xs text-slate-700 space-y-3 whitespace-pre-line leading-relaxed font-sans">
                    {renderPreviewContent(selectedTemplate.body)}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold text-center shadow-md transition-all hover:opacity-95"
                      style={{ backgroundColor: selectedTemplate.accentColor }}
                    >
                      {selectedTemplate.actionButtonText}
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-tight">
                    {selectedTemplate.footerNote}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
