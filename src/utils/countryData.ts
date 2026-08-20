export interface CountryInfo {
  code: string;
  nameEn: string;
  nameAr: string;
  flag: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'YEM', nameEn: 'Yemen', nameAr: 'اليمن', flag: '🇾🇪' },
  { code: 'SAU', nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', flag: '🇸🇦' },
  { code: 'EGY', nameEn: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
  { code: 'ARE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', flag: '🇦🇪' },
  { code: 'KWT', nameEn: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
  { code: 'QAT', nameEn: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
  { code: 'OMN', nameEn: 'Oman', nameAr: 'عُمان', flag: '🇴🇲' },
  { code: 'BHR', nameEn: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
  { code: 'JOR', nameEn: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
  { code: 'IRQ', nameEn: 'Iraq', nameAr: 'العراق', flag: '🇮🇶' },
  { code: 'SYR', nameEn: 'Syria', nameAr: 'سوريا', flag: '🇸🇾' },
  { code: 'LBN', nameEn: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧' },
  { code: 'PSE', nameEn: 'Palestine', nameAr: 'فلسطين', flag: '🇵🇸' },
  { code: 'SDN', nameEn: 'Sudan', nameAr: 'السودان', flag: '🇸🇩' },
  { code: 'LBY', nameEn: 'Libya', nameAr: 'ليبيا', flag: '🇱🇾' },
  { code: 'TUN', nameEn: 'Tunisia', nameAr: 'تونس', flag: '🇹🇳' },
  { code: 'DZA', nameEn: 'Algeria', nameAr: 'الجزائر', flag: '🇩🇿' },
  { code: 'MAR', nameEn: 'Morocco', nameAr: 'المغرب', flag: '🇲🇦' },
  { code: 'MRT', nameEn: 'Mauritania', nameAr: 'موريتانيا', flag: '🇲🇷' },
  { code: 'SOM', nameEn: 'Somalia', nameAr: 'الصومال', flag: '🇸🇴' },
  { code: 'DJI', nameEn: 'Djibouti', nameAr: 'جيبوتي', flag: '🇩🇯' },
  { code: 'COM', nameEn: 'Comoros', nameAr: 'جزر القمر', flag: '🇰🇲' },
  { code: 'USA', nameEn: 'United States', nameAr: 'الولايات المتحدة', flag: '🇺🇸' },
  { code: 'GBR', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', flag: '🇬🇧' },
  { code: 'TUR', nameEn: 'Turkey', nameAr: 'تركيا', flag: '🇹🇷' },
  { code: 'DEU', nameEn: 'Germany', nameAr: 'ألمانيا', flag: '🇩🇪' },
  { code: 'FRA', nameEn: 'France', nameAr: 'فرنسا', flag: '🇫🇷' },
  { code: 'CAN', nameEn: 'Canada', nameAr: 'كندا', flag: '🇨🇦' },
  { code: 'AUS', nameEn: 'Australia', nameAr: 'أستراليا', flag: '🇦🇺' },
  { code: 'MYS', nameEn: 'Malaysia', nameAr: 'ماليزيا', flag: '🇲🇾' },
  { code: 'IDN', nameEn: 'Indonesia', nameAr: 'إندونيسيا', flag: '🇮🇩' },
  { code: 'IND', nameEn: 'India', nameAr: 'الهند', flag: '🇮🇳' },
  { code: 'PAK', nameEn: 'Pakistan', nameAr: 'باكستان', flag: '🇵🇰' },
  { code: 'CHN', nameEn: 'China', nameAr: 'الصين', flag: '🇨🇳' },
  { code: 'JPN', nameEn: 'Japan', nameAr: 'اليابان', flag: '🇯🇵' },
  { code: 'KOR', nameEn: 'South Korea', nameAr: 'كوريا الجنوبية', flag: '🇰🇷' },
  { code: 'RUS', nameEn: 'Russia', nameAr: 'روسيا', flag: '🇷🇺' }
];

export const getCountryByCode = (code: string): CountryInfo | undefined => {
  const upper = (code || '').toUpperCase().trim();
  return COUNTRIES.find(c => c.code === upper);
};
