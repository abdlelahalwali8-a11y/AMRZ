import { CountryInfo } from '../types/passport';

export const COUNTRIES: CountryInfo[] = [
  { code: 'SAU', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'YEM', nameAr: 'الجمهورية اليمنية', nameEn: 'Yemen', flag: '🇾🇪' },
  { code: 'EGY', nameAr: 'جمهورية مصر العربية', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: 'ARE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'KWT', nameAr: 'دولة الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
  { code: 'QAT', nameAr: 'دولة قطر', nameEn: 'Qatar', flag: '🇶🇦' },
  { code: 'BHR', nameAr: 'مملكة البحرين', nameEn: 'Bahrain', flag: '🇧🇭' },
  { code: 'OMN', nameAr: 'سلطنة عمان', nameEn: 'Oman', flag: '🇴🇲' },
  { code: 'JOR', nameAr: 'المملكة الأردنية الهاشمية', nameEn: 'Jordan', flag: '🇯🇴' },
  { code: 'LBN', nameAr: 'الجمهورية اللبنانية', nameEn: 'Lebanon', flag: '🇱🇧' },
  { code: 'SYR', nameAr: 'الجمهورية العربية السورية', nameEn: 'Syria', flag: '🇸🇾' },
  { code: 'IRQ', nameAr: 'جمهورية العراق', nameEn: 'Iraq', flag: '🇮🇶' },
  { code: 'SDN', nameAr: 'جمهورية السودان', nameEn: 'Sudan', flag: '🇸🇩' },
  { code: 'MAR', nameAr: 'المملكة المغربية', nameEn: 'Morocco', flag: '🇲🇦' },
  { code: 'DZA', nameAr: 'الجمهورية الجزائرية', nameEn: 'Algeria', flag: '🇩🇿' },
  { code: 'TUN', nameAr: 'الجمهورية التونسية', nameEn: 'Tunisia', flag: '🇹🇳' },
  { code: 'LBY', nameAr: 'دولة ليبيا', nameEn: 'Libya', flag: '🇱🇾' },
  { code: 'PSE', nameAr: 'دولة فلسطين', nameEn: 'Palestine', flag: '🇵🇸' },
  { code: 'SOM', nameAr: 'جمهورية الصومال', nameEn: 'Somalia', flag: '🇸🇴' },
  { code: 'DJI', nameAr: 'جمهورية جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯' },
  { code: 'MRT', nameAr: 'جمهورية موريتانيا', nameEn: 'Mauritania', flag: '🇲🇷' },
  { code: 'USA', nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States', flag: '🇺🇸' },
  { code: 'GBR', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DEU', nameAr: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪' },
  { code: 'FRA', nameAr: 'فرنسا', nameEn: 'France', flag: '🇫🇷' },
  { code: 'TUR', nameAr: 'الجمهورية التركية', nameEn: 'Turkey', flag: '🇹🇷' },
  { code: 'CAN', nameAr: 'كندا', nameEn: 'Canada', flag: '🇨🇦' },
  { code: 'ITA', nameAr: 'إيطاليا', nameEn: 'Italy', flag: '🇮🇹' },
  { code: 'ESP', nameAr: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸' },
  { code: 'CHN', nameAr: 'الصين', nameEn: 'China', flag: '🇨🇳' },
  { code: 'IND', nameAr: 'الهند', nameEn: 'India', flag: '🇮🇳' },
  { code: 'PAK', nameAr: 'باكستان', nameEn: 'Pakistan', flag: '🇵🇰' },
  { code: 'MYS', nameAr: 'ماليزيا', nameEn: 'Malaysia', flag: '🇲🇾' },
  { code: 'IDN', nameAr: 'إندونيسيا', nameEn: 'Indonesia', flag: '🇮🇩' },
  { code: 'RUS', nameAr: 'روسيا', nameEn: 'Russia', flag: '🇷🇺' },
];

export function getCountryByCode(code: string): CountryInfo | undefined {
  return COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
}

export function getCountryDisplayName(code: string, lang: string = 'ar'): string {
  const country = getCountryByCode(code);
  if (!country) return code;
  return lang === 'en' ? `${country.flag} ${country.nameEn}` : `${country.flag} ${country.nameAr}`;
}
