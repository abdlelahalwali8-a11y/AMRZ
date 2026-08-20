import { PassportData, MRZGenerationResult } from '../types/passport';

/**
 * Calculates check digit according to ICAO Doc 9303.
 * Uses 7-3-1 weight pattern.
 * Characters 0-9 have values 0-9.
 * Letters A-Z have values 10-35.
 * Filler '<' has value 0.
 */
export function calculateICAOCheckDigit(str: string): number {
  const weights = [7, 3, 1];
  let sum = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i].toUpperCase();
    let value = 0;

    if (char >= '0' && char <= '9') {
      value = char.charCodeAt(0) - 48;
    } else if (char >= 'A' && char <= 'Z') {
      value = char.charCodeAt(0) - 55;
    } else if (char === '<') {
      value = 0;
    }

    sum += value * weights[i % 3];
  }

  return sum % 10;
}

/**
 * Sanitizes and formats text for MRZ fields (A-Z, 0-9, and '<')
 */
export function sanitizeMRZString(str: string, maxLength: number): string {
  if (!str) return '<'.repeat(maxLength);

  // Normalize Latin characters and remove diacritics
  const normalized = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '<');

  const padded = normalized.padEnd(maxLength, '<');
  return padded.slice(0, maxLength);
}

/**
 * Formats YYYY-MM-DD or DD/MM/YYYY to YYMMDD for MRZ
 */
export function formatDateToYYMMDD(dateStr: string): string {
  if (!dateStr) return '<<<<<<';

  const clean = dateStr.replace(/[^0-9]/g, '');
  if (clean.length === 6) {
    return clean;
  }
  if (clean.length === 8) {
    if (dateStr.includes('-')) {
      // YYYYMMDD
      return clean.substring(2);
    } else {
      // DDMMYYYY -> YYMMDD
      const dd = clean.substring(0, 2);
      const mm = clean.substring(2, 4);
      const yyyy = clean.substring(4, 8);
      return `${yyyy.substring(2)}${mm}${dd}`;
    }
  }

  return '<<<<<<';
}

/**
 * Generates TD3 (Passport - 2 lines x 44 chars) MRZ according to ICAO Doc 9303 Part 4
 */
export function generateTD3MRZ(passport: PassportData): MRZGenerationResult {
  const docType = (passport.documentType || 'P').padEnd(1, '<').slice(0, 1);
  const docSubtype = (passport.documentSubtype || '<').padEnd(1, '<').slice(0, 1);
  const issuingState = (passport.issuingState || '<<<').padEnd(3, '<').slice(0, 3).toUpperCase();

  // Names formatted: SURNAME<<GIVEN<NAMES<<<<...
  const cleanSurname = (passport.surname || '').toUpperCase().replace(/[^A-Z]/g, '<').replace(/<+/g, '<');
  const cleanGiven = (passport.givenNames || '').toUpperCase().replace(/[^A-Z]/g, '<').replace(/<+/g, '<');

  let nameField = '';
  if (cleanSurname && cleanGiven) {
    nameField = `${cleanSurname}<<${cleanGiven}`;
  } else if (cleanSurname) {
    nameField = cleanSurname;
  } else if (cleanGiven) {
    nameField = cleanGiven;
  } else {
    nameField = 'PASSPORT<<HOLDER';
  }

  const line1Names = nameField.padEnd(39, '<').slice(0, 39);
  const line1 = `${docType}${docSubtype}${issuingState}${line1Names}`;

  // Line 2 Components
  const rawPassportNum = (passport.passportNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const passportNumPadded = rawPassportNum.padEnd(9, '<').slice(0, 9);
  const passportNumCheck = calculateICAOCheckDigit(passportNumPadded);

  const nationality = (passport.nationality || issuingState || '<<<').padEnd(3, '<').slice(0, 3).toUpperCase();

  const birthDateYYMMDD = formatDateToYYMMDD(passport.birthDate);
  const birthDateCheck = calculateICAOCheckDigit(birthDateYYMMDD);

  const sex = (passport.sex || '<').toUpperCase().slice(0, 1);
  const validSex = ['M', 'F', 'X', '<'].includes(sex) ? sex : '<';

  const expiryDateYYMMDD = formatDateToYYMMDD(passport.expiryDate);
  const expiryDateCheck = calculateICAOCheckDigit(expiryDateYYMMDD);

  const rawPersonalNum = (passport.personalNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const personalNumPadded = rawPersonalNum.padEnd(14, '<').slice(0, 14);
  const personalNumCheck = calculateICAOCheckDigit(personalNumPadded);

  // Composite check digit string:
  // Passport number + check digit + DOB + check digit + Expiry + check digit + Personal number + check digit
  const compositeString = `${passportNumPadded}${passportNumCheck}${birthDateYYMMDD}${birthDateCheck}${expiryDateYYMMDD}${expiryDateCheck}${personalNumPadded}${personalNumCheck}`;
  const compositeCheck = calculateICAOCheckDigit(compositeString);

  const line2 = `${passportNumPadded}${passportNumCheck}${nationality}${birthDateYYMMDD}${birthDateCheck}${validSex}${expiryDateYYMMDD}${expiryDateCheck}${personalNumPadded}${personalNumCheck}${compositeCheck}`;

  return {
    line1,
    line2,
    format: 'TD3',
    isValid: true,
    checkDigits: {
      passportNumber: { digit: passportNumCheck, valid: true, value: passportNumPadded },
      birthDate: { digit: birthDateCheck, valid: true, value: birthDateYYMMDD },
      expiryDate: { digit: expiryDateCheck, valid: true, value: expiryDateYYMMDD },
      personalNumber: { digit: personalNumCheck, valid: true, value: personalNumPadded },
      composite: { digit: compositeCheck, valid: true, value: compositeString }
    }
  };
}
