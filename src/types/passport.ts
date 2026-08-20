export type DocumentType = 'P' | 'PD' | 'PO' | 'PS' | 'V' | 'I';

export type SexType = 'M' | 'F' | '<';

export interface PassportData {
  id: string;
  documentType: DocumentType; // 'P' for ordinary passport
  documentSubtype: string; // e.g. '<', 'D', 'O', 'S'
  issuingState: string; // ISO 3166-1 alpha-3 code (e.g., SAU, YEM, EGY)
  surname: string; // Primary identifier
  givenNames: string; // Secondary identifier
  surnameAr?: string;
  givenNamesAr?: string;
  passportNumber: string; // 9 characters
  nationality: string; // ISO 3166-1 alpha-3 code
  birthDate: string; // YYYY-MM-DD format for form
  sex: SexType;
  expiryDate: string; // YYYY-MM-DD format for form
  personalNumber: string; // Up to 14 chars (National ID / Personal ID)
  issueDate: string; // YYYY-MM-DD
  placeOfBirth: string;
  placeOfBirthAr?: string;
  profession?: string;
  professionAr?: string;
  issuingAuthority: string;
  issuingAuthorityAr?: string;
  photoUrl: string;
  signatureUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MRZResult {
  line1: string;
  line2: string;
  rawText: string;
  format: 'TD3' | 'TD1' | 'TD2';
  isValid: boolean;
  errors: MRZError[];
  charValidation?: {
    line1ErrorIndices: number[];
    line2ErrorIndices: number[];
  };
  parsedFields: ParsedMRZFields;
}

export interface ParsedMRZFields {
  documentType: string;
  issuingState: string;
  surname: string;
  givenNames: string;
  passportNumber: string;
  passportNumberCheckDigit: string;
  passportNumberCheckValid: boolean;
  nationality: string;
  birthDateYYMMDD: string;
  birthDateCheckDigit: string;
  birthDateCheckValid: boolean;
  sex: SexType;
  expiryDateYYMMDD: string;
  expiryDateCheckDigit: string;
  expiryDateCheckValid: boolean;
  personalNumber: string;
  personalNumberCheckDigit: string;
  personalNumberCheckValid: boolean;
  compositeCheckDigit: string;
  compositeCheckValid: boolean;
}

export interface MRZError {
  field: string;
  message: string;
  messageAr?: string;
  messageEn?: string;
  code: string;
}

export interface CountryInfo {
  code: string; // 3-letter ISO code
  nameAr: string;
  nameEn: string;
  flag: string;
}

export type ActiveTab = 'editor' | 'validator' | 'barcodes' | 'scanner' | 'registry' | 'standards';
