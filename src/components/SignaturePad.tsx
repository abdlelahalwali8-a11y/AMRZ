import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pen, Check } from 'lucide-react';

interface SignaturePadProps {
  value: string; // base64 data URL
  onChange: (dataUrl: string) => void;
  lang?: 'ar' | 'en';
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ value, onChange, lang = 'ar' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [signatureText, setSignatureText] = useState('');

  useEffect(() => {
    if (value && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = value;
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // dark navy signature ink
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange('');
    setSignatureText('');
  };

  const handleTextSignatureChange = (text: string) => {
    setSignatureText(text);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (text.trim()) {
      ctx.font = 'italic 28px "Brush Script MT", "Caveat", "Segoe Script", cursive';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    onChange(canvas.toDataURL());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <Pen className="w-3.5 h-3.5 text-blue-600" />
          {lang === 'ar' ? 'التوقيع الرقمي للمالك (Digital Signature)' : 'Holder Digital Signature'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTextMode(!textMode)}
            className="text-xs text-blue-600 hover:underline"
          >
            {textMode
              ? lang === 'ar' ? 'الرسم باليد' : 'Draw by Hand'
              : lang === 'ar' ? 'كتابة اسم' : 'Type Name'}
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            <Eraser className="w-3 h-3" />
            {lang === 'ar' ? 'مسح' : 'Clear'}
          </button>
        </div>
      </div>

      {textMode ? (
        <div className="space-y-2">
          <input
            type="text"
            value={signatureText}
            onChange={(e) => handleTextSignatureChange(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب اسم صاحب الجواز هنا...' : 'Type signature text...'}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      ) : null}

      <div className="relative border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={360}
          height={90}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-24 cursor-crosshair touch-none bg-transparent"
        />
        <div className="absolute bottom-1 left-2 text-[10px] text-slate-400 select-none pointer-events-none">
          {lang === 'ar' ? 'منطقة التوقيع الإلزامية' : 'Mandatory Signature Area'}
        </div>
      </div>
    </div>
  );
};
