import React from 'react';
import { ShieldCheck, Cpu, Code2, Plane } from 'lucide-react';

interface FooterProps {
  lang: 'ar' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  return (
    <footer className="mt-16 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'ar' 
              ? 'نظام معتمد طبقاً لمعايير وثائق السفر المقروءة آلياً (ICAO Doc 9303 Part 4 - TD3)' 
              : 'Compliant with ICAO Doc 9303 Part 4 (TD3 MRTD Standard)'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            Gemini 3.6 Flash AI OCR
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            PDF417 & MRZ Generator
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Plane className="w-3.5 h-3.5 text-amber-400" />
            Border Control Compliant
          </span>
        </div>
      </div>
    </footer>
  );
};
