export interface PassportData {
  id: string;
  documentType: string;        // 'P', 'PD', 'PS', 'I', 'ID'
  documentSubtype?: string;    // '<', 'D', 'S'
  issuingState: string;        // 3-letter ISO (e.g. YEM, SAU, EGY, USA)
  surname: string;             // English / Latin
  surnameAr?: string;          // Arabic
  givenNames: string;          // English / Latin
  givenNamesAr?: string;       // Arabic
  passportNumber: string;      // e.g. 13966269
  nationality: string;         // 3-letter ISO
  birthDate: string;           // YYYY-MM-DD
  sex: 'M' | 'F' | 'X' | '<';
  expiryDate: string;          // YYYY-MM-DD
  issueDate?: string;          // YYYY-MM-DD
  personalNumber?: string;     // National ID / Personal No
  profession?: string;         // English
  professionAr?: string;       // Arabic
  placeOfBirth?: string;       // English
  placeOfBirthAr?: string;     // Arabic
  issuingAuthority?: string;   // English
  issuingAuthorityAr?: string; // Arabic
  photoUrl?: string;           // Base64 or URL
  signatureUrl?: string;       // Base64 or URL
}

export interface MRZGenerationResult {
  line1: string;
  line2: string;
  line3?: string;
  format: 'TD3' | 'TD1' | 'TD2';
  isValid: boolean;
  checkDigits: {
    passportNumber: { digit: number; valid: boolean; value: string };
    birthDate: { digit: number; valid: boolean; value: string };
    expiryDate: { digit: number; valid: boolean; value: string };
    personalNumber?: { digit: number; valid: boolean; value: string };
    composite: { digit: number; valid: boolean; value: string };
  };
}

export interface BarcodeConfig {
  type: 'pdf417' | 'qrcode' | 'datamatrix' | 'code128';
  includeMRZ: boolean;
  includePersonalData: boolean;
  includeRawJson: boolean;
  scale: number;
  securityLevel?: number; // 0-8 for PDF417
  customPrefix?: string;
}
