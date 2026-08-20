import React, { useRef, useEffect, useState } from 'react';
import { 
  Download, 
  Printer, 
  Share2, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  Check, 
  ExternalLink,
  QrCode,
  Eye,
  Plane
} from 'lucide-react';
import { PassportData } from '../types/passport';
import { generateTD3MRZ } from '../utils/mrzGenerator';
import { renderBarcodeToCanvas, buildBarcodePayload } from '../utils/barcodeGenerator';
import { getCountryByCode } from '../utils/countryData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PassportPreviewProps {
  passport: PassportData;
  lang?: 'ar' | 'en';
}

export const PassportPreview: React.FC<PassportPreviewProps> = ({ passport, lang = 'ar' }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedMRZ, setCopiedMRZ] = useState(false);

  const mrzResult = generateTD3MRZ(passport);
  const country = getCountryByCode(passport.issuingState);

  useEffect(() => {
    if (barcodeCanvasRef.current) {
      const payload = buildBarcodePayload(passport, {
        type: 'pdf417',
        includeMRZ: true,
        includePersonalData: true,
        includeRawJson: false,
        scale: 2,
        securityLevel: 4
      });

      renderBarcodeToCanvas(barcodeCanvasRef.current, payload, {
        type: 'pdf417',
        includeMRZ: true,
        includePersonalData: true,
        includeRawJson: false,
        scale: 2,
        securityLevel: 4
      }).catch(err => console.error('Error rendering passport barcode:', err));
    }
  }, [passport]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [125, 88] // Standard ICAO TD3 passport booklet page size (125mm x 88mm)
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 125, 88);
      pdf.save(`Passport_${passport.issuingState}_${passport.passportNumber || 'TD3'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Passport_${passport.issuingState}_${passport.passportNumber || 'TD3'}.png`;
      a.click();
    } catch (err) {
      console.error('Image export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const copyMRZToClipboard = () => {
    const text = `${mrzResult.line1}\n${mrzResult.line2}`;
    navigator.clipboard.writeText(text);
    setCopiedMRZ(true);
    setTimeout(() => setCopiedMRZ(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-sm text-slate-100">
              {lang === 'ar' ? 'معاينة جواز السفر والوثيقة الرسمية (TD3)' : 'Official Passport Preview (TD3)'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'ar' ? 'نموذج مطابق لمعايير ICAO Doc 9303 مع أسطر القراءة الآلية والباركود' : 'ICAO Doc 9303 standard page with MRZ & PDF417 barcode'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'تصدير PDF عالي الدقة' : 'Export PDF'}
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'حفظ كصورة (PNG)' : 'Save Image'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'طباعة الوثيقة' : 'Print'}
          </button>
        </div>
      </div>

      {/* Passport Visual Document Card */}
      <div className="flex justify-center overflow-x-auto p-2">
        <div
          id="printable-passport-card"
          ref={cardRef}
          className="w-full max-w-[720px] aspect-[1.42/1] bg-gradient-to-br from-amber-50/90 via-slate-50 to-blue-50/60 text-slate-900 rounded-2xl p-5 sm:p-7 shadow-2xl border-2 border-slate-300 dark:border-slate-700 relative overflow-hidden flex flex-col justify-between select-none"
          style={{ minWidth: '580px' }}
        >
          {/* Security Guilloche Pattern & Watermark Background */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border-[12px] border-amber-500/10 pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full border-[12px] border-blue-500/10 pointer-events-none"></div>

          {/* Top Header of Passport */}
          <div>
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{country?.flag || '🛂'}</span>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 uppercase">
                    {country?.nameEn || passport.issuingState} • {country?.nameAr || ''}
                  </h2>
                  <div className="text-[10px] sm:text-xs font-bold text-slate-600 tracking-wider">
                    PASSPORT • جواز سفر
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Type / النوع</div>
                <div className="font-mono font-bold text-xs sm:text-sm">{passport.documentType || 'P'}</div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Code / الرمز</div>
                <div className="font-mono font-bold text-xs sm:text-sm">{passport.issuingState || 'YEM'}</div>
              </div>
            </div>

            {/* Passport Body Information Grid */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              
              {/* Left Column: Photo & Signature */}
              <div className="col-span-4 flex flex-col items-center gap-2">
                <div className="w-28 h-36 sm:w-32 sm:h-40 bg-slate-200 border-2 border-slate-400 rounded-lg overflow-hidden shadow-inner flex items-center justify-center relative">
                  {passport.photoUrl ? (
                    <img src={passport.photoUrl} alt="Passport Holder" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <div className="text-2xl mb-1">👤</div>
                      <span className="text-[9px] block">صورة الجواز الرسمية</span>
                    </div>
                  )}
                  {/* Hologram security overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
                </div>

                {/* Signature Box */}
                <div className="w-full h-10 border border-slate-300 rounded bg-white/80 flex items-center justify-center overflow-hidden px-1">
                  {passport.signatureUrl ? (
                    <img src={passport.signatureUrl} alt="Signature" className="max-h-8 max-w-full object-contain" />
                  ) : (
                    <span className="text-[8px] text-slate-400 italic">توقيع صاحب الجواز / Signature</span>
                  )}
                </div>
              </div>

              {/* Right Column: Key Details */}
              <div className="col-span-8 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] sm:text-xs">
                
                {/* Passport Number */}
                <div className="col-span-2 bg-amber-100/70 p-1.5 rounded border border-amber-300/80 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-600 block uppercase font-bold">Passport No. / رقم الجواز</span>
                    <span className="font-mono font-black text-sm sm:text-base text-slate-950 tracking-wider">
                      {passport.passportNumber || '00000000'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">
                    TD3
                  </span>
                </div>

                {/* Surname */}
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-500 block uppercase">Surname / اللقب</span>
                  <div className="font-bold font-mono text-slate-900 tracking-wide">
                    {passport.surname || 'SURNAME'}
                  </div>
                  {passport.surnameAr && (
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{passport.surnameAr}</div>
                  )}
                </div>

                {/* Given Names */}
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-500 block uppercase">Given Names / الأسماء</span>
                  <div className="font-bold font-mono text-slate-900 tracking-wide text-xs">
                    {passport.givenNames || 'GIVEN NAMES'}
                  </div>
                  {passport.givenNamesAr && (
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{passport.givenNamesAr}</div>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Nationality / الجنسية</span>
                  <span className="font-bold font-mono text-slate-900">{passport.nationality || 'YEM'}</span>
                </div>

                {/* Date of Birth & Sex */}
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Date of Birth / الميلاد</span>
                  <span className="font-bold font-mono text-slate-900">
                    {passport.birthDate || 'YYYY-MM-DD'} ({passport.sex === 'F' ? 'F/أنثى' : 'M/ذكر'})
                  </span>
                </div>

                {/* Place of Birth */}
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Place of Birth / محل الميلاد</span>
                  <span className="font-semibold text-slate-900 truncate block">
                    {passport.placeOfBirthAr || passport.placeOfBirth || '-'}
                  </span>
                </div>

                {/* Profession */}
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Profession / المهنة</span>
                  <span className="font-semibold text-slate-900 truncate block">
                    {passport.professionAr || passport.profession || '-'}
                  </span>
                </div>

                {/* Issue Date */}
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Date of Issue / الإصدار</span>
                  <span className="font-bold font-mono text-slate-900">{passport.issueDate || '-'}</span>
                </div>

                {/* Expiry Date */}
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase text-rose-700 font-bold">Date of Expiry / الانتهاء</span>
                  <span className="font-bold font-mono text-rose-800 text-xs sm:text-sm">{passport.expiryDate || 'YYYY-MM-DD'}</span>
                </div>

                {/* Authority & Personal ID */}
                <div className="col-span-2 flex justify-between items-center text-[10px] text-slate-600 border-t border-slate-200 pt-1 mt-1">
                  <span>
                    <strong>Authority:</strong> {passport.issuingAuthorityAr || passport.issuingAuthority || passport.issuingState}
                  </span>
                  {passport.personalNumber && (
                    <span>
                      <strong>National ID:</strong> {passport.personalNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Machine Readable Zone (MRZ 44 x 2) */}
          <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-400 bg-white/70 p-3 rounded-lg font-mono text-xs sm:text-sm font-bold tracking-widest text-slate-950 overflow-x-auto shadow-inner leading-relaxed">
            <div className="whitespace-nowrap font-mrz">{mrzResult.line1}</div>
            <div className="whitespace-nowrap font-mrz">{mrzResult.line2}</div>
          </div>
        </div>
      </div>

      {/* Copy MRZ and Barcode Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* MRZ Raw Text & Copy */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              {lang === 'ar' ? 'شفرة القراءة الآلية MRZ (TD3)' : 'MRZ Code (TD3)'}
            </span>
            <button
              onClick={copyMRZToClipboard}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center gap-1"
            >
              {copiedMRZ ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedMRZ ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الكود' : 'Copy')}
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 break-all space-y-1">
            <div>{mrzResult.line1}</div>
            <div>{mrzResult.line2}</div>
          </div>
        </div>

        {/* PDF417 Live Barcode Preview */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-400" />
              {lang === 'ar' ? 'باركود PDF417 المعياري' : 'Standard PDF417 Barcode'}
            </span>
            <span className="text-[10px] text-slate-400">ICAO Compliant</span>
          </div>

          <div className="bg-white p-3 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
            <canvas ref={barcodeCanvasRef} className="max-w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
