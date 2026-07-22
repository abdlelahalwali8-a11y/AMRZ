import React, { useState, useEffect } from 'react';
import { parseMRZ, formatYYMMDDToISO } from '../utils/mrzParser';
import { getCountryDisplayName } from '../utils/countryData';
import { PassportData } from '../types/passport';
import { calculateCheckDigit } from '../utils/mrzGenerator';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Copy
} from 'lucide-react';

interface MRZValidatorProps {
  currentMRZLine1?: string;
  currentMRZLine2?: string;
  onLoadDataToEditor?: (data: PassportData) => void;
  lang?: 'ar' | 'en';
}

export const MRZValidator: React.FC<MRZValidatorProps> = ({
  currentMRZLine1 = 'P<SAUAL<SAUD<<ABDULAZIZ<FAHAD<<<<<<<<<<<<<<<',
  currentMRZLine2 = 'N123456788SAU9205141M32051381098765432<<<<01',
  onLoadDataToEditor,
  lang = 'ar'
}) => {
  const [inputText, setInputText] = useState<string>(`${currentMRZLine1}\n${currentMRZLine2}`);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentMRZLine1 && currentMRZLine2) {
      setInputText(`${currentMRZLine1}\n${currentMRZLine2}`);
    }
  }, [currentMRZLine1, currentMRZLine2]);

  const result = parseMRZ(inputText);

  const handleCopyMRZ = () => {
    navigator.clipboard.writeText(result.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToEditor = () => {
    if (!onLoadDataToEditor || !result.parsedFields) return;
    const pf = result.parsedFields;

    const importedPassport: PassportData = {
      id: `imported-${Date.now()}`,
      documentType: (pf.documentType.charAt(0) || 'P') as any,
      documentSubtype: pf.documentType.substring(1) || '<',
      issuingState: pf.issuingState || 'XXX',
      surname: pf.surname || 'SURNAME',
      givenNames: pf.givenNames || 'GIVEN NAMES',
      passportNumber: pf.passportNumber || '',
      nationality: pf.nationality || pf.issuingState || 'XXX',
      birthDate: formatYYMMDDToISO(pf.birthDateYYMMDD, true) || '1990-01-01',
      sex: pf.sex,
      expiryDate: formatYYMMDDToISO(pf.expiryDateYYMMDD, false) || '2030-01-01',
      personalNumber: pf.personalNumber || '',
      issueDate: '2020-01-01',
      placeOfBirth: 'OFFICIAL RECORD',
      issuingAuthority: `AUTHORITY ${pf.issuingState}`,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      signatureUrl: ''
    };

    onLoadDataToEditor(importedPassport);
  };

  return (
    <div className="space-y-6">
      {/* Input Box & Scanner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            {lang === 'ar' ? 'محلل ومُدقق القراءة الآلية (MRZ Inspector & Checksum Verifier)' : 'MRZ Inspector & Verifier'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMRZ}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ النص' : 'Copy MRZ')}
            </button>
            {onLoadDataToEditor && (
              <button
                type="button"
                onClick={handleApplyToEditor}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'تحميل البيانات إلى المحرر' : 'Load to Editor'}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {lang === 'ar'
            ? 'قم بلصق أو تعديل كود الـ MRZ المكون من سطرين (44 حرفاً لكل سطر) لاختبار دقة الرموز والتأكد من مطابقتها لخوارزمية الوزن المعيارية (7-3-1 ICAO).'
            : 'Paste or edit any 2-line 44-char MRZ string to verify 7-3-1 weight checksums according to ICAO Doc 9303.'}
        </p>

        {/* Text Area Input */}
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="P<SAUAL<SAUD<<ABDULAZIZ<FAHAD<<<<<<<<<<<<<<<\nN123456788SAU9205141M32051381098765432<<<<01"
          className="w-full px-4 py-3 text-sm md:text-base font-mono border-2 border-slate-300 dark:border-slate-700 rounded-xl bg-slate-950 text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 tracking-[0.15em] leading-relaxed uppercase"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        />

        {/* Status Badge Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between ${
            result.isValid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {result.isValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                {result.isValid
                  ? lang === 'ar'
                    ? 'كود القراءة الآلية (MRZ) سليم وصحيح 100% بحسب معايير ICAO'
                    : '100% Valid ICAO 9303 Compliant MRZ'
                  : lang === 'ar'
                  ? 'يوجد أخطاء في رموز التحقق أو التنسيق'
                  : 'Check digit or structure validation failed'}
              </h4>
              <p className="text-xs opacity-90 mt-0.5">
                {result.isValid
                  ? lang === 'ar'
                    ? 'جميع رموز التحقق المتبادلة (الرقم، تاريخ الميلاد، الانتهاء، المجموع الشامل) مطابقة تماماً.'
                    : 'All check digits (Passport No, DOB, Expiry, Composite) match the 7-3-1 weight algorithm.'
                  : `${result.errors.length} ${lang === 'ar' ? 'خطأ مكتشف' : 'error(s) detected'}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Errors list if any */}
      {result.errors.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 space-y-2">
          <h5 className="font-bold text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {lang === 'ar' ? 'تفاصيل الأخطاء المكتشفة' : 'Detected Validation Errors'}
          </h5>
          <ul className="space-y-1.5 text-xs text-rose-900 dark:text-rose-200">
            {result.errors.map((err, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                <span className="font-mono font-bold text-rose-600 shrink-0">•</span>
                <span>{err.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive MRZ Color Breakdown & Decoded Fields */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          {lang === 'ar' ? 'التفكيك التفاعلي لبيانات الـ MRZ بالخانات' : 'Interactive MRZ Field Breakdown'}
        </h3>

        {/* Color Legend */}
        <div className="flex flex-wrap gap-2 text-[11px] font-medium">
          <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
            {lang === 'ar' ? 'نوع الوثيقة (P)' : 'Doc Type'}
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-200 text-sky-900 border border-sky-300">
            {lang === 'ar' ? 'رمز الدولة (SAU)' : 'Issuing State'}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 border border-emerald-300">
            {lang === 'ar' ? 'الاسم واللقب' : 'Name'}
          </span>
          <span className="px-2 py-0.5 rounded bg-yellow-200 text-yellow-900 border border-yellow-300">
            {lang === 'ar' ? 'رقم الجواز + رمز التحقق' : 'Passport No + Check'}
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 border border-purple-300">
            {lang === 'ar' ? 'الجنسية والجنس' : 'Nationality & Sex'}
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 border border-rose-300">
            {lang === 'ar' ? 'الميلاد + الانتهاء + التحقق' : 'DOB & Expiry + Checks'}
          </span>
          <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 border border-indigo-300">
            {lang === 'ar' ? 'التحقق الشامل' : 'Composite Check'}
          </span>
        </div>

        {/* Decoded Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {/* Surname & Given Names */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 block">الاسم واللقب / Full Name</span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase block mt-0.5">
              {result.parsedFields.surname} {result.parsedFields.givenNames}
            </span>
          </div>

          {/* Passport Number & Check Digit Verification */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">رقم الجواز / Passport No.</span>
              {result.parsedFields.passportNumberCheckValid ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  رمز صحيح ✓ ({result.parsedFields.passportNumberCheckDigit})
                </span>
              ) : (
                <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                  رمز غير صحيح ✗ ({result.parsedFields.passportNumberCheckDigit})
                </span>
              )}
            </div>
            <span className="text-sm font-bold font-mono text-amber-700 dark:text-amber-400 block mt-0.5">
              {result.parsedFields.passportNumber}
            </span>
          </div>

          {/* Country & Nationality */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 block">الدولة والجنسية / State & Nationality</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
              {getCountryDisplayName(result.parsedFields.issuingState, lang)}
            </span>
          </div>

          {/* Date of Birth & Check Digit */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">تاريخ الميلاد / Date of Birth</span>
              {result.parsedFields.birthDateCheckValid ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  صحيح ✓
                </span>
              ) : (
                <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                  خطأ ✗
                </span>
              )}
            </div>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block mt-0.5">
              {formatYYMMDDToISO(result.parsedFields.birthDateYYMMDD, true)} ({result.parsedFields.birthDateYYMMDD})
            </span>
          </div>

          {/* Expiry Date & Check Digit */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">تاريخ الانتهاء / Expiry Date</span>
              {result.parsedFields.expiryDateCheckValid ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  صحيح ✓
                </span>
              ) : (
                <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                  خطأ ✗
                </span>
              )}
            </div>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block mt-0.5">
              {formatYYMMDDToISO(result.parsedFields.expiryDateYYMMDD, false)} ({result.parsedFields.expiryDateYYMMDD})
            </span>
          </div>

          {/* Composite Check Digit Verification */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">المجموع الكلي (Composite Check)</span>
              {result.parsedFields.compositeCheckValid ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  مجموع مطابق ✓
                </span>
              ) : (
                <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                  مجموع غير مطابق ✗
                </span>
              )}
            </div>
            <span className="text-sm font-bold font-mono text-indigo-700 dark:text-indigo-400 block mt-0.5">
              الرمز الختامي: {result.parsedFields.compositeCheckDigit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
