import { calculateICAOCheckDigit } from './mrzGenerator';

export interface MRZValidationDetails {
  isValid: boolean;
  format: 'TD3' | 'TD1' | 'TD2' | 'UNKNOWN';
  lines: string[];
  parsedFields?: {
    documentType: string;
    issuingState: string;
    surname: string;
    givenNames: string;
    passportNumber: string;
    nationality: string;
    birthDateYYMMDD: string;
    birthDate: string;
    sex: string;
    expiryDateYYMMDD: string;
    expiryDate: string;
    personalNumber?: string;
  };
  checks: {
    passportNumberCheck: { expected: number; found: number; valid: boolean };
    birthDateCheck: { expected: number; found: number; valid: boolean };
    expiryDateCheck: { expected: number; found: number; valid: boolean };
    personalNumberCheck?: { expected: number; found: number; valid: boolean };
    compositeCheck: { expected: number; found: number; valid: boolean };
  };
  errors: string[];
}

export function formatYYMMDDToISO(yymmdd: string, isBirthDate: boolean = false): string {
  if (!yymmdd || yymmdd.length !== 6 || yymmdd.includes('<')) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);

  if (isNaN(yy)) return '';

  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;

  let fullYear: number;
  if (isBirthDate) {
    // If birthdate YY is greater than current YY, it was likely 1900s (e.g. 98 -> 1998)
    // If <= current YY, it's likely 2000s (e.g. 04 -> 2004)
    fullYear = yy > currentYY ? 1900 + yy : 2000 + yy;
  } else {
    // Expiry date: if YY is <= currentYY + 50 -> 2000s, else 1900s
    fullYear = 2000 + yy;
  }

  return `${fullYear}-${mm}-${dd}`;
}

export function parseMRZ(rawMRZ: string): MRZValidationDetails {
  const lines = rawMRZ
    .split(/\r?\n/)
    .map(l => l.trim().toUpperCase().replace(/[^A-Z0-9<]/g, ''))
    .filter(l => l.length > 0);

  const errors: string[] = [];

  if (lines.length === 2 && lines[0].length === 44 && lines[1].length === 44) {
    // TD3 Format (Standard Passport)
    const line1 = lines[0];
    const line2 = lines[1];

    const documentType = line1.substring(0, 2).replace(/</g, '');
    const issuingState = line1.substring(2, 5).replace(/</g, '');
    
    // Names
    const namesSection = line1.substring(5);
    const nameParts = namesSection.split('<<');
    const surname = (nameParts[0] || '').replace(/</g, ' ').trim();
    const givenNames = (nameParts.slice(1).join(' ') || '').replace(/</g, ' ').trim();

    // Line 2
    const passportNumberStr = line2.substring(0, 9);
    const passportNumber = passportNumberStr.replace(/</g, '');
    const passportCheckFound = parseInt(line2.charAt(9), 10);
    const passportCheckExpected = calculateICAOCheckDigit(passportNumberStr);

    const nationality = line2.substring(10, 13).replace(/</g, '');
    
    const birthDateYYMMDD = line2.substring(13, 19);
    const birthCheckFound = parseInt(line2.charAt(19), 10);
    const birthCheckExpected = calculateICAOCheckDigit(birthDateYYMMDD);

    const sex = line2.charAt(20).replace(/</g, '');

    const expiryDateYYMMDD = line2.substring(21, 27);
    const expiryCheckFound = parseInt(line2.charAt(27), 10);
    const expiryCheckExpected = calculateICAOCheckDigit(expiryDateYYMMDD);

    const personalNumberStr = line2.substring(28, 42);
    const personalNumber = personalNumberStr.replace(/</g, '');
    const personalCheckFound = parseInt(line2.charAt(42), 10);
    const personalCheckExpected = calculateICAOCheckDigit(personalNumberStr);

    const compositeCheckFound = parseInt(line2.charAt(43), 10);
    const compositeString = `${passportNumberStr}${passportCheckFound}${birthDateYYMMDD}${birthCheckFound}${expiryDateYYMMDD}${expiryCheckFound}${personalNumberStr}${personalCheckFound}`;
    const compositeCheckExpected = calculateICAOCheckDigit(compositeString);

    const passportValid = passportCheckFound === passportCheckExpected;
    const birthValid = birthCheckFound === birthCheckExpected;
    const expiryValid = expiryCheckFound === expiryCheckExpected;
    const personalValid = isNaN(personalCheckFound) || personalCheckFound === personalCheckExpected;
    const compositeValid = compositeCheckFound === compositeCheckExpected;

    if (!passportValid) errors.push(`رقم التحقق الخاص برقم الجواز غير مطابق (المتوقع: ${passportCheckExpected}, الحالي: ${passportCheckFound})`);
    if (!birthValid) errors.push(`رقم التحقق لتاريخ الميلاد غير مطابق (المتوقع: ${birthCheckExpected}, الحالي: ${birthCheckFound})`);
    if (!expiryValid) errors.push(`رقم التحقق لتاريخ الانتهاء غير مطابق (المتوقع: ${expiryCheckExpected}, الحالي: ${expiryCheckFound})`);
    if (!compositeValid) errors.push(`رمز التحقق الإجمالي الشامل Composite Check غير مطابق (المتوقع: ${compositeCheckExpected}, الحالي: ${compositeCheckFound})`);

    const isAllValid = passportValid && birthValid && expiryValid && compositeValid && errors.length === 0;

    return {
      isValid: isAllValid,
      format: 'TD3',
      lines,
      parsedFields: {
        documentType,
        issuingState,
        surname,
        givenNames,
        passportNumber,
        nationality,
        birthDateYYMMDD,
        birthDate: formatYYMMDDToISO(birthDateYYMMDD, true),
        sex,
        expiryDateYYMMDD,
        expiryDate: formatYYMMDDToISO(expiryDateYYMMDD, false),
        personalNumber
      },
      checks: {
        passportNumberCheck: { expected: passportCheckExpected, found: passportCheckFound, valid: passportValid },
        birthDateCheck: { expected: birthCheckExpected, found: birthCheckFound, valid: birthValid },
        expiryDateCheck: { expected: expiryCheckExpected, found: expiryCheckFound, valid: expiryValid },
        personalNumberCheck: { expected: personalCheckExpected, found: personalCheckFound, valid: personalValid },
        compositeCheck: { expected: compositeCheckExpected, found: compositeCheckFound, valid: compositeValid }
      },
      errors
    };
  }

  return {
    isValid: false,
    format: 'UNKNOWN',
    lines,
    checks: {
      passportNumberCheck: { expected: 0, found: 0, valid: false },
      birthDateCheck: { expected: 0, found: 0, valid: false },
      expiryDateCheck: { expected: 0, found: 0, valid: false },
      compositeCheck: { expected: 0, found: 0, valid: false }
    },
    errors: ['أبعاد أو أسطر MRZ غير متطابقة مع معيار ICAO TD3 (يجب أن تكون سطرين وكل سطر يحتوي على 44 حرفاً بالضبط)']
  };
}
