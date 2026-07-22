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
Analyze this passport image and extract all visible data accurately in both English and Arabic where present.

Crucial Instructions:
1. Identify the 2 MRZ lines at the bottom of the passport (TD3 format, each exactly 44 characters).
2. Extract the printed English and Arabic fields accurately:
   - Surname in English (e.g., HEBAH, AL HASHIMI)
   - Surname in Arabic (e.g., هبه, الهاشمي)
   - Given Names in English (e.g., MOHAMMED MOHAMMED HUSSEIN)
   - Given Names in Arabic (e.g., محمد محمد حسين)
   - Passport Number (9 chars/digits, e.g., 14704563)
   - Country/Issuing State Code (3-letter ISO, e.g. YEM, SAU, EGY)
   - Nationality Code (3-letter ISO, e.g. YEM, SAU, EGY)
   - Date of Birth (YYYY-MM-DD format)
   - Date of Issue (YYYY-MM-DD format)
   - Date of Expiry (YYYY-MM-DD format)
   - Sex ('M' or 'F')
   - Profession in English (e.g., LABORER, ENGINEER, STUDENT)
   - Profession in Arabic (e.g., عامل, مهندس, طالب)
   - Place of Birth in English (e.g., ALMAHWEET - YEM, SANAA)
   - Place of Birth in Arabic (e.g., اليمن - المحويت, صنعاء)
   - Issuing Authority in English (e.g., ADEN, SANAA)
   - Issuing Authority in Arabic (e.g., عدن, صنعاء)
   - Personal Number / ID Number (if present)

Return ONLY valid JSON matching this exact structure without markdown code blocks:
{
  "mrzLine1": "P<YEMHEBAH<<MOHAMMED<MOHAMMED<HUSSEIN<<<<<<<<",
  "mrzLine2": "14704563<4YEM0301121M3011272<<<<<<<<<<<<<<00",
  "surname": "HEBAH",
  "surnameAr": "هبه",
  "givenNames": "MOHAMMED MOHAMMED HUSSEIN",
  "givenNamesAr": "محمد محمد حسين",
  "passportNumber": "14704563",
  "issuingState": "YEM",
  "nationality": "YEM",
  "birthDate": "2003-01-12",
  "issueDate": "2024-11-27",
  "expiryDate": "2030-11-27",
  "sex": "M",
  "profession": "LABORER",
  "professionAr": "عامل",
  "placeOfBirth": "ALMAHWEET - YEM",
  "placeOfBirthAr": "اليمن - المحويت",
  "issuingAuthority": "ADEN",
  "issuingAuthorityAr": "عدن",
  "personalNumber": ""
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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
