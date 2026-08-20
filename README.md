# 🛂 نظام الجوازات والقراءة الآلية ICAO 9303 - PWA

تطبيق ويب تقدمي (PWA) كامل ومتكامل لمسح وقراءة وإنشاء ومعاينة جوازات السفر الرسمية طبقاً لمعايير **ICAO Doc 9303 (TD3)** مع توليد الباركود **PDF417** والأكواد الآلية MRZ بدقة متناهية ودعم العمل بدون إنترنت (Offline Mode).

---

## 🚀 النشر السريع والمجاني (Deployment)

### 1️⃣ النشر عبر Vercel (مجاناً 100%)
يمكنك نشر التطبيق على منصة **Vercel** بضغطة زر واحدة مجاناً مع دعم كامل لدوال Serverless API:

1. اضغط على زر Deploy أدناه أو اربط مستودع GitHub بحسابك في Vercel.
2. إضافة متغير البيئة (Environment Variable):
   - `GEMINI_API_KEY`: مفتاح API من [Google AI Studio](https://aistudio.google.com/) لمعالجة القراءة الذكية للصور بالذكاء الاصطناعي.
3. اضغط **Deploy**. ستقوم Vercel ببناء وتوجيه كافة الطلبات وتفعيل شهادة SSL مجاناً.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

### 2️⃣ الرفع والنشر عبر GitHub

1. أنشئ مستودعاً جديداً (Repository) على **GitHub**.
2. قم برفع المشروع باستخدام أوامر Git التالية:

```bash
git init
git add .
git commit -m "الإصدار الأول - نظام الجوازات ICAO 9303 PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

3. يحتوي المشروع على سير عمل محدد تلقائياً في `.github/workflows/deploy.yml` ليقوم بفحص الأخطاء والتأكد من نجاح البناء (Build & Lint) تلقائياً عند كل Push أو Pull Request.

---

## 🛠️ التشغيل والتطوير المحلي (Local Development)

### المتطلبات الأساسية
- Node.js إصدار **v18** أو أحدث.
- npm أو yarn.

### خطوات التشغيل المحلي

1. **تثبيت الحزم والمكتبات:**
   ```bash
   npm install
   ```

2. **إعداد ملف البيئة `.env`:**
   قم بإنشاء ملف `.env` في المجلد الرئيسي وضمّن مفتاح Google Gemini:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```

3. **تشغيل خادم التطوير المحلي:**
   ```bash
   npm run dev
   ```
   افتح المتصفح على العنوان: `http://localhost:3000`

4. **اختبار البناء للإنتاج:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 هيكلة الملفات الرئيسية والأدوات

| الملف / المجلد | الوصف |
| :--- | :--- |
| `vercel.json` | ملف إعدادات النشر وخوادم Serverless والتوجيه على Vercel |
| `api/index.ts` | نقطة الانطلاق لدوال Vercel Serverless API (`/api/scan-passport`) |
| `.github/workflows/deploy.yml` | أتمتة الفحص والبناء عبر GitHub Actions CI/CD |
| `public/manifest.json` | ملف تعريف الـ PWA وتثبيت التطبيق على الهواتف وصفحة الشاشة الرئيسية |
| `public/sw.js` | ملف Service Worker للتخزين المحلي ودعم العمل بدون إنترنت (Offline Mode) وإشعارات Push |
| `server.ts` | خادم Express الخلفي للربط مع مكتبة Google GenAI وخدمات المسح |
| `src/` | واجهة المستخدم المبنية بواسطة React, TypeScript, Tailwind CSS, وLucide Icons |

---

## 🌟 ميزات نظام الجوازات ICAO 9303 PWA

- ✅ **PWA جاهز للتثبيت:** يعمل كـ Native App على Android, iOS, Windows, و macOS.
- 📶 **دعم الأوفلاين (Offline First):** معاينة وتوليد الأكواد والباركوادت دون الحاجة للإنترنت.
- 📷 **المسح الضوئي الذكي بالذكاء الاصطناعي:** استخراج البيانات باللغتين العربية والإنجليزية بواسطة Gemini 3.6 Flash.
- 🖨️ **باركود PDF417 معتمد:** توليد وطباعة أسطر الباركود والـ MRZ طبقاً لمنظمة الطيران المدني الدولي (ICAO).
- 🔔 **إشعارات Push التفاعلية:** للتنبيه بخصوص المستندات والحفظ وسجل الوثائق.

---

## 📄 الترخيص
هذا المشروع مفتوح المصدر ومتاح للاستخدام المجاني تحت ترخيص **MIT License**.
