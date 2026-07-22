import React from 'react';
import { ActiveTab } from '../types/passport';
import {
  FileCode2,
  ShieldCheck,
  QrCode,
  Camera,
  Bookmark,
  BookOpen,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  lang: 'ar' | 'en';
  onLanguageToggle: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  lang,
  onLanguageToggle,
  isDarkMode,
  onThemeToggle
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-900/30 ring-2 ring-amber-400/30">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight flex items-center gap-2">
              {lang === 'ar' ? 'نظام القراءة الآلية والباركود للجوازات الرسمية' : 'ICAO Passport MRZ & Barcode System'}
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                ICAO 9303
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {lang === 'ar'
                ? 'مولد ومحلل كود الـ MRZ وأكواد الباركود لجوازات السفر والوثائق الرسمية'
                : 'Official Passport MRZ Generator, Scanner & Barcode Studio'}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={onLanguageToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Dark Mode Switcher */}
          <button
            type="button"
            onClick={onThemeToggle}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 min-w-max py-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onTabChange('editor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'editor'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            {lang === 'ar' ? 'إنشاء ومعاينة الجواز' : 'Passport Editor'}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('validator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'validator'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {lang === 'ar' ? 'مُدقق رموز الـ MRZ' : 'MRZ Inspector'}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('barcodes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'barcodes'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            {lang === 'ar' ? 'استوديو الباركود (PDF417)' : 'Barcode Studio'}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('scanner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'scanner'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            {lang === 'ar' ? 'المسح الذكي (AI OCR)' : 'AI Scanner'}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('registry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'registry'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            {lang === 'ar' ? 'سجل الجوازات' : 'Saved Registry'}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('standards')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'standards'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {lang === 'ar' ? 'المعايير الدولية ICAO' : 'ICAO Specs'}
          </button>
        </div>
      </div>
    </header>
  );
};
