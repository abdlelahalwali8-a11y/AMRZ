import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  lang?: 'ar' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ lang = 'ar' }) => {
  return (
    <footer className="mt-12 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-slate-200">
            {lang === 'ar' ? 'نظام القراءة الآلية والباركود للجوازات الرسمية المعيارية' : 'ICAO Official Passport System'}
          </span>
        </div>

        <p className="text-slate-500">
          {lang === 'ar'
            ? 'متوافق 100% مع مواصفات منظمة الطيران المدني الدولي ICAO Doc 9303 Part 3/4'
            : '100% Compliant with ICAO Document 9303 Part 3 & 4 Standard Specs'}
        </p>

        <div className="text-slate-500 font-mono text-[11px]">
          7-3-1 Modulo 10 Checksum Engine • PDF417 / Code 128
        </div>
      </div>
    </footer>
  );
};
