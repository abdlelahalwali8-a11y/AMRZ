import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileSearch, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { parseMRZ } from '../utils/mrzParser';
import { PassportData } from '../types/passport';

interface MRZValidatorProps {
  onLoadIntoEditor?: (passport: PassportData) => void;
  lang?: 'ar' | 'en';
}

export const MRZValidator: React.FC<MRZValidatorProps> = ({ onLoadIntoEditor, lang = 'ar' }) => {
  const defaultSampleMRZ = `P<YEMAL<ZAHEAH<<MOHAMMED<SHAWQI<MOHAMMED<HA<<
13966269<7YEM0402028M3004176<<<<<<<<<<<<<<02`;

  const [inputMRZ, setInputMRZ] = useState(defaultSampleMRZ);
  const [copied, setCopied] = useState(false);

  const validation = parseMRZ(inputMRZ);

  const handleCopy = () => {
    navigator.clipboard.writeText(inputMRZ);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToEditor = () => {
    if (validation.parsedFields && onLoadIntoEditor) {
      const p = validation.parsedFields;
      const passport: PassportData = {
        id: `mrz-loaded-${Date.now()}`,
        documentType: p.documentType || 'P',
        documentSubtype: '<',
        issuingState: p.issuingState || 'YEM',
        surname: p.surname || '',
        givenNames: p.givenNames || '',
        passportNumber: p.passportNumber || '',
        nationality: p.nationality || p.issuingState || 'YEM',
        birthDate: p.birthDate || '',
        sex: (p.sex === 'F' ? 'F' : 'M'),
        expiryDate: p.expiryDate || '',
        personalNumber: p.personalNumber || ''
      };
      onLoadIntoEditor(passport);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Validator Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            {lang === 'ar' ? 'أداة فحص وتدقيق أكواد القراءة الآلية (ICAO MRZ Validator)' : 'ICAO MRZ Validator & Checksum Tool'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ar' ? 'فحص دقيق لصحة أسطر TD3 (44x2) ومطابقة أرقام التحقق (Check Digits) وخوارزمية الأوزان (7,3,1)' : 'Verify TD3 44x2 MRZ syntax, checksums & ICAO 7-3-1 weight algorithms'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ النص' : 'Copy')}
          </button>

          {validation.isValid && onLoadIntoEditor && (
            <button
              type="button"
              onClick={handleSendToEditor}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <ArrowRight className="w-4 h-4" />
              {lang === 'ar' ? 'استيراد البيانات للمحرر' : 'Load Into Editor'}
            </button>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <label className="block text-xs font-bold text-slate-300">
          {lang === 'ar' ? 'الصق أسطر الـ MRZ هنا (سطرين × 44 حرفاً):' : 'Paste MRZ lines here (2 lines x 44 characters):'}
        </label>
        <textarea
          rows={3}
          value={inputMRZ}
          onChange={(e) => setInputMRZ(e.target.value.toUpperCase())}
          placeholder="P<YEM..."
          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-4 font-mrz font-mono text-sm sm:text-base text-amber-400 tracking-widest leading-relaxed focus:outline-none uppercase"
          spellCheck={false}
        />
      </div>

      {/* Verification Result Status */}
      <div className={`p-5 rounded-2xl border ${validation.isValid ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/20 border-rose-500/40 text-rose-300'} flex items-start gap-3`}>
        {validation.isValid ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <h3 className="font-bold text-sm sm:text-base">
            {validation.isValid
              ? (lang === 'ar' ? 'الرمز صالح ومطابق 100% لمعايير ICAO Doc 9303' : 'Valid MRZ - 100% ICAO Doc 9303 Compliant')
              : (lang === 'ar' ? 'الرمز يحتوي على أخطاء أو أرقام تحقق غير مطابقة' : 'Invalid MRZ / Checksum mismatch')}
          </h3>
          {validation.errors.length > 0 && (
            <ul className="list-disc list-inside text-xs text-rose-400 space-y-0.5 mt-2">
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Check Digits Breakdown */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          {lang === 'ar' ? 'تفاصيل أرقام التحقق (Checksum Analysis - ICAO 7-3-1 Weight)' : 'Checksum Analysis Details'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">فحص رقم الجواز</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-slate-200 font-bold">
                المتوقع: {validation.checks.passportNumberCheck.expected} | الحالي: {validation.checks.passportNumberCheck.found}
              </span>
              {validation.checks.passportNumberCheck.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">فحص تاريخ الميلاد</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-slate-200 font-bold">
                المتوقع: {validation.checks.birthDateCheck.expected} | الحالي: {validation.checks.birthDateCheck.found}
              </span>
              {validation.checks.birthDateCheck.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">فحص تاريخ الانتهاء</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-slate-200 font-bold">
                المتوقع: {validation.checks.expiryDateCheck.expected} | الحالي: {validation.checks.expiryDateCheck.found}
              </span>
              {validation.checks.expiryDateCheck.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">التحقق الإجمالي Composite</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-slate-200 font-bold">
                المتوقع: {validation.checks.compositeCheck.expected} | الحالي: {validation.checks.compositeCheck.found}
              </span>
              {validation.checks.compositeCheck.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
