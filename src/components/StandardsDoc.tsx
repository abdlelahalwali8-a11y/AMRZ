import React from 'react';
import { BookOpen, ShieldCheck, FileCode, CheckCircle, ExternalLink } from 'lucide-react';

interface StandardsDocProps {
  lang?: 'ar' | 'en';
}

export const StandardsDoc: React.FC<StandardsDocProps> = ({ lang = 'ar' }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          {lang === 'ar' ? 'الدليل المعياري لمنظمة الطيران المدني الدولي (ICAO Doc 9303)' : 'ICAO Doc 9303 Standard Guidelines'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {lang === 'ar' ? 'شرح تفصيلي لبنية أسطر القراءة الآلية MRZ TD3 وخوارزميات أرقام التحقق والباركود' : 'Detailed specification for TD3 MRZ, checksums, and border control barcodes'}
        </p>
      </div>

      {/* Grid of specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
        
        {/* TD3 Structure */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            {lang === 'ar' ? '1. هيكلية جوازات السفر TD3 (سطرين × 44 حرفاً)' : '1. TD3 MRTD Layout (2 lines x 44 chars)'}
          </h3>
          
          <div className="space-y-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-400">
              <div><strong>Line 1:</strong> P&lt;[State 3][Surname]&lt;&lt;[Given Names]...</div>
              <div><strong>Line 2:</strong> [Passport 9][Chk 1][Nat 3][DOB 6][Chk 1][Sex 1][Exp 6][Chk 1][ID 14][Chk 1][Composite 1]</div>
            </div>
            
            <p className="leading-relaxed">
              {lang === 'ar'
                ? 'وفق الجزء الرابع من وثيقة ICAO Doc 9303، يتكون سطر MRZ الخاص بجواز السفر القياسي من 44 خانة ثابتة تحتوي حصراً على الحروف اللاتينية الكبيرة (A-Z)، والأرقام (0-9)، ورمز الملء الفاصل (<).'
                : 'Under ICAO Doc 9303 Part 4, passport MRZ contains exactly 2 lines of 44 characters containing uppercase A-Z, 0-9, and < filler.'}
            </p>
          </div>
        </div>

        {/* Checksum Weights 7-3-1 */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            {lang === 'ar' ? '2. خوارزمية أرقام التحقق (7-3-1 Weight Algorithm)' : '2. 7-3-1 Checksum Weight Algorithm'}
          </h3>

          <div className="space-y-2 leading-relaxed">
            <p>
              {lang === 'ar'
                ? 'يتم فحص وتدقيق كل حقل رقمي بضرب القيم في تسلسل الأوزان الدورية [7, 3, 1] وحساب باقي القسمة على 10 (Modulo 10).'
                : 'Characters are mapped to numeric values (A=10..Z=35, <=0) multiplied by repeating weights 7, 3, 1, and modulo 10 is calculated.'}
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span>0-9:</span>
                <span className="font-mono text-slate-200">القيم 0 إلى 9</span>
              </div>
              <div className="flex justify-between">
                <span>A-Z:</span>
                <span className="font-mono text-slate-200">القيم 10 إلى 35</span>
              </div>
              <div className="flex justify-between">
                <span>رمز الملء (&lt;):</span>
                <span className="font-mono text-slate-200">القيمة 0</span>
              </div>
            </div>
          </div>
        </div>

        {/* PDF417 & 2D Barcodes */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            {lang === 'ar' ? '3. معايير باركود PDF417' : '3. PDF417 Barcode Standard'}
          </h3>

          <p className="leading-relaxed">
            {lang === 'ar'
              ? 'باركود مصفوفي ثنائي الأبعاد عالي الكثافة (2D Barcode) معتمد عالمياً في أنظمة مراقبة الحدود والمنافذ، يتميز بقدرة عالية على تصحيح الأخطاء (Error Correction Levels 0 to 8) حتى في حال تلف جزء من الوثيقة.'
              : 'High-density 2D barcode widely adopted by border control agencies for document security and automated passenger clearance.'}
          </p>
        </div>

        {/* ICAO Doc 9303 Compliance Links */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              {lang === 'ar' ? '4. المراجع الرسمية المعتمدة' : '4. Official Standards & Specs'}
            </h3>
            <p className="leading-relaxed mt-2">
              {lang === 'ar'
                ? 'تم بناء هذا النظام استناداً إلى أحدث وثائق منظمة الطيران المدني الدولي (ICAO) التابعة للأمم المتحدة والمواصفة القياسية ISO/IEC 7501-1.'
                : 'Built according to United Nations ICAO Doc 9303 MRTD specifications and ISO/IEC 7501-1 standards.'}
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            ICAO Doc 9303 • Machine Readable Travel Documents • Part 4 (TD3 Format)
          </div>
        </div>

      </div>
    </div>
  );
};
