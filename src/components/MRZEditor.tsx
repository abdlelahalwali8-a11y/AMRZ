import React, { useRef } from 'react';
import { 
  User, 
  Flag, 
  Calendar, 
  FileBadge, 
  Upload, 
  RefreshCw, 
  Sparkles, 
  PenTool, 
  Check, 
  Globe, 
  Briefcase, 
  MapPin, 
  Building2 
} from 'lucide-react';
import { PassportData } from '../types/passport';
import { COUNTRIES } from '../utils/countryData';
import { SAMPLE_PASSPORTS } from '../utils/sampleData';
import { SignaturePad } from './SignaturePad';

interface MRZEditorProps {
  passport: PassportData;
  setPassport: React.Dispatch<React.SetStateAction<PassportData>>;
  lang?: 'ar' | 'en';
}

export const MRZEditor: React.FC<MRZEditorProps> = ({ passport, setPassport, lang = 'ar' }) => {
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const handleFieldChange = (field: keyof PassportData, value: string) => {
    setPassport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleFieldChange('photoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSample = (sample: PassportData) => {
    setPassport({
      ...sample,
      id: `passport-${Date.now()}`
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sample Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-amber-400" />
            {lang === 'ar' ? 'محرر بيانات الجواز الرسمية (MRZ & VIZ)' : 'Official Passport Data Editor'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'ar' ? 'أدخل البيانات بالإنجليزية والعربية ليتم توليد أسطر MRZ والباركود فوراً' : 'Fill fields to generate MRZ and barcodes instantly'}
          </p>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {lang === 'ar' ? 'نماذج جاهزة:' : 'Presets:'}
          </span>
          {SAMPLE_PASSPORTS.map((sample, idx) => (
            <button
              key={sample.id || idx}
              type="button"
              onClick={() => loadSample(sample)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>{COUNTRIES.find(c => c.code === sample.issuingState)?.flag || '🛂'}</span>
              <span>{sample.issuingState}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Holder Photo & Signature */}
        <div className="md:col-span-4 space-y-5">
          
          {/* Photo Upload Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>{lang === 'ar' ? 'صورة صاحب الجواز' : 'Holder Photo'}</span>
              <span className="text-[10px] text-slate-400 font-normal">ICAO 35x45mm</span>
            </label>

            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={() => photoInputRef.current?.click()}
                className="w-36 h-48 bg-slate-950 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl overflow-hidden cursor-pointer flex flex-col items-center justify-center relative transition-all group"
              >
                {passport.photoUrl ? (
                  <>
                    <img src={passport.photoUrl} alt="Passport Photo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-xs text-white transition-opacity">
                      <Upload className="w-5 h-5 mb-1" />
                      <span>{lang === 'ar' ? 'تغيير الصورة' : 'Change Photo'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-3 text-slate-500 group-hover:text-amber-400 transition-colors">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <span className="text-xs font-medium block">
                      {lang === 'ar' ? 'انقر لرفع الصورة' : 'Upload photo'}
                    </span>
                    <span className="text-[10px] text-slate-600 block mt-0.5">JPG / PNG</span>
                  </div>
                )}
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {passport.photoUrl && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('photoUrl', '')}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  {lang === 'ar' ? 'إزالة الصورة' : 'Remove photo'}
                </button>
              )}
            </div>
          </div>

          {/* Signature Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? 'توقيع صاحب الجواز' : 'Digital Signature'}</span>
            </label>

            <SignaturePad
              onSave={(dataUrl) => handleFieldChange('signatureUrl', dataUrl)}
              initialSignature={passport.signatureUrl}
              lang={lang}
            />
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="md:col-span-8 space-y-5">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            
            {/* Country and Doc Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'دولة الإصدار (Issuing State)' : 'Issuing State (3-letter)'}
                </label>
                <select
                  value={passport.issuingState}
                  onChange={(e) => {
                    const code = e.target.value;
                    handleFieldChange('issuingState', code);
                    if (!passport.nationality) {
                      handleFieldChange('nationality', code);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {lang === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'الجنسية (Nationality Code)' : 'Nationality (3-letter)'}
                </label>
                <select
                  value={passport.nationality}
                  onChange={(e) => handleFieldChange('nationality', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {lang === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'رقم الجواز (Passport No.)' : 'Passport Number'}
                </label>
                <input
                  type="text"
                  maxLength={9}
                  value={passport.passportNumber}
                  onChange={(e) => handleFieldChange('passportNumber', e.target.value.toUpperCase())}
                  placeholder="e.g. 13966269"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>
            </div>

            {/* Names (English & Arabic) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'اللقب / العائلة بالإنجليزية (Surname)' : 'Surname (English)'}
                </label>
                <input
                  type="text"
                  value={passport.surname}
                  onChange={(e) => handleFieldChange('surname', e.target.value.toUpperCase())}
                  placeholder="e.g. AL-ZAHEAH"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'اللقب / العائلة بالعربية' : 'Surname (Arabic)'}
                </label>
                <input
                  type="text"
                  value={passport.surnameAr || ''}
                  onChange={(e) => handleFieldChange('surnameAr', e.target.value)}
                  placeholder="مثال: الزحيه"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'الأسماء بالإنجليزية (Given Names)' : 'Given Names (English)'}
                </label>
                <input
                  type="text"
                  value={passport.givenNames}
                  onChange={(e) => handleFieldChange('givenNames', e.target.value.toUpperCase())}
                  placeholder="e.g. MOHAMMED SHAWQI MOHAMMED HASAN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'الأسماء بالعربية' : 'Given Names (Arabic)'}
                </label>
                <input
                  type="text"
                  value={passport.givenNamesAr || ''}
                  onChange={(e) => handleFieldChange('givenNamesAr', e.target.value)}
                  placeholder="مثال: محمد شوقي محمد حسن"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Dates & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'تاريخ الميلاد (DOB)' : 'Date of Birth'}
                </label>
                <input
                  type="date"
                  value={passport.birthDate}
                  onChange={(e) => handleFieldChange('birthDate', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'النوع (Sex)' : 'Sex'}
                </label>
                <select
                  value={passport.sex}
                  onChange={(e) => handleFieldChange('sex', e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="M">{lang === 'ar' ? 'M - ذكر' : 'M - Male'}</option>
                  <option value="F">{lang === 'ar' ? 'F - أنثى' : 'F - Female'}</option>
                  <option value="X">{lang === 'ar' ? 'X - غير محدد' : 'X - Unspecified'}</option>
                  <option value="<">{lang === 'ar' ? '< - غير معلن' : '< - Undisclosed'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}
                </label>
                <input
                  type="date"
                  value={passport.issueDate || ''}
                  onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-400 mb-1">
                  {lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                </label>
                <input
                  type="date"
                  value={passport.expiryDate}
                  onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
                  className="w-full bg-slate-950 border border-rose-900 rounded-xl px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Additional Fields (Profession, Place of Birth, Authority, ID) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'الرقم الوطني / الشخصي' : 'National / Personal ID'}
                </label>
                <input
                  type="text"
                  value={passport.personalNumber || ''}
                  onChange={(e) => handleFieldChange('personalNumber', e.target.value.toUpperCase())}
                  placeholder="e.g. 1002030405"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'المهنة (عربي / إنجليزي)' : 'Profession'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={passport.profession || ''}
                    onChange={(e) => handleFieldChange('profession', e.target.value.toUpperCase())}
                    placeholder="LABORER"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={passport.professionAr || ''}
                    onChange={(e) => handleFieldChange('professionAr', e.target.value)}
                    placeholder="عامل"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'محل الميلاد (عربي / إنجليزي)' : 'Place of Birth'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={passport.placeOfBirth || ''}
                    onChange={(e) => handleFieldChange('placeOfBirth', e.target.value.toUpperCase())}
                    placeholder="ALMAHWEET - YEM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={passport.placeOfBirthAr || ''}
                    onChange={(e) => handleFieldChange('placeOfBirthAr', e.target.value)}
                    placeholder="اليمن - المحويت"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'ar' ? 'جهة الإصدار (عربي / إنجليزي)' : 'Issuing Authority'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={passport.issuingAuthority || ''}
                    onChange={(e) => handleFieldChange('issuingAuthority', e.target.value.toUpperCase())}
                    placeholder="KHAWKHAH"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={passport.issuingAuthorityAr || ''}
                    onChange={(e) => handleFieldChange('issuingAuthorityAr', e.target.value)}
                    placeholder="الخوخة"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
