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

function formatPassportDate(dateStr?: string) {
  if (!dateStr || !dateStr.trim()) {
    return { en: 'DD/MM/YYYY', ar: 'YYYY/MM/DD' };
  }
  const clean = dateStr.trim();
  let y = '', m = '', d = '';

  const ymdMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    y = ymdMatch[1];
    m = ymdMatch[2].padStart(2, '0');
    d = ymdMatch[3].padStart(2, '0');
  } else {
    const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      d = dmyMatch[1].padStart(2, '0');
      m = dmyMatch[2].padStart(2, '0');
      y = dmyMatch[3];
    } else {
      const digits = clean.replace(/\D/g, '');
      if (digits.length === 8) {
        y = digits.substring(0, 4);
        m = digits.substring(4, 6);
        d = digits.substring(6, 8);
      } else {
        return { en: clean, ar: clean };
      }
    }
  }

  return {
    en: `${d}/${m}/${y}`,
    ar: `${y}/${m}/${d}`
  };
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
        className="relative w-full max-w-[760px] mx-auto guilloche-pattern text-slate-900 rounded-2xl border-2 border-amber-900/30 shadow-2xl p-5 md:p-7 overflow-hidden select-none font-sans"
      >
        {/* Intricate Guilloché Background Security Mesh & Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center">
          <svg className="w-full h-full text-amber-900/20" viewBox="0 0 200 200" preserveAspectRatio="none">
            {/* Fine Wavy Guilloché Rosette Pattern Lines */}
            <path d="M0,100 Q50,0 100,100 T200,100 M0,100 Q50,200 100,100 T200,100" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <path d="M0,80 Q50,180 100,80 T200,80 M0,120 Q50,20 100,120 T200,120" fill="none" stroke="currentColor" strokeWidth="0.3" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="100" cy="100" r="25" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1,2" />
            {/* Republic of Yemen Golden Eagle Coat of Arms Watermark */}
            <g transform="translate(60, 50) scale(0.8)" fill="#b8860b" opacity="0.35">
              <path d="M50 15 C35 15, 25 30, 10 32 C15 45, 25 50, 35 52 C35 62, 42 70, 50 78 C58 70, 65 62, 65 52 C75 50, 85 45, 90 32 C75 30, 65 15, 50 15 Z" />
              <path d="M30 35 L70 35 L65 50 L35 50 Z" fill="#996515" />
            </g>
          </svg>
        </div>

        {/* Vertical Rainbow Iridescent Optical Security Hologram Stripe */}
        <div className="absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 pointer-events-none rainbow-hologram-stripe opacity-50 z-20"></div>

        {/* Micro-text Security Border Frame */}
        <div className="absolute inset-1.5 border border-amber-900/20 rounded-xl pointer-events-none"></div>

        {/* Passport Top Header */}
        <div className="relative z-10 pb-2 mb-3 border-b-2 border-amber-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Golden Coat of Arms Eagle Emblem */}
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-200 border border-amber-500/60 shadow-xs p-1">
              <svg className="w-10 h-10 text-amber-800" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 12 Q20 20 10 35 Q30 45 40 55 Q50 82 50 82 Q50 82 60 55 Q70 45 90 35 Q80 20 50 12 Z" />
                <path d="M35 38 L65 38 L60 54 L40 54 Z" fill="#fef3c7" stroke="currentColor" strokeWidth="1" />
                <circle cx="50" cy="46" r="4" fill="#92400e" />
              </svg>
            </div>

            <div>
              <h2 className="text-xs font-black text-amber-950 uppercase tracking-widest leading-none">
                {country?.nameEn || 'REPUBLIC OF YEMEN'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">PASSPORT</span>
                <span className="text-xs font-bold text-amber-950">جواز سفر</span>
              </div>
            </div>
          </div>

          {/* Center Info: Type & Country Code */}
          <div className="hidden sm:flex flex-col items-center justify-center bg-amber-100/70 px-3 py-1 rounded-md border border-amber-300 shadow-2xs font-mono text-[11px] font-bold text-slate-800">
            <div>TYPE / النوع: <span className="font-extrabold text-amber-950">{data.documentType || 'P'}</span></div>
            <div>CODE / رمز الدولة: <span className="font-extrabold text-amber-950">{data.issuingState || 'YEM'}</span></div>
          </div>

          <div className="text-right flex flex-col items-end">
            <h2 className="text-sm font-black text-amber-950 leading-tight">
              {country?.nameAr || 'الجمهورية اليمنية'}
            </h2>
            <div className="text-[10px] text-slate-600 font-bold mt-0.5">
              رقم جواز السفر / PASSPORT NO.
            </div>
            <div className="text-base font-black font-mono tracking-widest text-amber-950 bg-amber-200/60 px-2 py-0.5 rounded border border-amber-400 shadow-2xs mt-0.5">
              {data.passportNumber || '13966269'}
            </div>
          </div>
        </div>

        {/* Passport Body: Photo + Fields */}
        <div className="relative z-10 grid grid-cols-12 gap-4 items-start">
          {/* Left Column: Photo & Signature */}
          <div className="col-span-4 flex flex-col items-center space-y-3">
            {/* Primary Biometric Photo Box */}
            <div
              className={`relative w-32 md:w-36 h-40 md:h-44 rounded-lg overflow-hidden border-2 bg-slate-200 shadow-md flex items-center justify-center transition-all ${
                isFieldActive('photo') ? 'ring-4 ring-blue-500 border-blue-600 scale-102' : 'border-amber-900/50'
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

              {/* Holographic Security Overlay Sheen */}
              <div className="absolute inset-0 pointer-events-none hologram-sheen opacity-40 mix-blend-screen"></div>

              {/* Official UV Watermark Seal Stamp */}
              <div className="absolute top-1 left-1 opacity-60 bg-amber-900/80 text-amber-100 text-[8px] font-extrabold px-1 rounded backdrop-blur-2xs">
                ICAO 9303
              </div>
              <div className="absolute bottom-1 right-1 opacity-70 bg-amber-950 text-white text-[8px] font-extrabold px-1 rounded shadow-xs">
                OFFICIAL
              </div>
            </div>

            {/* Holder Signature Strip */}
            <div
              className={`w-full border border-amber-900/30 rounded-md bg-white/70 p-1.5 text-center min-h-[44px] flex flex-col justify-center items-center shadow-2xs transition-all ${
                isFieldActive('signature') ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              {data.signatureUrl ? (
                <img src={data.signatureUrl} alt="Signature" className="max-h-9 max-w-full object-contain" />
              ) : (
                <span className="text-[11px] font-serif italic font-bold text-slate-800">
                  {data.givenNames ? `${data.givenNames} ${data.surname}` : 'توقيع الحامل / Signature'}
                </span>
              )}
              <span className="text-[8px] text-slate-500 border-t border-slate-300 w-full mt-0.5 pt-0.5 font-semibold">
                توقيع صاحب الجواز / Holder's Signature
              </span>
            </div>

            {/* Code 128 Passport Barcode */}
            <div className="w-full flex flex-col items-center bg-white/80 p-1 rounded border border-amber-900/20 shadow-2xs">
              <canvas ref={code128CanvasRef} className="max-w-full h-8" />
              <span className="text-[9px] font-mono text-slate-700 font-extrabold tracking-wider">{data.passportNumber}</span>
            </div>
          </div>

          {/* Right Column: Personal & Passport Details Grid + Secondary Ghost Photo */}
          <div className="col-span-8 space-y-2 text-xs relative">
            
            {/* Laser Ghost Photo Overlay (Secondary Security Portrait on Right) */}
            {data.photoUrl && (
              <div className="absolute top-2 right-2 w-16 h-20 rounded border border-amber-800/30 overflow-hidden pointer-events-none opacity-20 laser-ghost-photo hidden sm:block">
                <img src={data.photoUrl} alt="Laser Ghost" className="w-full h-full object-cover" />
              </div>
            )}

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
              className={`p-1.5 rounded-lg transition-all flex items-center justify-between border ${
                isFieldActive('passportNumber')
                  ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                  : 'border-amber-900/25 bg-white/60 shadow-2xs'
              }`}
            >
              <div className="text-left font-mono">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">PASSPORT NO.</span>
                <span className="text-base font-extrabold text-amber-950 tracking-wider">
                  {data.passportNumber || '14704563'}
                </span>
              </div>
              <div className="text-center text-[10px] font-black text-amber-950 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-400 shadow-2xs">
                <span>P / {data.issuingState || 'YEM'}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-bold">رقم جواز السفر</span>
                <span className="text-base font-extrabold text-amber-950 font-mono tracking-wider">
                  {data.passportNumber || '14704563'}
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
              className={`p-1.5 rounded-lg transition-all flex items-center justify-between border ${
                isFieldActive('surname')
                  ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                  : 'border-amber-900/25 bg-white/60 shadow-2xs'
              }`}
            >
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">SURNAME</span>
                <span className="font-extrabold text-sm text-slate-950 uppercase font-mono tracking-wide">
                  {data.surname || 'SURNAME'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-bold">اللقب</span>
                <span className="font-extrabold text-sm text-slate-950">
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
              className={`p-1.5 rounded-lg transition-all flex items-center justify-between border ${
                isFieldActive('givenNames')
                  ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                  : 'border-amber-900/25 bg-white/60 shadow-2xs'
              }`}
            >
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">GIVEN NAMES</span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-950 uppercase font-mono tracking-wide">
                  {data.givenNames || 'GIVEN NAMES'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-bold">الاسم الكامل</span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-950">
                  {data.givenNamesAr || data.givenNames || 'الاسم'}
                </span>
              </div>
            </div>

            {/* Profession & Personal No */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-1.5 rounded-lg flex items-center justify-between border border-amber-900/25 bg-white/60 shadow-2xs">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">PROFESSION</span>
                  <span className="font-extrabold text-xs text-slate-900 uppercase font-mono">
                    {data.profession || 'LABORER'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block font-bold">المهنة</span>
                  <span className="font-extrabold text-xs text-slate-900">
                    {data.professionAr || data.profession || 'عامل'}
                  </span>
                </div>
              </div>

              <div
                onMouseEnter={() => {
                  setHoveredSegment('personalNumber');
                  onHoverField?.('personalNumber');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-between border ${
                  isFieldActive('personalNumber')
                    ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                    : 'border-amber-900/25 bg-white/60 shadow-2xs'
                }`}
              >
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">PERSONAL NO.</span>
                  <span className="font-extrabold text-xs text-slate-900 font-mono">
                    {data.personalNumber || '02010123456'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block font-bold">الرقم الشخصي</span>
                  <span className="font-extrabold text-xs text-slate-900 font-mono">
                    {data.personalNumber || '02010123456'}
                  </span>
                </div>
              </div>
            </div>

            {/* Place of Birth */}
            <div className="p-1.5 rounded-lg flex items-center justify-between border border-amber-900/25 bg-white/60 shadow-2xs">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">PLACE OF BIRTH</span>
                <span className="font-extrabold text-xs text-slate-900 uppercase font-mono">
                  {data.placeOfBirth || 'ALMAHWEET - YEM'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-bold">محل الميلاد</span>
                <span className="font-extrabold text-xs text-slate-900">
                  {data.placeOfBirthAr || data.placeOfBirth || 'المحويت'}
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
                className={`p-1.5 rounded-lg transition-all border ${
                  isFieldActive('birthDate')
                    ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                    : 'border-amber-900/25 bg-white/60 shadow-2xs'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold mb-0.5">
                  <span>DATE OF BIRTH</span>
                  <span>تاريخ الميلاد</span>
                </div>
                <div className="flex justify-between items-center font-extrabold text-xs font-mono text-slate-950">
                  <span>{formatPassportDate(data.birthDate).en}</span>
                  <span>{formatPassportDate(data.birthDate).ar}</span>
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
                className={`p-1.5 rounded-lg transition-all border ${
                  isFieldActive('sex')
                    ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                    : 'border-amber-900/25 bg-white/60 shadow-2xs'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold mb-0.5">
                  <span>SEX</span>
                  <span>الجنس</span>
                </div>
                <div className="flex justify-between items-center font-extrabold text-xs font-mono text-slate-950">
                  <span>{data.sex || 'M'}</span>
                  <span>{data.sex === 'M' ? 'ذكر' : data.sex === 'F' ? 'أنثى' : '<'}</span>
                </div>
              </div>
            </div>

            {/* Date of Issue & Date of Expiry */}
            <div className="grid grid-cols-2 gap-2">
              <div
                onMouseEnter={() => {
                  setHoveredSegment('issueDate');
                  onHoverField?.('issueDate');
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  onHoverField?.(null);
                }}
                className={`p-1.5 rounded-lg transition-all border ${
                  isFieldActive('issueDate')
                    ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400'
                    : 'border-amber-900/25 bg-white/60 shadow-2xs'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold mb-0.5">
                  <span>DATE OF ISSUE</span>
                  <span>تاريخ الإصدار</span>
                </div>
                <div className="flex justify-between items-center font-extrabold text-xs font-mono text-slate-950">
                  <span>{formatPassportDate(data.issueDate).en}</span>
                  <span>{formatPassportDate(data.issueDate).ar}</span>
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
                className={`p-1.5 rounded-lg transition-all border ${
                  isFieldActive('expiryDate')
                    ? 'bg-rose-100 border-rose-600 ring-2 ring-rose-400'
                    : 'border-rose-900/30 bg-rose-50/40 shadow-2xs'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] text-rose-700 font-bold mb-0.5">
                  <span>DATE OF EXPIRY</span>
                  <span>تاريخ الإنتهاء</span>
                </div>
                <div className="flex justify-between items-center font-black text-xs font-mono text-rose-600">
                  <span>{formatPassportDate(data.expiryDate).en}</span>
                  <span>{formatPassportDate(data.expiryDate).ar}</span>
                </div>
              </div>
            </div>

            {/* Issuing Authority */}
            <div className="p-1.5 rounded-lg flex items-center justify-between border border-amber-900/25 bg-white/60 shadow-2xs">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-bold">ISSUING AUTHORITY</span>
                <span className="text-xs font-extrabold text-slate-950 uppercase font-mono">
                  {data.issuingAuthority || 'ALMAHWEET'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block font-bold">جهة الإصدار</span>
                <span className="text-xs font-extrabold text-slate-950">
                  {data.issuingAuthorityAr || data.issuingAuthority || 'المحويت'}
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
