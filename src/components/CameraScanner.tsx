import React, { useRef, useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  FileText,
  Scan,
  ShieldCheck
} from 'lucide-react';
import { PassportData } from '../types/passport';
import { parseMRZ, formatYYMMDDToISO } from '../utils/mrzParser';

interface CameraScannerProps {
  onScanComplete: (passportData: PassportData) => void;
  lang?: 'ar' | 'en';
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onScanComplete, lang = 'ar' }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [detectedData, setDetectedData] = useState<PassportData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setErrorMessage(
        lang === 'ar' 
          ? 'تعذر الوصول إلى الكاميرا. يرجى التأكد من إعطاء الإذن أو استخدام زر رفع الصورة.' 
          : 'Unable to access camera. Please allow permissions or upload an image.'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    processImageWithAI(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedImage(reader.result);
        processImageWithAI(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const sanitizeDateString = (d: any, fallback: string): string => {
    if (typeof d !== 'string' || !d) return fallback;
    const clean = d.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
      const [dd, mm, yyyy] = clean.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
    return fallback;
  };

  const processImageWithAI = async (base64Image: string) => {
    setIsProcessing(true);
    setScanStatus(lang === 'ar' ? 'جارٍ فحص وتحليل صورة الجواز والـ MRZ بواسطة الذكاء الاصطناعي...' : 'Analyzing passport image & MRZ with AI...');
    setErrorMessage(null);
    setDetectedData(null);

    try {
      const response = await fetch('/api/scan-passport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        const parsedJson = result.data;

        // MRZ verification
        let mrzParsed: any = null;
        if (parsedJson.mrzLine1 && parsedJson.mrzLine2) {
          mrzParsed = parseMRZ(`${parsedJson.mrzLine1}\n${parsedJson.mrzLine2}`);
        }

        let mrzBirthDate = '';
        let mrzExpiryDate = '';
        if (mrzParsed?.parsedFields) {
          if (mrzParsed.parsedFields.birthDateYYMMDD) {
            mrzBirthDate = formatYYMMDDToISO(mrzParsed.parsedFields.birthDateYYMMDD, true);
          }
          if (mrzParsed.parsedFields.expiryDateYYMMDD) {
            mrzExpiryDate = formatYYMMDDToISO(mrzParsed.parsedFields.expiryDateYYMMDD, false);
          }
        }

        const birthDate = sanitizeDateString(parsedJson.birthDate || mrzBirthDate, '');
        const expiryDate = sanitizeDateString(parsedJson.expiryDate || mrzExpiryDate, '');
        
        let issueDate = sanitizeDateString(parsedJson.issueDate, '');
        if (!issueDate && expiryDate) {
          const expYear = parseInt(expiryDate.substring(0, 4), 10);
          if (!isNaN(expYear)) {
            issueDate = `${expYear - 6}${expiryDate.substring(4)}`;
          }
        }

        const extractedPassport: PassportData = {
          id: `scanned-${Date.now()}`,
          documentType: parsedJson.documentType || 'P',
          documentSubtype: '<',
          issuingState: (parsedJson.issuingState || mrzParsed?.parsedFields?.issuingState || '').toUpperCase(),
          surname: (parsedJson.surname || mrzParsed?.parsedFields?.surname || '').toUpperCase(),
          surnameAr: parsedJson.surnameAr || '',
          givenNames: (parsedJson.givenNames || mrzParsed?.parsedFields?.givenNames || '').toUpperCase(),
          givenNamesAr: parsedJson.givenNamesAr || '',
          passportNumber: (parsedJson.passportNumber || mrzParsed?.parsedFields?.passportNumber || '').toUpperCase(),
          nationality: (parsedJson.nationality || mrzParsed?.parsedFields?.nationality || '').toUpperCase(),
          birthDate,
          sex: (parsedJson.sex === 'F' || mrzParsed?.parsedFields?.sex === 'F') ? 'F' : 'M',
          expiryDate,
          issueDate,
          profession: parsedJson.profession || '',
          professionAr: parsedJson.professionAr || '',
          placeOfBirth: parsedJson.placeOfBirth || '',
          placeOfBirthAr: parsedJson.placeOfBirthAr || '',
          issuingAuthority: parsedJson.issuingAuthority || '',
          issuingAuthorityAr: parsedJson.issuingAuthorityAr || '',
          personalNumber: parsedJson.personalNumber || '',
          photoUrl: base64Image,
          signatureUrl: ''
        };

        setDetectedData(extractedPassport);
        setScanStatus(lang === 'ar' ? 'تم استخراج وقراءة جميع بيانات الجواز والـ MRZ بنجاح تام!' : 'Passport OCR completed successfully!');
      } else {
        throw new Error(result.error || 'Failed to parse passport');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(
        lang === 'ar'
          ? `حدث خطأ أثناء معالجة الصورة: ${err.message || 'يرجى التأكد من وضوح الصورة والاتصال بالإنترنت'}`
          : `Processing failed: ${err.message}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyData = () => {
    if (detectedData) {
      onScanComplete(detectedData);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Scanner Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            {lang === 'ar' ? 'المسح الضوئي الذكي بالذكاء الاصطناعي (AI Passport Scanner)' : 'AI Smart Passport Scanner'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ar' ? 'التقط صورة جواز السفر أو ارفعها من جهازك ليتم استخراج البيانات باللغتين العربية والإنجليزية وأسطر MRZ فوراً' : 'Capture or upload passport photo to extract all Latin/Arabic fields & MRZ'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isCameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Camera className="w-4 h-4" />
              {lang === 'ar' ? 'فتح الكاميرا والمسح المباشر' : 'Start Camera Scan'}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              {lang === 'ar' ? 'إيقاف الكاميرا' : 'Stop Camera'}
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            {lang === 'ar' ? 'رفع صورة من الجهاز' : 'Upload Image'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Camera Live Stream & Viewport */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 shadow-2xl flex flex-col items-center justify-center">
          <video ref={videoRef} playsInline autoPlay className="w-full max-h-[480px] object-cover" />
          
          {/* Alignment Guides */}
          <div className="absolute inset-8 sm:inset-16 border-2 border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-4">
            <div className="text-center text-xs font-bold bg-emerald-950/80 text-emerald-300 py-1 px-3 rounded-full mx-auto backdrop-blur-sm">
              {lang === 'ar' ? 'وجّه صفحة بيانات الجواز وأسطر MRZ داخل هذا الإطار' : 'Align passport page & MRZ lines inside frame'}
            </div>
            <div className="border-t-2 border-dashed border-emerald-400 text-center text-[10px] text-emerald-200 pt-1">
              {lang === 'ar' ? 'منطقة القراءة الآلية (MRZ Zone)' : 'Machine Readable Zone'}
            </div>
          </div>

          {/* Capture Trigger Button */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center">
            <button
              type="button"
              onClick={capturePhoto}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-full shadow-2xl flex items-center gap-2 transform active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              {lang === 'ar' ? 'التقاط الصورة وتحليلها' : 'Capture & Analyze'}
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for taking snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Processing Status Banner */}
      {isProcessing && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-300">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-sm block">{scanStatus}</span>
            <span className="text-xs text-amber-400/80 block mt-0.5">
              {lang === 'ar' ? 'يتم قراءة النصوص وتدقيق رموز ICAO Doc 9303' : 'Reading text & verifying ICAO 9303 checksums'}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Extracted Data Result Card */}
      {detectedData && !isProcessing && (
        <div className="p-6 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm sm:text-base text-emerald-200">
                  {lang === 'ar' ? 'تم استخراج بيانات الجواز والقراءة الآلية بنجاح!' : 'Passport Data Successfully Extracted!'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'راجع الحقول المستخرجة أدناه ثم انقر على اعتماد لنقلها إلى محرر الجواز' : 'Review fields below and apply to editor'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyData}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              {lang === 'ar' ? 'اعتماد ونقل البيانات إلى المحرر' : 'Apply & Send to Editor'}
            </button>
          </div>

          {/* Extracted Fields Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-slate-900/90 p-4 rounded-xl border border-emerald-500/20">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {lang === 'ar' ? 'رقم الجواز' : 'Passport No.'}
              </span>
              <span className="font-mono font-black text-amber-400 text-sm">{detectedData.passportNumber || '-'}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {lang === 'ar' ? 'الاسم بالإنجليزية' : 'Name (Latin)'}
              </span>
              <span className="font-mono font-bold text-slate-100 truncate block">
                {detectedData.surname} {detectedData.givenNames}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {lang === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)'}
              </span>
              <span className="font-bold text-slate-100 truncate block">
                {detectedData.givenNamesAr} {detectedData.surnameAr || '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {lang === 'ar' ? 'الدولة والجنسية' : 'Country / Nationality'}
              </span>
              <span className="font-mono font-bold text-slate-100">
                {detectedData.issuingState} / {detectedData.nationality}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {lang === 'ar' ? 'تاريخ الميلاد والنوع' : 'DOB & Sex'}
              </span>
              <span className="font-mono font-bold text-slate-100">
                {detectedData.birthDate || '-'} ({detectedData.sex === 'F' ? 'F' : 'M'})
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {lang === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}
              </span>
              <span className="font-mono font-bold text-slate-100">{detectedData.issueDate || '-'}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </span>
              <span className="font-mono font-bold text-rose-400">{detectedData.expiryDate || '-'}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {lang === 'ar' ? 'الرقم الوطني / الشخصي' : 'National ID'}
              </span>
              <span className="font-mono font-bold text-slate-100">{detectedData.personalNumber || '-'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
