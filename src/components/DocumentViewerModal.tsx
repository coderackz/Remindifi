import React from 'react';
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle,
  FileText,
  Building,
  QrCode,
  Calendar,
} from 'lucide-react';
import { Permit, Asset, PermitCategory } from '../types';
import { formatAED } from '../utils/compliance';

interface DocumentViewerModalProps {
  permit: Permit | null;
  assets: Asset[];
  categories: PermitCategory[];
  onClose: () => void;
}

export function DocumentViewerModal({
  permit,
  assets,
  categories,
  onClose,
}: DocumentViewerModalProps) {
  if (!permit) return null;

  const asset = assets.find((a) => a.id === permit.assetId);
  const category = categories.find((c) => c.id === permit.categoryId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5E5CE6] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Official Compliance Document Viewer
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {permit.fileName || `${permit.permitNumber}_scan.pdf`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High-Fidelity Certificate Scan Preview */}
        <div className="bg-[#FAF9F6] border-2 border-slate-300 rounded-2xl p-6 sm:p-8 relative shadow-inner overflow-hidden font-serif text-slate-800">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <ShieldCheck className="w-96 h-96 text-slate-900" />
          </div>

          {/* Official Emblem & Header */}
          <div className="text-center pb-6 border-b-2 border-slate-300 relative z-10 font-sans">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              UNITED ARAB EMIRATES · REGULATORY COMPLIANCE
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              {category?.issuingAuthority || 'GOVERNMENT LICENSING AUTHORITY'}
            </h2>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              {category?.name || 'CERTIFICATE OF REGISTRATION'}
            </div>
          </div>

          {/* Certificate Body */}
          <div className="py-6 space-y-4 text-xs font-sans relative z-10">
            <div className="grid grid-cols-2 gap-4 bg-white/80 p-4 rounded-xl border border-slate-200 backdrop-blur-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Document / Permit No:</span>
                <span className="font-mono text-sm font-extrabold text-slate-900">{permit.permitNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Bound Parent Entity:</span>
                <span className="font-mono text-sm font-extrabold text-[#5E5CE6]">{asset?.identifier}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Issue Date:</span>
                <span className="font-mono font-semibold text-slate-800">{permit.issueDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Expiration Date:</span>
                <span className="font-mono font-bold text-red-600">{permit.expiryDate}</span>
              </div>
            </div>

            {/* Asset Details */}
            <div className="bg-white/80 p-4 rounded-xl border border-slate-200 text-slate-700 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Entity Description:</span>
              <p className="font-medium">{asset?.name}</p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-600 pt-1">
                {Object.entries(asset?.metadata || {}).map(([k, v]) => (
                  <span key={k} className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <strong>{k}:</strong> {v}
                  </span>
                ))}
              </div>
            </div>

            {permit.notes && (
              <div className="text-[11px] text-slate-500 italic bg-white/60 p-3 rounded-lg border border-slate-200">
                <strong>Conditions / Endorsements:</strong> {permit.notes}
              </div>
            )}
          </div>

          {/* Verification Barcode & Stamp */}
          <div className="pt-4 border-t-2 border-slate-300 flex items-center justify-between font-sans text-xs relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500">
                <span className="font-bold text-slate-700 block">AUTHENTIC DIGITAL ATTESTATION</span>
                <span>SHA-256 Verified · Remindifi Secure Ledger</span>
              </div>
            </div>

            <div className="text-right">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-600/40 border-dashed flex flex-col items-center justify-center text-emerald-700 font-bold rotate-[-12deg]">
                <span className="text-[8px] uppercase tracking-widest">OFFICIAL</span>
                <span className="text-[10px] font-black uppercase">VALIDATED</span>
                <span className="text-[7px]">UAE CERT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Fee Paid: <strong>{formatAED(permit.cost)}</strong>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
