import React, { useState, useEffect } from 'react';
import { PassportData, ActiveTab } from './types/passport';
import { SAMPLE_PASSPORTS } from './utils/sampleData';
import { Header } from './components/Header';
import { PassportPreview } from './components/PassportPreview';
import { MRZEditor } from './components/MRZEditor';
import { MRZValidator } from './components/MRZValidator';
import { BarcodeStudio } from './components/BarcodeStudio';
import { CameraScanner } from './components/CameraScanner';
import { PassportRegistry } from './components/PassportRegistry';
import { StandardsDoc } from './components/StandardsDoc';
import { Footer } from './components/Footer';
import { generateTD3MRZ } from './utils/mrzGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [passportData, setPassportData] = useState<PassportData>(SAMPLE_PASSPORTS.sau);
  const [activeHoverField, setActiveHoverField] = useState<string | null>(null);

  // Apply dark mode class to html document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handlePassportDataChange = (newData: PassportData) => {
    setPassportData(newData);
  };

  const handleScanComplete = (scannedPassport: PassportData) => {
    setPassportData(scannedPassport);
    setActiveTab('editor');
  };

  const currentMRZ = generateTD3MRZ(passportData);

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between`}>
      <div>
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lang={lang}
          onLanguageToggle={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Editor & Passport Preview View */}
          {activeTab === 'editor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Editor */}
              <div className="lg:col-span-5 space-y-4">
                <MRZEditor
                  data={passportData}
                  onChange={handlePassportDataChange}
                  lang={lang}
                />
              </div>

              {/* Real-time Official Specimen Visual Preview */}
              <div className="lg:col-span-7 sticky top-24 space-y-4">
                <PassportPreview
                  data={passportData}
                  lang={lang}
                  activeHoverField={activeHoverField}
                  onHoverField={setActiveHoverField}
                />
              </div>
            </div>
          )}

          {/* Inspector & Validator View */}
          {activeTab === 'validator' && (
            <MRZValidator
              currentMRZLine1={currentMRZ.line1}
              currentMRZLine2={currentMRZ.line2}
              onLoadDataToEditor={(data) => {
                setPassportData(data);
                setActiveTab('editor');
              }}
              lang={lang}
            />
          )}

          {/* Barcode Studio View */}
          {activeTab === 'barcodes' && (
            <BarcodeStudio passportData={passportData} lang={lang} />
          )}

          {/* AI Camera OCR Scanner View */}
          {activeTab === 'scanner' && (
            <CameraScanner onScanComplete={handleScanComplete} lang={lang} />
          )}

          {/* Saved Registry View */}
          {activeTab === 'registry' && (
            <PassportRegistry
              currentPassport={passportData}
              onSelectPassport={(selected) => {
                setPassportData(selected);
                setActiveTab('editor');
              }}
              lang={lang}
            />
          )}

          {/* Standards Documentation View */}
          {activeTab === 'standards' && (
            <StandardsDoc lang={lang} />
          )}
        </main>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
