import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Lazy GoogleGenAI client initialization
let genaiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genaiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found. Attempting default initialization...');
    }
    genaiClient = new GoogleGenAI({ apiKey: apiKey || undefined });
  }
  return genaiClient;
}

// Endpoint for Passport OCR & MRZ Scanning
app.post('/api/scan-passport', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const ai = getGenAI();
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are an expert official passport OCR reader and ICAO Doc 9303 Machine Readable Travel Document (MRTD) analyzer.
Carefully examine the uploaded passport image and extract all text and machine-readable data with maximum precision in both English/Latin and Arabic scripts.

OCR & EXTRACTION INSTRUCTIONS:
1. MACHINE READABLE ZONE (MRZ):
   - Locate the 2 lines of text at the bottom of the passport page (TD3 format: exactly 44 characters per line consisting of uppercase letters A-Z, numbers 0-9, and '<' filler characters).
   - Line 1 structure: P<[3-letter Country][Surname]<<[Given Names]... padded to 44 characters with '<'.
   - Line 2 structure: [Passport No 9 chars][Check 1][Nationality 3 chars][DOB YYMMDD 6 chars][Check 1][Sex M/F 1][Expiry YYMMDD 6 chars][Check 1][Personal No / National ID 14 chars][Check 1][Composite Check 1].
   - "mrzLine1": Exact 44-character line 1.
   - "mrzLine2": Exact 44-character line 2.

2. VISUAL INSPECTION ZONE (VIZ) & MULTILINGUAL FIELDS:
   - "passportNumber": Exact official passport number (alphanumeric, e.g. 13966269, 14704563, N1234567, etc.).
   - "surname": Family name / Surname in English / Latin capital letters (e.g. AL-ZAHEAH, AL-HASHIMI, SMITH).
   - "surnameAr": Family name / Surname in Arabic script (اللقب / العائلة / اسم العشيرة) if present on the passport.
   - "givenNames": First, middle, and patronymic names in English / Latin capital letters (e.g. MOHAMMED SHAWQI MOHAMMED HASAN).
   - "givenNamesAr": Given names in Arabic script (الاسم / الاسم الكامل / اسم الأب والجد) if present on the passport.
   - "documentType": 'P' for regular passport, 'PD' for diplomatic, 'PS' for service/special.
   - "issuingState": 3-letter ISO 3166-1 alpha-3 code of the issuing country (e.g. YEM, SAU, EGY, ARE, KWT, QAT, OMN, JOR, IRQ, SDN, MAR, DZA, TUN, USA, GBR, FRA, DEU, TUR).
   - "nationality": 3-letter ISO 3166-1 alpha-3 nationality code.
   - "birthDate": Date of birth converted to standard ISO format "YYYY-MM-DD" (e.g. "2004-02-02").
   - "issueDate": Date of issuance in "YYYY-MM-DD" format (e.g. "2024-04-17").
   - "expiryDate": Date of expiration in "YYYY-MM-DD" format (e.g. "2030-04-17").
   - "sex": 'M' for male, 'F' for female.
   - "personalNumber": National identification number / Personal number (الرقم الوطني / الرقم الشخصي / السجل المدني) if present, otherwise "".
   - "profession": Profession in English (e.g. LABORER, ENGINEER, DOCTOR, STUDENT) if present, otherwise "".
   - "professionAr": Profession in Arabic (المهنة) if present, otherwise "".
   - "placeOfBirth": Place of birth in English (e.g. ALMAHWEET - YEM, SANAA, RIYADH, CAIRO) if present, otherwise "".
   - "placeOfBirthAr": Place of birth in Arabic (محل الميلاد) if present, otherwise "".
   - "issuingAuthority": Issuing authority / office in English (e.g. KHAWKHAH, ADEN, SANAA, RIYADH) if present, otherwise "".
   - "issuingAuthorityAr": Issuing authority in Arabic (جهة الإصدار) if present, otherwise "".

OUTPUT SPECIFICATION:
- Return ONLY a raw JSON object containing these exact keys.
- Do NOT wrap in markdown backticks or commentary.
- Ensure all dates are in "YYYY-MM-DD" format.
- Ensure country codes are 3-letter ISO codes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      config: {
        responseMimeType: 'application/json'
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      data = match ? JSON.parse(match[0]) : {};
    }

    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Passport scan server error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

// Setup Vite in development or serve dist in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Passport MRZ & Barcode System server running on port ${port}`);
});
