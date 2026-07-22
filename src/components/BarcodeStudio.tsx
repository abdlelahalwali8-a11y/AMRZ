import React, { useRef, useEffect, useState } from 'react';
import { PassportData } from '../types/passport';
import { BarcodeType, renderBarcodeToCanvas, formatPassportPDF417Data } from '../utils/barcodeGenerator';
import { generateTD3MRZ } from '../utils/mrzGenerator';
import { QrCode, Download, Settings, RefreshCw, Layers } from 'lucide-react';

interface BarcodeStudioProps {
  passportData: PassportData;
  lang?: 'ar' | 'en';
}

export const BarcodeStudio: React.FC<BarcodeStudioProps> = ({ passportData, lang = 'ar' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('pdf417');
  const [scale, setScale] = useState<number>(3);
  const [height, setHeight] = useState<number>(15);
  const [includeText, setIncludeText] = useState<boolean>(true);
  const [customText, setCustomText] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);

  const mrz = generateTD3MRZ(passportData);

  useEffect(() => {
    // Default text payloads based on selected barcode format
    if (barcodeType === 'pdf417') {
      setCustomText(formatPassportPDF417Data(mrz.line1, mrz.line2, passportData.passportNumber, passportData.personalNumber));
    } else if (barcodeType === 'code128' || barcodeType === 'code39') {
      setCustomText(passportData.passportNumber || 'N12345678');
    } else if (barcodeType === 'qrcode' || barcodeType === 'datamatrix' || barcodeType === 'aztec') {
      setCustomText(`ICAO_MRTD\nPN:${passportData.passportNumber}\nNAT:${passportData.nationality}\nMRZ:\n${mrz.line1}\n${mrz.line2}`);
    }
  }, [barcodeType, passportData.passportNumber, mrz.line1, mrz.line2]);

  useEffect(() => {
    if (!canvasRef.current || !customText) return;
    setRenderError(null);

    renderBarcodeToCanvas(canvasRef.current, {
      bcid: barcodeType,
      text: customText,
      scale: scale,
      height: height,
      includeText: includeText && (barcodeType === 'code128' || barcodeType === 'code39')
    }).catch((err) => {
      console.error(err);
      setRenderError('تعذر إنتاج الباركود بهذا النص أو الأبعاد المختارة');
    });
  }, [barcodeType, customText, scale, height, includeText]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `Barcode_${barcodeType}_${passportData.passportNumber || 'Doc'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & Options */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            {lang === 'ar' ? 'استوديو توليد الباركود الرسمي (Official Passport Barcode Studio)' : 'Passport Barcode Studio'}
          </label>
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'تحميل الباركود PNG' : 'Download PNG'}
          </button>
        </div>

        {/* Barcode Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            {lang === 'ar' ? 'اختر نوع الباركود المعياري (Barcode Standard)' : 'Select Barcode Standard'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <button
              type="button"
              onClick={() => setBarcodeType('pdf417')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                barcodeType === 'pdf417'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-[10px] opacity-80 block font-normal">2D Barcode</div>
              PDF417 (معياري)
            </button>

            <button
              type="button"
              onClick={() => setBarcodeType('code128')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                barcodeType === 'code128'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-[10px] opacity-80 block font-normal">1D Barcode</div>
              Code 128
            </button>

            <button
              type="button"
              onClick={() => setBarcodeType('qrcode')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                barcodeType === 'qrcode'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-[10px] opacity-80 block font-normal">2D Matrix</div>
              QR Code
            </button>

            <button
              type="button"
              onClick={() => setBarcodeType('datamatrix')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                barcodeType === 'datamatrix'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-[10px] opacity-80 block font-normal">2D Compact</div>
              Data Matrix
            </button>

            <button
              type="button"
              onClick={() => setBarcodeType('code39')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                barcodeType === 'code39'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-[10px] opacity-80 block font-normal">1D Legacy</div>
              Code 39
            </button>

            <button
              type="button"
              onClick={() => setBarcodeType('aztec')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                barcodeType === 'aztec'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-[10px] opacity-80 block font-normal">2D High Density</div>
              Aztec Code
            </button>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              حجم التكبير / Scale ({scale}x)
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ارتفاع الباركود / Bar Height ({height}px)
            </label>
            <input
              type="range"
              min={5}
              max={40}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="flex items-center pt-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeText}
                onChange={(e) => setIncludeText(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              إظهار النص المقروء تحت الباركود (Text Label)
            </label>
          </div>
        </div>

        {/* Payload Editor */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'محتوى البيانات المضمنة داخل الباركود (Barcode Payload)' : 'Barcode Payload Data'}
          </label>
          <textarea
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Barcode Output Preview Canvas Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center min-h-[220px]">
        {renderError ? (
          <div className="text-center text-rose-600 text-xs font-semibold p-4 border border-rose-200 rounded-xl bg-rose-50">
            {renderError}
          </div>
        ) : (
          <div className="p-4 bg-white rounded-xl shadow-inner border border-slate-200 flex flex-col items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full" />
            <div className="mt-2 text-[10px] text-slate-400 font-mono">
              SPECIMEN BARCODE • {barcodeType.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
