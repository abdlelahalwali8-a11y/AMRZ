import React, { useState, useEffect } from 'react';
import { PassportData } from '../types/passport';
import { getCountryDisplayName } from '../utils/countryData';
import { SAMPLE_PASSPORTS } from '../utils/sampleData';
import {
  Bookmark,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Copy,
  Check
} from 'lucide-react';

interface PassportRegistryProps {
  currentPassport: PassportData;
  onSelectPassport: (passport: PassportData) => void;
  lang?: 'ar' | 'en';
}

export const PassportRegistry: React.FC<PassportRegistryProps> = ({
  currentPassport,
  onSelectPassport,
  lang = 'ar'
}) => {
  const STORAGE_KEY = 'passport_mrz_registry_v1';
  const [savedPassports, setSavedPassports] = useState<PassportData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedPassports(JSON.parse(stored));
      } else {
        // Load initial sample passports
        const samples = Object.values(SAMPLE_PASSPORTS);
        setSavedPassports(samples);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
      }
    } catch (e) {
      console.error('LocalStorage read error:', e);
    }
  }, []);

  const saveToStorage = (list: PassportData[]) => {
    setSavedPassports(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  };

  const handleSaveCurrent = () => {
    const existingIndex = savedPassports.findIndex((p) => p.id === currentPassport.id || p.passportNumber === currentPassport.passportNumber);
    let updated: PassportData[];
    if (existingIndex >= 0) {
      updated = [...savedPassports];
      updated[existingIndex] = { ...currentPassport, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...currentPassport, id: `passport-${Date.now()}`, createdAt: new Date().toISOString() }, ...savedPassports];
    }
    saveToStorage(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPassports.filter((p) => p.id !== id);
    saveToStorage(updated);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedPassports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Passport_Registry_${Date.now()}.json`);
    downloadAnchor.click();
  };

  const filteredPassports = savedPassports.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.passportNumber.toLowerCase().includes(query) ||
      p.surname.toLowerCase().includes(query) ||
      p.givenNames.toLowerCase().includes(query) ||
      p.issuingState.toLowerCase().includes(query) ||
      p.personalNumber.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-600" />
            {lang === 'ar' ? 'سجل الجوازات المحفوظة (Saved Passports Registry)' : 'Saved Passports Registry'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ar' ? 'احفظ وإدارة جوازاتك المنشأة للرجوع إليها أو تصديرها بضغطة زر' : 'Manage and store created passport records.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveCurrent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            {savedNotification ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {savedNotification
              ? lang === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved!'
              : lang === 'ar' ? 'حفظ الجواز الحالي في السجل' : 'Save Current'}
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            {lang === 'ar' ? 'تصدير JSON' : 'Export JSON'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'ar' ? 'ابحث برقم الجواز، الاسم، أو الدولة...' : 'Search by passport number, name, or country...'}
          className="w-full pr-10 pl-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Registry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPassports.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">
            {lang === 'ar' ? 'لا يوجد جوازات مطابقة للبحث' : 'No passports found in registry'}
          </div>
        ) : (
          filteredPassports.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPassport(p)}
              className={`group relative p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                p.passportNumber === currentPassport.passportNumber
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={p.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                    alt="Passport photo"
                    className="w-10 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase font-mono">
                      {p.surname} {p.givenNames}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {p.passportNumber} • {getCountryDisplayName(p.issuingState, lang)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDelete(p.id, e)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>الانتهاء: {p.expiryDate}</span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                  فتح للمعينة
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
