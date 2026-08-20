import { PassportData } from '../types/passport';

/**
 * Character value calculation according to ICAO Doc 9303:
 * '0'-'9' -> 0-9
 * 'A'-'Z' -> 10-35
 * '<'     -> 0
 */
export function getCharValue(ch: string): number {
  if (ch >= '0' && ch <= '9') {
    return ch.charCodeAt(0) - '0'.charCodeAt(0);
  }
  if (ch >= 'A' && ch <= 'Z') {
    return ch.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  }
  return 0; // '<' or any unknown character
}

/**
 * Calculates 7-3-1 weight check digit for a string according to ICAO 9303
 */
export function calculateCheckDigit(input: string): string {
  const weights = [7, 3, 1];
  let sum = 0;

  for (let i = 0; i < input.length; i++) {
    const charVal = getCharValue(input[i].toUpperCase());
    const weight = weights[i % 3];
    sum += charVal * weight;
  }

  return (sum % 10).toString();
}

/**
 * Converts Arabic text to simple standard Latin transliteration if needed
 */
export function transliterateArabic(text: string): string {
  if (!text) return '';
  const arabicToLatinMap: Record<string, string> = {
    'أ': 'A', 'إ': 'I', 'آ': 'A', 'ا': 'A', 'ب': 'B', 'ت': 'T', 'ث': 'TH',
    'ج': 'J', 'ح': 'H', 'خ': 'KH', 'د': 'D', 'ذ': 'DH', 'ر': 'R', 'ز': 'Z',
    'س': 'S', 'ش': 'SH', 'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': 'A',
    'غ': 'GH', 'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
    'ه': 'H', 'و': 'W', 'ي': 'Y', 'ى': 'A', 'ئ': 'Y', 'ء': 'A', 'ؤ': 'W',
    'ة': 'H', 'ـ': ''
  };

  let result = '';
  for (const char of text) {
    if (arabicToLatinMap[char]) {
      result += arabicToLatinMap[char];
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Cleans string for MRZ: Upper case, replaces spaces/special chars with '<', converts non-ASCII
 */
export function cleanMRZString(str: string): string {
  if (!str) return '';
  let cleaned = transliterateArabic(str);
  cleaned = cleaned.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip accents
  cleaned = cleaned.replace(/[^A-Z0-9]/g, '<'); // non alpha-numeric to '<'
  return cleaned;
}

/**
 * Pads or truncates string to fixed length with filler char '<'
 */
export function padMRZ(str: string, length: number): string {
  const cleaned = cleanMRZString(str);
  if (cleaned.length > length) {
    return cleaned.substring(0, length);
  }
  return cleaned.padEnd(length, '<');
}

/**
 * Converts date string YYYY-MM-DD or YYYYMMDD to YYMMDD
 */
export function formatDateYYMMDD(dateStr: string): string {
  if (!dateStr) return '000000';
  const digits = dateStr.replace(/\D/g, '');
  if (digits.length === 8) {
    // YYYYMMDD -> YYMMDD
    return digits.substring(2);
  }
  if (digits.length === 6) {
    return digits;
  }
  return '000000';
}

/**
 * Generates Line 1 and Line 2 for standard TD3 Passport (2 lines x 44 chars)
 */
export function generateTD3MRZ(data: PassportData): { line1: string; line2: string; raw: string } {
  // Line 1:
  // Pos 1-2: Document code ('P<', 'PD', 'PO', etc.)
  let docCode = (data.documentType || 'P').toUpperCase();
  if (docCode.length === 1) {
    docCode = docCode + (data.documentSubtype || '<').toUpperCase().charAt(0);
  }
  docCode = padMRZ(docCode, 2);

  // Pos 3-5: Issuing State (3 chars ISO code)
  const issuingState = padMRZ(data.issuingState || 'XXX', 3);

  // Pos 6-44: Name (Primary identifier << Secondary identifier)
  const surname = cleanMRZString(data.surname || '');
  const givenNames = cleanMRZString(data.givenNames || '');

  let nameField = '';
  if (surname && givenNames) {
    nameField = `${surname}<<${givenNames}`;
  } else if (surname) {
    nameField = surname;
  } else if (givenNames) {
    nameField = givenNames;
  } else {
    nameField = 'UNKNOWN';
  }

  nameField = padMRZ(nameField, 39);

  const line1 = `${docCode}${issuingState}${nameField}`;

  // Line 2:
  // Pos 1-9: Passport Number
  const passportNumber = padMRZ(data.passportNumber || '', 9);
  // Pos 10: Passport Number Check Digit
  const passportNoCheckDigit = calculateCheckDigit(passportNumber);

  // Pos 11-13: Nationality (3 chars)
  const nationality = padMRZ(data.nationality || data.issuingState || 'XXX', 3);

  // Pos 14-19: Birth Date (YYMMDD)
  const birthDate = formatDateYYMMDD(data.birthDate);
  // Pos 20: Birth Date Check Digit
  const birthDateCheckDigit = calculateCheckDigit(birthDate);

  // Pos 21: Sex (M, F, or <)
  let sex = (data.sex || '<').toUpperCase().charAt(0);
  if (sex !== 'M' && sex !== 'F') sex = '<';

  // Pos 22-27: Expiration Date (YYMMDD)
  const expiryDate = formatDateYYMMDD(data.expiryDate);
  // Pos 28: Expiration Date Check Digit
  const expiryDateCheckDigit = calculateCheckDigit(expiryDate);

  // Pos 29-42: Personal Number (14 chars)
  const personalNumber = padMRZ(data.personalNumber || '', 14);
  // Pos 43: Personal Number Check Digit (0 if empty/filler according to ICAO Doc 9303 Modulo 10)
  let personalNoCheckDigit = calculateCheckDigit(personalNumber);
  if (personalNumber === '<<<<<<<<<<<<<<') {
    personalNoCheckDigit = '0';
  }

  // Composite string for overall check digit (Position 44):
  // PassportNo (9) + Check (1) + BirthDate (6) + Check (1) + ExpiryDate (6) + Check (1) + PersonalNo (14) + Check (1)
  const compositeString = `${passportNumber}${passportNoCheckDigit}${birthDate}${birthDateCheckDigit}${expiryDate}${expiryDateCheckDigit}${personalNumber}${personalNoCheckDigit}`;
  const compositeCheckDigit = calculateCheckDigit(compositeString);

  const line2 = `${passportNumber}${passportNoCheckDigit}${nationality}${birthDate}${birthDateCheckDigit}${sex}${expiryDate}${expiryDateCheckDigit}${personalNumber}${personalNoCheckDigit}${compositeCheckDigit}`;

  return {
    line1,
    line2,
    raw: `${line1}\n${line2}`
  };
}
