import React, { useState, useEffect } from 'react';
import { 
  FolderArchive, 
  Trash2, 
  Download, 
  Upload, 
  Eye, 
  Plus, 
  Search, 
  Calendar, 
  Check, 
  FileText,
  User
} from 'lucide-react';
import { PassportData } from '../types/passport';
import { COUNTRIES } from '../utils/countryData';

interface PassportRegistryProps {
  currentPassport: PassportData;
  onSelectPassport: (passport: PassportData) => void;
  lang?: 'ar' | 'en';
}

const STORAGE_KEY = 'icao_saved_passports_registry_v1';

export const PassportRegistry: React.FC<PassportRegistryProps> = ({
  currentPassport,
  onSelectPassport,
  lang = 'ar'
}) => {
  const [registry, setRegistry] = useState<PassportData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRegistry(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error reading registry:', e);
    }
  }, []);

  const saveToRegistry = (passport: PassportData) => {
    setRegistry(prev => {
      const filtered = prev.filter(p => p.id !== passport.id);
      const updated = [passport, ...filtered];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const deleteFromRegistry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRegistry(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registry, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `ICAO_Passport_Registry_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setRegistry(prev => {
            const combined = [...imported, ...prev];
            // remove duplicates by ID
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
            return unique;
          });
        }
      } catch (err) {
        console.error('Error importing JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  const filtered = registry.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      (p.passportNumber || '').toLowerCase().includes(term) ||
      (p.surname || '').toLowerCase().includes(term) ||
      (p.givenNames || '').toLowerCase().includes(term) ||
      (p.surnameAr || '').toLowerCase().includes(term) ||
      (p.givenNamesAr || '').toLowerCase().includes(term) ||
      (p.issuingState || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-amber-400" />
            {lang === 'ar' ? 'سجل الوثائق والجوازات المحفوظة' : 'Passport Documents Registry'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ar' ? 'حفظ واسترجاع الجوازات والوثائق محلياً مع إمكانية التصدير والاستيراد' : 'Store & retrieve passport records locally with JSON export/import'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => saveToRegistry(currentPassport)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {savedSuccess ? (lang === 'ar' ? 'تم الحفظ!' : 'Saved!') : (lang === 'ar' ? 'حفظ الجواز الحالي في السجل' : 'Save Current')}
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'تصدير السجل (JSON)' : 'Export JSON'}
          </button>

          <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'ar' ? 'استيراد (JSON)' : 'Import JSON'}</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-4 top-3 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={lang === 'ar' ? 'ابحث برقم الجواز، الاسم، الدولة...' : 'Search by passport number, name, state...'}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-11 pl-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* List of Passports */}
      {filtered.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">
            {lang === 'ar' ? 'لا توجد وثائق مسجلة حالياً' : 'No records found in registry'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {lang === 'ar' ? 'يمكنك حفظ الجواز الحالي من الزر أعلاه للرجوع إليه وتعديله في أي وقت.' : 'Click "Save Current" above to add passport records here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const country = COUNTRIES.find(c => c.code === p.issuingState);
            return (
              <div
                key={p.id}
                onClick={() => onSelectPassport(p)}
                className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all shadow-md group relative flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{country?.flag || '🛂'}</span>
                      <span className="font-bold text-xs text-slate-200">
                        {country?.nameEn || p.issuingState}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {p.passportNumber || 'N/A'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="font-bold text-xs text-slate-100 truncate">
                      {p.surname} {p.givenNames}
                    </div>
                    {(p.surnameAr || p.givenNamesAr) && (
                      <div className="text-xs text-slate-400 truncate">
                        {p.givenNamesAr} {p.surnameAr}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>{p.expiryDate ? `Exp: ${p.expiryDate}` : ''}</span>
                  <button
                    type="button"
                    onClick={(e) => deleteFromRegistry(p.id, e)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="حذف السجل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
