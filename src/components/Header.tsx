import React from 'react';
import { 
  FileCode2, 
  ScanLine, 
  CheckCheck, 
  QrCode, 
  FolderArchive, 
  BookOpen, 
  Sparkles, 
  Moon, 
  Sun,
  Globe
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'ar' | 'en';
  setLang: (l: 'ar' | 'en') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  darkMode,
  setDarkMode
}) => {
  const navItems = [
    { id: 'editor', labelAr: 'محرر الجواز والبيانات', labelEn: 'Passport Editor', icon: FileCode2 },
    { id: 'scanner', labelAr: 'المسح الضوئي الذكي (AI OCR)', labelEn: 'AI Scanner', icon: ScanLine, highlight: true },
    { id: 'validator', labelAr: 'فحص وتدقيق MRZ', labelEn: 'MRZ Validator', icon: CheckCheck },
    { id: 'barcode', labelAr: 'استوديو PDF417 & الباركود', labelEn: 'Barcode Studio', icon: QrCode },
    { id: 'registry', labelAr: 'سجل الوثائق المحفوظة', labelEn: 'Registry', icon: FolderArchive },
    { id: 'standards', labelAr: 'معايير ICAO 9303', labelEn: 'ICAO Standards', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
              <span className="text-xl sm:text-2xl">🛂</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">
                  {lang === 'ar' ? 'نظام الجوازات والقراءة الآلية' : 'ICAO 9303 Passport System'}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  TD3 / PDF417
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {lang === 'ar' ? 'معيار منظمة الطيران المدني الدولي ICAO Doc 9303' : 'International Civil Aviation Organization Doc 9303 Standard'}
              </p>
            </div>
          </div>

          {/* Quick Actions (Lang & Theme) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
              title="تغيير اللغة / Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="تغيير المظهر / Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
          {navItems.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                    : tab.highlight
                    ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : tab.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
                {tab.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
