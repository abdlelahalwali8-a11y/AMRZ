import React, { useRef, useState, useEffect } from 'react';
import { 
  QrCode, 
  Download, 
  Settings2, 
  Layers, 
  FileCode, 
  ShieldCheck, 
  Copy, 
  Check 
} from 'lucide-react';
import { PassportData, BarcodeConfig } from '../types/passport';
import { renderBarcodeToCanvas, buildBarcodePayload } from '../utils/barcodeGenerator';

interface BarcodeStudioProps {
  passport: PassportData;
  lang?: 'ar' | 'en';
}

export const BarcodeStudio: React.FC<BarcodeStudioProps> = ({ passport, lang = 'ar' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [config, setConfig] = useState<BarcodeConfig>({
    type: 'pdf417',
    includeMRZ: true,
    includePersonalData: true,
    includeRawJson: false,
    scale: 3,
    securityLevel: 4,
    customPrefix: ''
  });

  const [copiedPayload, setCopiedPayload] = useState(false);

  const payload = buildBarcodePayload(passport, config);

  useEffect(() => {
    if (canvasRef.current) {
      renderBarcodeToCanvas(canvasRef.current, payload, config).catch(err => {
        console.error('Barcode render error:', err);
      });
    }
  }, [passport, config, payload]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Barcode_${config.type.toUpperCase()}_${passport.passportNumber || 'Doc'}.png`;
    a.click();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Studio Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            {lang === 'ar' ? 'استوديو توليد وتخصيص الباركود (PDF417 & 2D Barcodes)' : '2D Barcode & PDF417 Studio'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ar' ? 'توليد باركودات عالية الدقة متوافقة مع أجهزة فحص المنافذ والمطارات' : 'High-density barcode generation compliant with border control scanners'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" />
          {lang === 'ar' ? 'تحميل صورة الباركود (PNG)' : 'Download Barcode PNG'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Settings2 className="w-4 h-4 text-amber-400" />
              {lang === 'ar' ? 'إعدادات الترميز والنوع' : 'Barcode Settings'}
            </h3>

            {/* Symbology Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {lang === 'ar' ? 'نوع الباركود (Symbology):' : 'Barcode Symbology:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'pdf417', name: 'PDF417 (معتمد ICAO)' },
                  { id: 'qrcode', name: 'QR Code (رمز استجابة)' },
                  { id: 'datamatrix', name: 'Data Matrix' },
                  { id: 'code128', name: 'Code 128 (خطي)' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, type: item.id as any }))}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-right transition-all ${
                      config.type === item.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* PDF417 Error Correction Level */}
            {config.type === 'pdf417' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'مستوى تصحيح الأخطاء (Security Level):' : 'Error Correction Level:'}
                </label>
                <select
                  value={config.securityLevel ?? 4}
                  onChange={(e) => setConfig(prev => ({ ...prev, securityLevel: parseInt(e.target.value, 10) }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={2}>Level 2 (مستندات صغيرة)</option>
                  <option value={4}>Level 4 (معياري - موصى به لمنافذ الجوازات)</option>
                  <option value={6}>Level 6 (أمان عالي ومقاومة للتلف)</option>
                  <option value={8}>Level 8 (أقصى حماية وتكرار بيانات)</option>
                </select>
              </div>
            )}

            {/* Scale Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                <span>{lang === 'ar' ? 'حجم ومقياس الرسم (Scale):' : 'Scale / Resolution:'}</span>
                <span className="font-mono text-amber-400">{config.scale}x</span>
              </div>
              <input
                type="range"
                min={2}
                max={6}
                step={1}
                value={config.scale}
                onChange={(e) => setConfig(prev => ({ ...prev, scale: parseInt(e.target.value, 10) }))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Live Barcode Rendering & Payload Column */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Canvas Box */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center min-h-[220px]">
            <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-300 max-w-full overflow-x-auto flex justify-center">
              <canvas ref={canvasRef} />
            </div>
          </div>

          {/* Payload Raw Content */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-400" />
                {lang === 'ar' ? 'حمولة البيانات داخل الباركود (Payload Data):' : 'Payload Content:'}
              </span>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
              >
                {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedPayload ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ' : 'Copy')}
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {payload}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
