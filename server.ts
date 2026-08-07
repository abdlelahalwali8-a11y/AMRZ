import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Allow large payloads for base64 image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Passport Vision OCR & MRZ Extractor API Route
app.post('/api/scan-passport', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set.');
      return res.status(500).json({ error: 'GEMINI_API_KEY missing on server' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are an expert official passport OCR and ICAO 9303 Machine Readable Zone (MRZ) reader.
Analyze the provided passport image carefully and extract all visible text and fields with 100% accuracy in both English and Arabic.

Instructions for Extraction:
1. Locate the 2 MRZ lines at the bottom of the passport (TD3 format, exactly 44 characters per line).
2. Extract the printed English and Arabic fields:
   - "passportNumber": The passport number (9 characters/digits, e.g., 13966269 or 14704563).
   - "surname": Surname / Family name in English (e.g., AL-ZAHEAH, HEBAH, AL HASHIMI).
   - "surnameAr": Surname in Arabic (اللقب - e.g., الزحيه, هبه).
   - "givenNames": Given / First & Middle names in English (e.g., MOHAMMED SHAWQI MOHAMMED HASAN).
   - "givenNamesAr": Given names in Arabic (الاسم / الاسم الكامل - e.g., محمد شوقي محمد حسن).
   - "documentType": Type of document, usually 'P'.
   - "issuingState": 3-letter ISO country code (e.g., YEM, SAU, EGY).
   - "nationality": 3-letter ISO nationality code (e.g., YEM, SAU, EGY).
   - "birthDate": Date of birth in YYYY-MM-DD format (convert DD/MM/YYYY e.g. 02/02/2004 to 2004-02-02).
   - "issueDate": Date of issue in YYYY-MM-DD format (convert DD/MM/YYYY e.g. 17/04/2024 to 2024-04-17).
   - "expiryDate": Date of expiry in YYYY-MM-DD format (convert DD/MM/YYYY e.g. 17/04/2030 to 2030-04-17).
   - "sex": Gender ('M' or 'F').
   - "profession": Profession in English (e.g., LABORER, ENGINEER, STUDENT).
   - "professionAr": Profession in Arabic (المهنة - e.g., عامل, مهندس, طالب).
   - "placeOfBirth": Place of birth in English (e.g., ALMAHWEET - YEM, SANAA).
   - "placeOfBirthAr": Place of birth in Arabic (محل الميلاد - e.g., اليمن - المحويت, صنعاء).
   - "issuingAuthority": Issuing Authority in English (e.g., KHAWKHAH, ADEN, SANAA).
   - "issuingAuthorityAr": Issuing Authority in Arabic (جهة الإصدار - e.g., الخوخة, عدن, صنعاء).
   - "personalNumber": Personal ID number if present (or empty string).
   - "mrzLine1": Exact MRZ Line 1 (44 characters).
   - "mrzLine2": Exact MRZ Line 2 (44 characters).

Return JSON only.`;

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
                mimeType: 'image/jpeg',
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

    const textResponse = response.text || '';
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse JSON response from vision model' });
    }

    const data = JSON.parse(jsonMatch[0]);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Passport scan server error:', error);
    return res.status(500).json({ error: error.message || 'Passport scanning failed' });
  }
});

async function startServer() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
