import React, { useState } from 'react';
import { PassportData, DocumentType, SexType } from '../types/passport';
import { COUNTRIES } from '../utils/countryData';
import { SAMPLE_PASSPORTS } from '../utils/sampleData';
import { generateTD3MRZ } from '../utils/mrzGenerator';
import { parseMRZ } from '../utils/mrzParser';
import { SignaturePad } from './SignaturePad';
import {
  User,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Globe,
  Upload,
  Camera,
  RotateCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface MRZEditorProps {
  data: PassportData;
  onChange: (newData: PassportData) => void;
  lang?: 'ar' | 'en';
}

export const MRZEditor: React.FC<MRZEditorProps> = ({ data, onChange, lang = 'ar' }) => {
  const [photoPreview, setPhotoPreview] = useState<string>(data.photoUrl || '');

  // Calculate live MRZ and checksum analysis
  const generatedMRZ = generateTD3MRZ(data);
  const liveLine1 = generatedMRZ.line1;
  const liveLine2 = generatedMRZ.line2;

  const mrzAnalysis = parseMRZ(`${liveLine1}\n${liveLine2}`);
  const errIndicesL1 = mrzAnalysis.charValidation?.line1ErrorIndices || [];
  const errIndicesL2 = mrzAnalysis.charValidation?.line2ErrorIndices || [];

  const handleInputChange = (key: keyof PassportData, value: string) => {
    onChange({
      ...data,
      [key]: value
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        handleInputChange('photoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = SAMPLE_PASSPORTS[presetKey];
    if (preset) {
      onChange({ ...preset, id: `passport-${Date.now()}` });
      setPhotoPreview(preset.photoUrl);
    }
  };

  const generateRandomPassport = () => {
    const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const randomNum = Math.floor(10000000 + Math.random() * 90000000).toString();
    const randomPersonal = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const arabicSurnames = ['العتيبي', 'القحطاني', 'العمري', 'المصري', 'اليماني', 'العتيقي', 'الحارثي', 'الشمري'];
    const arabicGivens = ['أحمد', 'محمد', 'علي', 'عبدالله', 'خالد', 'عمر', 'فاطمة', 'مريم', 'سارة'];

    const englishSurnames = ['AL SAUD', 'AL HASHIMI', 'EL SAYED', 'AL MAKTOUM', 'SMITH', 'JOHNSON', 'GARCIA'];
    const englishGivens = ['MOHAMMED', 'AHMED', 'ABDULLAH', 'KHALED', 'SARAH', 'FATIMA', 'MARYAM'];

    const surname = englishSurnames[Math.floor(Math.random() * englishSurnames.length)];
    const givenNames = englishGivens[Math.floor(Math.random() * englishGivens.length)];

    const newPassport: PassportData = {
      id: `random-${Date.now()}`,
      documentType: 'P',
      documentSubtype: '<',
      issuingState: randomCountry.code,
      surname,
      givenNames,
      passportNumber: `P${randomNum}`,
      nationality: randomCountry.code,
      birthDate: '1995-06-15',
      sex: Math.random() > 0.5 ? 'M' : 'F',
      expiryDate: '2034-06-14',
      personalNumber: randomPersonal,
      issueDate: '2024-06-15',
      placeOfBirth: randomCountry.nameEn.toUpperCase(),
      issuingAuthority: `PASSPORT OFFICE ${randomCountry.code}`,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      signatureUrl: ''
    };

    onChange(newPassport);
    setPhotoPreview(newPassport.photoUrl);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Preset Quick Load Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {lang === 'ar' ? 'نماذج جوازات جاهزة (Quick Presets)' : 'Quick Sample Presets'}
          </label>
          <button
            type="button"
            onClick={generateRandomPassport}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'توليد جواز عشوائي' : 'Generate Random'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => handlePresetSelect('sau')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all text-center"
          >
            🇸🇦 جواز سعودي
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('yem')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all text-center"
          >
            🇾🇪 جواز يمني
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('egy')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all text-center"
          >
            🇪🇬 جواز مصري
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('are')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all text-center"
          >
            🇦🇪 جواز إماراتي
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('usa')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all text-center"
          >
            🇺🇸 جواز أمريكي
          </button>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Type & Country Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'نوع الوثيقة (Document Type)' : 'Document Type'}
          </label>
          <select
            value={data.documentType}
            onChange={(e) => handleInputChange('documentType', e.target.value as DocumentType)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
          >
            <option value="P">P - جواز سفر عادي (Ordinary Passport)</option>
            <option value="PD">PD - جواز دبلوماسي (Diplomatic Passport)</option>
            <option value="PO">PO - جواز خدمة/خاص (Official / Service)</option>
            <option value="PS">PS - جواز سفر خاص (Special Passport)</option>
          </select>
        </div>

        {/* Issuing Country Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'دولة الإصدار (Issuing Country Code - ISO 3166-1)' : 'Issuing Country'}
          </label>
          <select
            value={data.issuingState}
            onChange={(e) => handleInputChange('issuingState', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.nameAr} ({c.nameEn})
              </option>
            ))}
          </select>
        </div>

        {/* Passport Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'رقم الجواز (Passport Number - 9 Chars)' : 'Passport Number'}
          </label>
          <input
            type="text"
            maxLength={9}
            value={data.passportNumber}
            onChange={(e) => handleInputChange('passportNumber', e.target.value.toUpperCase())}
            placeholder="e.g. N12345678"
            className="w-full px-3 py-2 text-sm font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Personal ID / National ID Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'الرقم القومي / الشخصي (Personal No. / National ID)' : 'Personal / National ID No.'}
          </label>
          <input
            type="text"
            maxLength={14}
            value={data.personalNumber}
            onChange={(e) => handleInputChange('personalNumber', e.target.value.toUpperCase())}
            placeholder="e.g. 1098765432"
            className="w-full px-3 py-2 text-sm font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Surname / Family Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'اللقب بالإنجليزية (Surname - English)' : 'Surname (English)'}
          </label>
          <input
            type="text"
            value={data.surname}
            onChange={(e) => handleInputChange('surname', e.target.value.toUpperCase())}
            placeholder="e.g. HEBAH"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
          />
        </div>

        {/* Surname Arabic */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'اللقب بالعربية (Surname - Arabic)' : 'Surname (Arabic)'}
          </label>
          <input
            type="text"
            value={data.surnameAr || ''}
            onChange={(e) => handleInputChange('surnameAr', e.target.value)}
            placeholder="مثال: هبه"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Given Names */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'الأسماء بالإنجليزية (Given Names - English)' : 'Given Names (English)'}
          </label>
          <input
            type="text"
            value={data.givenNames}
            onChange={(e) => handleInputChange('givenNames', e.target.value.toUpperCase())}
            placeholder="e.g. MOHAMMED MOHAMMED HUSSEIN"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
          />
        </div>

        {/* Given Names Arabic */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'الأسماء بالعربية (Given Names - Arabic)' : 'Given Names (Arabic)'}
          </label>
          <input
            type="text"
            value={data.givenNamesAr || ''}
            onChange={(e) => handleInputChange('givenNamesAr', e.target.value)}
            placeholder="مثال: محمد محمد حسين"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Profession English */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'المهنة بالإنجليزية (Profession - English)' : 'Profession (English)'}
          </label>
          <input
            type="text"
            value={data.profession || ''}
            onChange={(e) => handleInputChange('profession', e.target.value.toUpperCase())}
            placeholder="e.g. LABORER"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
          />
        </div>

        {/* Profession Arabic */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'المهنة بالعربية (Profession - Arabic)' : 'Profession (Arabic)'}
          </label>
          <input
            type="text"
            value={data.professionAr || ''}
            onChange={(e) => handleInputChange('professionAr', e.target.value)}
            placeholder="مثال: عامل"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'الجنسية (Nationality Code)' : 'Nationality'}
          </label>
          <select
            value={data.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
          >
            {COUNTRIES.map((c) => (
              <option key={`nat-${c.code}`} value={c.code}>
                {c.flag} {c.code} - {c.nameAr} ({c.nameEn})
              </option>
            ))}
          </select>
        </div>

        {/* Sex */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'الجنس (Sex)' : 'Sex'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleInputChange('sex', 'M')}
              className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                data.sex === 'M'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              M - ذكر / Male
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('sex', 'F')}
              className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                data.sex === 'F'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              F - أنثى / Female
            </button>
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'تاريخ الميلاد (Date of Birth)' : 'Date of Birth'}
          </label>
          <input
            type="date"
            value={data.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
          />
        </div>

        {/* Date of Issue */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'تاريخ الإصدار (Date of Issue)' : 'Date of Issue'}
          </label>
          <input
            type="date"
            value={data.issueDate || ''}
            onChange={(e) => handleInputChange('issueDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
          />
        </div>

        {/* Date of Expiry */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'تاريخ الانتهاء (Date of Expiry)' : 'Date of Expiry'}
          </label>
          <input
            type="date"
            value={data.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
          />
        </div>

        {/* Place of Birth English */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'مكان الميلاد بالإنجليزية (Place of Birth - English)' : 'Place of Birth (English)'}
          </label>
          <input
            type="text"
            value={data.placeOfBirth}
            onChange={(e) => handleInputChange('placeOfBirth', e.target.value.toUpperCase())}
            placeholder="e.g. ALMAHWEET - YEM"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
          />
        </div>

        {/* Place of Birth Arabic */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'مكان الميلاد بالعربية (Place of Birth - Arabic)' : 'Place of Birth (Arabic)'}
          </label>
          <input
            type="text"
            value={data.placeOfBirthAr || ''}
            onChange={(e) => handleInputChange('placeOfBirthAr', e.target.value)}
            placeholder="مثال: اليمن - المحويت"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Issuing Authority English */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'جهة الإصدار بالإنجليزية (Issuing Authority - English)' : 'Issuing Authority (English)'}
          </label>
          <input
            type="text"
            value={data.issuingAuthority}
            onChange={(e) => handleInputChange('issuingAuthority', e.target.value.toUpperCase())}
            placeholder="e.g. ADEN"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
          />
        </div>

        {/* Issuing Authority Arabic */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'ar' ? 'جهة الإصدار بالعربية (Issuing Authority - Arabic)' : 'Issuing Authority (Arabic)'}
          </label>
          <input
            type="text"
            value={data.issuingAuthorityAr || ''}
            onChange={(e) => handleInputChange('issuingAuthorityAr', e.target.value)}
            placeholder="مثال: عدن"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Photo Upload & Signature Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            {lang === 'ar' ? 'صورة صاحب الجواز (Personal Photo)' : 'Personal Photo'}
          </label>
          <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-16 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="space-y-1 text-xs">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer transition-colors font-medium">
                <Upload className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'رفع صورة' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-500">
                {lang === 'ar' ? 'يفضل صورة قياسية بخلفية بيضاء' : 'Standard passport photo format'}
              </p>
            </div>
          </div>
        </div>

        {/* Digital Signature */}
        <div>
          <SignaturePad
            value={data.signatureUrl}
            onChange={(url) => handleInputChange('signatureUrl', url)}
            lang={lang}
          />
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Real-time Checksum & Character Validation Section */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-100">
              {lang === 'ar' ? 'فحص رموز التحقق المباشر (ICAO 9303 Live Checksum Inspector)' : 'ICAO 9303 Live Checksum Inspector'}
            </h4>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            mrzAnalysis.isValid
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
          }`}>
            {mrzAnalysis.isValid ? (lang === 'ar' ? 'جميع أرقام التحقق سليمة 100%' : 'All Check digits Valid') : (lang === 'ar' ? 'توجد أخطاء في رموز التحقق ✗' : 'Checksum Errors Detected ✗')}
          </span>
        </div>

        {/* Character-by-Character MRZ Line Display */}
        <div className="space-y-2 font-mono text-xs sm:text-sm">
          {/* Line 1 */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-wrap gap-0.5 leading-relaxed tracking-wider overflow-x-auto">
            <span className="text-[10px] text-slate-500 w-full mb-1 font-sans">Line 1 (44 Characters)</span>
            {liveLine1.split('').map((char, idx) => {
              const isErr = errIndicesL1.includes(idx);
              return (
                <span
                  key={`l1-${idx}`}
                  title={`Index ${idx + 1}: ${char}`}
                  className={`px-0.5 rounded font-mono ${
                    isErr
                      ? 'bg-rose-600 text-white font-black animate-pulse ring-2 ring-rose-400'
                      : 'text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* Line 2 */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-wrap gap-0.5 leading-relaxed tracking-wider overflow-x-auto">
            <span className="text-[10px] text-slate-500 w-full mb-1 font-sans">Line 2 (44 Characters)</span>
            {liveLine2.split('').map((char, idx) => {
              const isErr = errIndicesL2.includes(idx);
              return (
                <span
                  key={`l2-${idx}`}
                  title={`Index ${idx + 1}: ${char}${isErr ? ' - Invalid Check Digit / Character' : ''}`}
                  className={`px-0.5 rounded font-mono ${
                    isErr
                      ? 'bg-rose-600 text-white font-black animate-pulse ring-2 ring-rose-400'
                      : 'text-emerald-300 hover:bg-slate-800'
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Errors list if any */}
        {mrzAnalysis.errors.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {mrzAnalysis.errors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                <span>{err.messageAr || err.message} {err.messageEn ? `(${err.messageEn})` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
