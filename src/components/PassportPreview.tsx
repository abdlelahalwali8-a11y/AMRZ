import React, { useEffect, useRef, useState } from 'react';
import { PassportData } from '../types/passport';
import { generateTD3MRZ } from '../utils/mrzGenerator';
import { getCountryByCode } from '../utils/countryData';
import { renderBarcodeToCanvas, formatPassportPDF417Data } from '../utils/barcodeGenerator';
import { ShieldCheck, Download, Printer, User, QrCode } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface PassportPreviewProps {
  data: PassportData;
  lang?: 'ar' | 'en';
  onHoverField?: (fieldKey: string | null) => void;
  activeHoverField?: string | null;
}

export const PassportPreview: React.FC<PassportPreviewProps> = ({
  data,
  lang = 'ar',
  onHoverField,
  activeHoverField
}) => {
  const passportCardRef = useRef<HTMLDivElement>(null);
  const pdf417CanvasRef = useRef<HTMLCanvasElement>(null);
  const code128CanvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [useOcrB, setUseOcrB] = useState<boolean>(true);

  const mrz = generateTD3MRZ(data);
  const country = getCountryByCode(data.issuingState);

  // Render barcodes whenever data changes
  useEffect(() => {
    if (pdf417CanvasRef.current) {
      const pdfData = formatPassportPDF417Data(mrz.line1, mrz.line2, data.passportNumber, data.personalNumber);
      renderBarcodeToCanvas(pdf417CanvasRef.current, {
        bcid: 'pdf417',
        text: pdfData,
        scale: 2,
        height: 12,
        backgroundcolor: 'FFFFFF'
      }).catch(() => {});
    }

    if (code128CanvasRef.current) {
      renderBarcodeToCanvas(code128CanvasRef.current, {
        bcid: 'code128',
        text: data.passportNumber || 'P12345678',
        scale: 2,
        height: 10,
        includeText: false
      }).catch(() => {});
    }

    if (qrCanvasRef.current) {
      renderBarcodeToCanvas(qrCanvasRef.current, {
        bcid: 'qrcode',
        text: `ICAO_MRTD:${data.issuingState}:${data.passportNumber}:${mrz.line1}:${mrz.line2}`,
        scale: 3,
        height: 10
      }).catch(() => {});
    }
  }, [data, mrz.line1, mrz.line2]);

  const handleExportPNG = async () => {
    if (!passportCardRef.current) return;
    try {
      const dataUrl = await toPng(passportCardRef.current, { quality: 0.98, cacheBust: true });
      const link = document.createElement('a');
      link.download = `Passport_MRZ_${data.passportNumber || 'Doc'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PNG export error:', err);
    }
  };

  const handleExportPDF = async () => {
    if (!passportCardRef.current) return;
    try {
      const dataUrl = await toPng(passportCardRef.current, { quality: 0.98, cacheBust: true });
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [142, 98] // ICAO passport page size (~125 x 88 mm + padding)
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, 142, 98);
      pdf.save(`Passport_Official_${data.passportNumber || 'Document'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const isFieldActive = (fieldKey: string) => {
    return activeHoverField === fieldKey || hoveredSegment === fieldKey;
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900 text-white rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-sm">
            {lang === 'ar' ? 'معاينة جواز السفر الأصلي المعياري (ICAO Doc 9303)' : 'Official ICAO Passport Specimen'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'تصدير صورة عالية الدقة PNG' : 'Export PNG'}
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'طباعة / PDF' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Main Passport Data Page Document */}
      <div
        ref={passportCardRef}
        id="official-passport-document"
        className="relative w-full max-w-[720px] mx-auto bg-[#faf8f2] text-slate-900 rounded-2xl border-2 border-slate-300 shadow-2xl p-5 md:p-7 overflow-hidden select-none font-sans"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 70%),
            repeating-linear-gradient(45deg, rgba(0, 51, 102, 0.02) 0px, rgba(0, 51, 102, 0.02) 2px, transparent 2px, transparent 8px),
            repeating-linear-gradient(-45deg, rgba(0, 102, 51, 0.02) 0px, rgba(0, 102, 51, 0.02) 2px, transparent 2px, transparent 8px)
          `
        }}
      >
        {/* Security Watermark Patterns Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <svg className="w-full h-full text-amber-700/20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.3" />
            <path d="M0,50 Q25,100 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1,1" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </svg>
        </div>

        {/* Passport Top Header */}
        <div className="relative z-10 pb-3 mb-4 border-b-2 border-amber-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl select-none">{country?.flag || '🌐'}</div>
            <div>
              <h2 className="text-base font-bold text-amber-950 uppercase tracking-wide leading-tight">
                {country?.nameAr || 'وثيقة سفر رسمية'}
              </h2>
              <h3 className="text-xs font-semibold text-amber-900/80 tracking-wider uppercase">
                {country?.nameEn || 'OFFICIAL TRAVEL DOCUMENT'}
              </h3>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-amber-950 font-black text-sm">
              <span>جواز سفر</span>
              <span className="text-xs text-amber-800 font-bold">/ PASSPORT</span>
              {/* e-Passport Chip Symbol */}
              <div className="w-5 h-3.5 border border-amber-900 rounded-sm flex items-center justify-center bg-amber-100/80 px-0.5 ml-1">
                <div className="w-full h-1 bg-amber-900 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-amber-200/50 px-1.5 py-0.5 rounded border border-amber-300">
                Type / النوع: {data.documentType || 'P'}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-amber-200/50 px-1.5 py-0.5 rounded border border-amber-300">
                Code / الدولة: {data.issuingState || 'XXX'}
              </span>
            </div>
          </div>
        </div>

        {/* Passport Body: Photo + Fields */}
        <div className="relative z-10 grid grid-cols-12 gap-4 items-start">
          {/* Left Column: Photo & Signature */}
          <div className="col-span-4 flex flex-col items-center space-y-3">
            {/* Photo Box */}
            <div
              className={`relative w-32 h-40 rounded-lg overflow-hidden border-2 bg-slate-200 shadow-md flex items-center justify-center ${
                isFieldActive('photo') ? 'ring-4 ring-blue-500 border-blue-600' : 'border-amber-900/40'
              }`}
            >
              {data.photoUrl ? (
                <img
                  src={data.photoUrl}
                  alt="Passport Holder"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                  <User className="w-12 h-12 stroke-1 mb-1" />
                  <span className="text-[10px]">صورة صاحب الجواز</span>
                  <span className="text-[9px]">Passport Photo</span>
                </div>
              )}

              {/* Official Seal Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent"></div>
              <div className="absolute bottom-1 right-1 opacity-40 bg-amber-900 text-white text-[8px] font-bold px-1 rounded">
                OFFICIAL
              </div>
            </div>

            {/* Holder Signature */}
            <div
              className={`w-full border border-amber-900/30 rounded-md bg-white/60 p-1.5 text-center min-h-[44px] flex flex-col justify-center items-center ${
                isFieldActive('signature') ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              {data.signatureUrl ? (
                <img src={data.signatureUrl} alt="Signature" className="max-h-9 max-w-full object-contain" />
              ) : (
                <span className="text-[10px] font-serif italic text-slate-700">
                  {data.givenNames ? `${data.givenNames} ${data.surname}` : 'توقيع الحامل / Signature'}
                </span>
              )}
              <span className="text-[8px] text-slate-500 border-t border-slate-200 w-full mt-0.5 pt-0.5">
                توقيع صاحب الجواز / Holder's Signature
              </span>
            </div>

            {/* Code 128 Passport Barcode */}
            <div className="w-full flex flex-col items-center bg-white/70 p-1 rounded border border-amber-900/20">
              <canvas ref={code128CanvasRef} className="max-w-full h-8" />
              <span className="text-[9px] font-mono text-slate-600 font-semibold">{data.passportNumber}</span>
            </div>
          </div>

          {/* Right Column: Personal & Passport Details Grid */}
          <div className="col-span-8 space-y-2 text-xs">
            {/* Passport Number Header Bar */}
            <div
              onMouseEnter={() => {
                setHoveredSegment('passportNumber');
                onHoverField?.('passportNumber');
              }}
              onMouseLeave={() => {
                setHoveredSegment(null);
                onHoverField?.(null);
              }}
              className={`p-1.5 rounded transition-all flex items-center justify-between border ${
                isFieldActive('passportNumber')
                  ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                  : 'border-amber-900/20 bg-white/50'
              }`}
            >
              <div className="text-left font-mono">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">PASSPORT NO</span>
                <span className="text-base font-extrabold text-amber-950 tracking-wider">
                  {data.passportNumber || '000000000'}
                </span>
              </div>
              <div className="text-center text-[10px] font-bold text-slate-700 bg-amber-200/60 px-2 py-0.5 rounded border border-amber-300">
                <span>P / YEM</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-semibold">رقم جواز السفر</span>
                <span className="text-base font-extrabold text-amber-950 font-mono tracking-wider">
                  {data.passportNumber || '000000000'}
                </span>
              </div>
            </div>

            {/* Surname (English Left / Arabic Right) */}
            <div
              onMouseEnter={() => {
                setHoveredSegment('surname');
                onHoverField?.('surname');
              }}
              onMouseLeave={() => {
                setHoveredSegment(null);
                onHoverField?.(null);
              }}
              className={`p-1.5 rounded transition-all flex items-center justify-between border ${
                isFieldActive('surname')
                  ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                  : 'border-amber-900/20 bg-white/50'
              }`}
            >
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">SURNAME</span>
                <span className="font-bold text-sm text-slate-900 uppercase font-mono tracking-wide">
                  {data.surname || 'SURNAME'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-semibold">اللقب</span>
                <span className="font-bold text-sm text-slate-900">
                  {data.surnameAr || data.surname || 'اللقب'}
                </span>
              </div>
            </div>

            {/* Given Names (English Left / Arabic Right) */}
            <div
              onMouseEnter={() => {
                setHoveredSegment('givenNames');
                onHoverField?.('givenNames');
              }}
              onMouseLeave={() => {
                setHoveredSegment(null);
                onHoverField?.(null);
              }}
              className={`p-1.5 rounded transition-all flex items-center justify-between border ${
                isFieldActive('givenNames')
                  ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                  : 'border-amber-900/20 bg-white/50'
              }`}
            >
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">GIVEN NAMES</span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 uppercase font-mono tracking-wide">
                  {data.givenNames || 'GIVEN NAMES'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-semibold">الاسم</span>
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  {data.givenNamesAr || data.givenNames || 'الاسم'}
                </span>
              </div>
            </div>

            {/* Profession (English Left / Arabic Right) */}
            <div className="p-1.5 rounded flex items-center justify-between border border-amber-900/20 bg-white/50">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">PROFESSION</span>
                <span className="font-bold text-xs text-slate-800 uppercase font-mono">
                  {data.profession || 'LABORER'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-semibold">المهنة</span>
                <span className="font-bold text-xs text-slate-800">
                  {data.professionAr || data.profession || 'عامل'}
                </span>
              </div>
            </div>

            {/* Place of Birth */}
            <div className="p-1.5 rounded flex items-center justify-between border border-amber-900/20 bg-white/50">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">PLACE OF BIRTH</span>
                <span className="font-bold text-xs text-slate-800 uppercase font-mono">
                  {data.placeOfBirth || 'CITY - COUNTRY'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-semibold">محل الميلاد</span>
                <span className="font-bold text-xs text-slate-800">
                  {data.placeOfBirthAr || data.placeOfBirth || 'محل الميلاد'}
                </span>
              </div>
            </div>

            {/* Date of Birth & Sex */}
            <div className="grid grid-cols-2 gap-2">
              <div
                onMouseEnter={() => {
                  setHoveredSegment('birthDate');
                  onHoverField?.('birthDate');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`p-1.5 rounded transition-all border ${
                  isFieldActive('birthDate')
                    ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                    : 'border-amber-900/20 bg-white/50'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold mb-0.5">
                  <span>DATE OF BIRTH</span>
                  <span>تاريخ الميلاد</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xs font-mono text-slate-900">
                  <span>{data.birthDate ? data.birthDate.split('-').reverse().join('/') : 'DD/MM/YYYY'}</span>
                  <span>{data.birthDate ? data.birthDate.replace(/-/g, '/') : 'YYYY/MM/DD'}</span>
                </div>
              </div>

              <div
                onMouseEnter={() => {
                  setHoveredSegment('sex');
                  onHoverField?.('sex');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`p-1.5 rounded transition-all border ${
                  isFieldActive('sex')
                    ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                    : 'border-amber-900/20 bg-white/50'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold mb-0.5">
                  <span>SEX</span>
                  <span>الجنس</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xs font-mono text-slate-900">
                  <span>{data.sex || 'M'}</span>
                  <span>{data.sex === 'M' ? 'ذكر' : data.sex === 'F' ? 'أنثى' : '<'}</span>
                </div>
              </div>
            </div>

            {/* Date of Issue & Date of Expiry */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-1.5 rounded border border-amber-900/20 bg-white/50">
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold mb-0.5">
                  <span>DATE OF ISSUE</span>
                  <span>تاريخ الإصدار</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xs font-mono text-slate-900">
                  <span>{data.issueDate ? data.issueDate.split('-').reverse().join('/') : 'DD/MM/YYYY'}</span>
                  <span>{data.issueDate ? data.issueDate.replace(/-/g, '/') : 'YYYY/MM/DD'}</span>
                </div>
              </div>

              <div
                onMouseEnter={() => {
                  setHoveredSegment('expiryDate');
                  onHoverField?.('expiryDate');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`p-1.5 rounded transition-all border ${
                  isFieldActive('expiryDate')
                    ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                    : 'border-amber-900/20 bg-white/50'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold mb-0.5">
                  <span>DATE OF EXPIRY</span>
                  <span>تاريخ الإنتهاء</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xs font-mono text-emerald-800">
                  <span>{data.expiryDate ? data.expiryDate.split('-').reverse().join('/') : 'DD/MM/YYYY'}</span>
                  <span>{data.expiryDate ? data.expiryDate.replace(/-/g, '/') : 'YYYY/MM/DD'}</span>
                </div>
              </div>
            </div>

            {/* Issuing Authority */}
            <div className="p-1.5 rounded flex items-center justify-between border border-amber-900/20 bg-white/50">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">ISSUING AUTHORITY</span>
                <span className="text-xs font-bold text-slate-900 uppercase font-mono">
                  {data.issuingAuthority || 'AUTHORITY'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-semibold">جهة الإصدار</span>
                <span className="text-xs font-bold text-slate-900">
                  {data.issuingAuthorityAr || data.issuingAuthority || 'جهة الإصدار'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 2D PDF417 Barcode spanning across page width above MRZ */}
        <div className="relative z-10 mt-3 pt-2 border-t border-amber-900/20 flex flex-col items-center">
          <canvas ref={pdf417CanvasRef} className="w-full h-12 bg-white/90 p-1 border border-slate-300 rounded shadow-xs" />
        </div>

        {/* Bottom Official Machine Readable Zone (MRZ) according to ICAO 9303 */}
        <div className="relative z-10 mt-3 pt-2 border-t-2 border-dashed border-amber-900/30">
          <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
              <QrCode className="w-3 h-3 text-amber-800" />
              منطقة القراءة الآلية الرسمية - ICAO 9303 MRZ Zone (44 Chars x 2 Lines)
            </span>
            <button
              type="button"
              onClick={() => setUseOcrB(!useOcrB)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
                useOcrB
                  ? 'bg-amber-950 text-amber-100 border-amber-900 ring-1 ring-amber-500'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title={lang === 'ar' ? 'تبديل طباعة خط OCR-B القياسي' : 'Toggle official OCR-B font overlay'}
            >
              <Printer className="w-3 h-3 text-amber-400" />
              <span>
                {useOcrB
                  ? (lang === 'ar' ? 'نمط خط OCR-B [مُفعّل]' : 'OCR-B Font [ON]')
                  : (lang === 'ar' ? 'نمط خط OCR-B [معطل]' : 'OCR-B Font [OFF]')}
              </span>
            </button>
          </div>

          <div
            className={`bg-white rounded-lg p-3 border-2 border-slate-900 text-slate-950 shadow-inner overflow-x-auto select-all text-sm md:text-base leading-snug tracking-[0.18em] font-extrabold transition-all ${
              useOcrB ? 'mrz-ocrb-active' : 'font-mono'
            }`}
            style={{
              fontFamily: useOcrB
                ? "'OCR-B', 'OCR-B 10 Pitch', 'OCR-B 10 Pitch BT', 'Courier New', monospace"
                : "'Courier New', Courier, 'Roboto Mono', monospace",
              wordBreak: 'break-all'
            }}
          >
            {/* Line 1 MRZ */}
            <div className="whitespace-nowrap hover:bg-amber-50 px-1 rounded transition-colors py-0.5">
              <span
                onMouseEnter={() => {
                  setHoveredSegment('documentType');
                  onHoverField?.('documentType');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('documentType') ? 'bg-amber-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line1.substring(0, 2)}
              </span>

              <span
                onMouseEnter={() => {
                  setHoveredSegment('issuingState');
                  onHoverField?.('issuingState');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('issuingState') ? 'bg-sky-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line1.substring(2, 5)}
              </span>

              <span
                onMouseEnter={() => {
                  setHoveredSegment('surname');
                  onHoverField?.('surname');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('surname') ? 'bg-emerald-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line1.substring(5, 44)}
              </span>
            </div>

            {/* Line 2 MRZ */}
            <div className="whitespace-nowrap hover:bg-amber-50 px-1 rounded transition-colors py-0.5">
              <span
                onMouseEnter={() => {
                  setHoveredSegment('passportNumber');
                  onHoverField?.('passportNumber');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('passportNumber') ? 'bg-amber-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line2.substring(0, 10)}
              </span>

              <span
                onMouseEnter={() => {
                  setHoveredSegment('nationality');
                  onHoverField?.('nationality');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('nationality') ? 'bg-sky-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line2.substring(10, 13)}
              </span>

              <span
                onMouseEnter={() => {
                  setHoveredSegment('birthDate');
                  onHoverField?.('birthDate');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('birthDate') ? 'bg-yellow-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line2.substring(13, 20)}
              </span>

              <span
                onMouseEnter={() => {
                  setHoveredSegment('sex');
                  onHoverField?.('sex');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('sex') ? 'bg-purple-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line2.substring(20, 21)}
              </span>

              <span
                onMouseEnter={() => {
                  setHoveredSegment('expiryDate');
                  onHoverField?.('expiryDate');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('expiryDate') ? 'bg-rose-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line2.substring(21, 28)}
              </span>

              <span
                onMouseEnter={() => {
                  setHoveredSegment('personalNumber');
                  onHoverField?.('personalNumber');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('personalNumber') ? 'bg-teal-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line2.substring(28, 43)}
              </span>

              <span
                onMouseEnter={() => {
                  setHoveredSegment('composite');
                  onHoverField?.('composite');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`transition-colors ${isFieldActive('composite') ? 'bg-indigo-300 text-slate-950 px-0.5 rounded' : ''}`}
              >
                {mrz.line2.substring(43, 44)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
