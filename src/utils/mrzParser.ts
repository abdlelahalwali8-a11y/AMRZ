import { MRZError, MRZResult, ParsedMRZFields, SexType } from '../types/passport';
import { calculateCheckDigit } from './mrzGenerator';

/**
 * Parses and validates an MRZ string (TD3 standard 2 lines of 44 chars)
 */
export function parseMRZ(rawInput: string): MRZResult {
  // Clean input string, split by newline or return lines
  const lines = rawInput
    .split(/\r?\n/)
    .map((l) => l.trim().toUpperCase())
    .filter((l) => l.length > 0);

  const errors: MRZError[] = [];

  if (lines.length < 2) {
    return {
      line1: lines[0] || '',
      line2: '',
      rawText: rawInput,
      format: 'TD3',
      isValid: false,
      errors: [
        {
          field: 'general',
          message: 'يجب أن تحتوي القراءة الآلية (MRZ) للجواز الرسمي على سطرين بدقة (2 Lines)',
          code: 'INVALID_LINE_COUNT'
        }
      ],
      parsedFields: createEmptyParsedFields()
    };
  }

  // Sanitize line 1 & line 2 (ensure length 44)
  const line1 = lines[0].replace(/[^A-Z0-9<]/g, '<').padEnd(44, '<').slice(0, 44);
  const line2 = lines[1].replace(/[^A-Z0-9<]/g, '<').padEnd(44, '<').slice(0, 44);

  // Line 1 Parsing:
  const documentType = line1.substring(0, 2).replace(/</g, '');
  const issuingState = line1.substring(2, 5).replace(/</g, '');
  
  // Name field (pos 6-44 = 39 chars)
  const rawNameField = line1.substring(5, 44);
  const nameParts = rawNameField.split('<<');
  const surname = (nameParts[0] || '').replace(/</g, ' ').trim();
  const givenNames = nameParts.slice(1).join(' ').replace(/</g, ' ').trim();

  // Line 2 Parsing:
  const passportNumber = line2.substring(0, 9).replace(/</g, '');
  const passportNumberCheckDigit = line2.substring(9, 10);
  const expectedPassportCheck = calculateCheckDigit(line2.substring(0, 9));
  const passportNumberCheckValid = passportNumberCheckDigit === expectedPassportCheck;

  if (!passportNumberCheckValid) {
    errors.push({
      field: 'passportNumber',
      message: `رمز التحقق لرقم الجواز غير صحيح (المحسوب: ${expectedPassportCheck} ، الموجود: ${passportNumberCheckDigit})`,
      code: 'CHECKSUM_PASSPORT_MISMATCH'
    });
  }

  const nationality = line2.substring(10, 13).replace(/</g, '');

  const birthDateYYMMDD = line2.substring(13, 19);
  const birthDateCheckDigit = line2.substring(19, 20);
  const expectedBirthCheck = calculateCheckDigit(birthDateYYMMDD);
  const birthDateCheckValid = birthDateCheckDigit === expectedBirthCheck;

  if (!birthDateCheckValid) {
    errors.push({
      field: 'birthDate',
      message: `رمز التحقق لتاريخ الميلاد غير صحيح (المحسوب: ${expectedBirthCheck} ، الموجود: ${birthDateCheckDigit})`,
      code: 'CHECKSUM_BIRTHDATE_MISMATCH'
    });
  }

  const sexRaw = line2.substring(20, 21);
  const sex: SexType = sexRaw === 'M' ? 'M' : sexRaw === 'F' ? 'F' : '<';

  const expiryDateYYMMDD = line2.substring(21, 27);
  const expiryDateCheckDigit = line2.substring(27, 28);
  const expectedExpiryCheck = calculateCheckDigit(expiryDateYYMMDD);
  const expiryDateCheckValid = expiryDateCheckDigit === expectedExpiryCheck;

  if (!expiryDateCheckValid) {
    errors.push({
      field: 'expiryDate',
      message: `رمز التحقق لتاريخ الانتهاء غير صحيح (المحسوب: ${expectedExpiryCheck} ، الموجود: ${expiryDateCheckDigit})`,
      code: 'CHECKSUM_EXPIRY_MISMATCH'
    });
  }

  const personalNumber = line2.substring(28, 42).replace(/</g, '');
  const personalNumberCheckDigit = line2.substring(42, 43);
  const rawPersonalField = line2.substring(28, 42);
  const expectedPersonalCheck = calculateCheckDigit(rawPersonalField);
  
  // If personal number is unused (all <), check digit may be '<' or '0'
  const personalNumberCheckValid =
    personalNumberCheckDigit === expectedPersonalCheck ||
    (rawPersonalField === '<<<<<<<<<<<<<<' && (personalNumberCheckDigit === '<' || personalNumberCheckDigit === '0'));

  if (!personalNumberCheckValid) {
    errors.push({
      field: 'personalNumber',
      message: `رمز التحقق للرقم الشخصي/القومي غير صحيح (المحسوب: ${expectedPersonalCheck} ، الموجود: ${personalNumberCheckDigit})`,
      code: 'CHECKSUM_PERSONAL_MISMATCH'
    });
  }

  // Composite check calculation:
  // PassportNo (9) + Check (1) + BirthDate (6) + Check (1) + ExpiryDate (6) + Check (1) + PersonalNo (14) + Check (1)
  const compositePart1 = line2.substring(0, 10); // passport no + check
  const compositePart2 = line2.substring(13, 20); // birth date + check
  const compositePart3 = line2.substring(21, 28); // expiry date + check
  const compositePart4 = line2.substring(28, 43).replace(/</g, '0'); // personal no + check
  const compositeSource = `${compositePart1}${compositePart2}${compositePart3}${compositePart4}`;
  
  const compositeCheckDigit = line2.substring(43, 44);
  const expectedCompositeCheck = calculateCheckDigit(compositeSource);
  const compositeCheckValid = compositeCheckDigit === expectedCompositeCheck;

  if (!compositeCheckValid) {
    errors.push({
      field: 'composite',
      message: `رمز التحقق الشامل للجواز (Composite Check) غير صحيح (المحسوب: ${expectedCompositeCheck} ، الموجود: ${compositeCheckDigit})`,
      code: 'CHECKSUM_COMPOSITE_MISMATCH'
    });
  }

  const isValid = errors.length === 0;

  const parsedFields: ParsedMRZFields = {
    documentType,
    issuingState,
    surname,
    givenNames,
    passportNumber,
    passportNumberCheckDigit,
    passportNumberCheckValid,
    nationality,
    birthDateYYMMDD,
    birthDateCheckDigit,
    birthDateCheckValid,
    sex,
    expiryDateYYMMDD,
    expiryDateCheckDigit,
    expiryDateCheckValid,
    personalNumber,
    personalNumberCheckDigit,
    personalNumberCheckValid,
    compositeCheckDigit,
    compositeCheckValid
  };

  return {
    line1,
    line2,
    rawText: `${line1}\n${line2}`,
    format: 'TD3',
    isValid,
    errors,
    parsedFields
  };
}

/**
 * Format YYMMDD to readable date YYYY-MM-DD
 */
export function formatYYMMDDToISO(yymmdd: string, isBirthDate: boolean = false): string {
  if (!yymmdd || yymmdd.length !== 6) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);

  const currentYear = new Date().getFullYear() % 100;
  let fullYear = 2000 + yy;

  if (isBirthDate) {
    // If birth year is greater than current 2-digit year, it's in 1900s
    if (yy > currentYear) {
      fullYear = 1900 + yy;
    }
  } else {
    // Expiry date: if yy < currentYear - 30, might be 1900s or 2000s
    if (yy > currentYear + 20) {
      fullYear = 1900 + yy;
    }
  }

  return `${fullYear}-${mm}-${dd}`;
}

function createEmptyParsedFields(): ParsedMRZFields {
  return {
    documentType: '',
    issuingState: '',
    surname: '',
    givenNames: '',
    passportNumber: '',
    passportNumberCheckDigit: '',
    passportNumberCheckValid: false,
    nationality: '',
    birthDateYYMMDD: '',
    birthDateCheckDigit: '',
    birthDateCheckValid: false,
    sex: '<',
    expiryDateYYMMDD: '',
    expiryDateCheckDigit: '',
    expiryDateCheckValid: false,
    personalNumber: '',
    personalNumberCheckDigit: '',
    personalNumberCheckValid: false,
    compositeCheckDigit: '',
    compositeCheckValid: false
  };
}
