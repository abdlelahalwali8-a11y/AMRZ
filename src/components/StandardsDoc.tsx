import React from 'react';
import { BookOpen, ShieldCheck, Check, Info, FileText } from 'lucide-react';

interface StandardsDocProps {
  lang?: 'ar' | 'en';
}

export const StandardsDoc: React.FC<StandardsDocProps> = ({ lang = 'ar' }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/60 rounded-xl flex items-center justify-center text-amber-700 dark:text-amber-300">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'ar' ? 'الدليل المعياري الدولي للقراءة الآلية (ICAO Doc 9303 Specifications)' : 'ICAO Doc 9303 Standards Guide'}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'ar'
              ? 'المواصفات الفنية الرسمية للجوازات والوثائق الصادرة عن منظمة الطيران المدني الدولي (ICAO)'
              : 'Official Technical Specifications for Machine Readable Travel Documents (MRTD)'}
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <h4 className="font-bold text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            هيكلية السطر الأول (Line 1 - 44 Characters)
          </h4>
          <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300 font-mono">
            <li><strong>الخانات 1-2:</strong> رمز نوع الوثيقة (مثال: P&lt; للجواز العادي، PD للدبلوماسي)</li>
            <li><strong>الخانات 3-5:</strong> رمز دولة الإصدار المعياري ISO 3166-1 (مثال: SAU, YEM, EGY)</li>
            <li><strong>الخانات 6-44:</strong> اسم صاحب الجواز (اللقب &lt;&lt; الأسماء الأولى) مفصولة بـ &lt;</li>
          </ul>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <h4 className="font-bold text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            هيكلية السطر الثاني (Line 2 - 44 Characters)
          </h4>
          <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300 font-mono">
            <li><strong>الخانات 1-9:</strong> رقم الجواز (متبوعاً بـ &lt; إذا أقل من 9)</li>
            <li><strong>الخانة 10:</strong> رمز التحقق لرقم الجواز (Check Digit)</li>
            <li><strong>الخانات 11-13:</strong> رمز جنسية المالك (ISO 3166-1)</li>
            <li><strong>الخانات 14-19:</strong> تاريخ الميلاد بترميز YYMMDD + الخانة 20 رمز التحقق</li>
            <li><strong>الخانة 21:</strong> الجنس (M / F / &lt;)</li>
            <li><strong>الخانات 22-27:</strong> تاريخ الانتهاء بترميز YYMMDD + الخانة 28 رمز التحقق</li>
            <li><strong>الخانات 29-42:</strong> الرقم القومي / الشخصي (14 خانة) + الخانة 43 رمز التحقق</li>
            <li><strong>الخانة 44:</strong> رمز التحقق الشامل للجواز (Composite Checksum)</li>
          </ul>
        </div>
      </div>

      {/* Algorithm Math Breakdown Card */}
      <div className="p-5 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
        <h4 className="font-bold text-xs text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700" />
          خوارزمية حساب أرقام التحقق (7-3-1 Weight Modulo 10 Algorithm)
        </h4>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          تعتمد جميع الجوازات الرسمية عالمياً على أوزان تكرارية تتبع النمط <strong>[7, 3, 1]</strong> لحساب رمز التحقق.
          يتم تحويل الأحرف إلى أرقام كالآتي:
          <span className="font-mono bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded mx-1">0-9 → 0-9</span>
          <span className="font-mono bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded mx-1">A-Z → 10-35</span>
          <span className="font-mono bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded mx-1">&lt; → 0</span>.
          ثم يُحسب مجموع ضرب القيم بأوزانها، والناتج النهائي هو باقي القسمة على 10 (Modulo 10).
        </p>
      </div>
    </div>
  );
};
