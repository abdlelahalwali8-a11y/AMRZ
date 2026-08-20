import React, { useState } from 'react';
import { PassportData } from './types/passport';
import { SAMPLE_PASSPORTS } from './utils/sampleData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MRZEditor } from './components/MRZEditor';
import { PassportPreview } from './components/PassportPreview';
import { CameraScanner } from './components/CameraScanner';
import { MRZValidator } from './components/MRZValidator';
import { BarcodeStudio } from './components/BarcodeStudio';
import { PassportRegistry } from './components/PassportRegistry';
import { StandardsDoc } from './components/StandardsDoc';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [passport, setPassport] = useState<PassportData>(SAMPLE_PASSPORTS[0]);

  const handleScanComplete = (scannedPassport: PassportData) => {
    setPassport(scannedPassport);
    setActiveTab('editor');
  };

  const handleLoadFromValidator = (loadedPassport: PassportData) => {
    setPassport(prev => ({
      ...prev,
      ...loadedPassport
    }));
    setActiveTab('editor');
  };

  const handleSelectFromRegistry = (selectedPassport: PassportData) => {
    setPassport(selectedPassport);
    setActiveTab('editor');
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 ${lang === 'ar' ? 'font-sans' : 'font-sans'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'editor' && (
          <div className="space-y-8">
            <MRZEditor passport={passport} setPassport={setPassport} lang={lang} />
            <PassportPreview passport={passport} lang={lang} />
          </div>
        )}

        {activeTab === 'scanner' && (
          <CameraScanner onScanComplete={handleScanComplete} lang={lang} />
        )}

        {activeTab === 'validator' && (
          <MRZValidator onLoadIntoEditor={handleLoadFromValidator} lang={lang} />
        )}

        {activeTab === 'barcode' && (
          <BarcodeStudio passport={passport} lang={lang} />
        )}

        {activeTab === 'registry' && (
          <PassportRegistry
            currentPassport={passport}
            onSelectPassport={handleSelectFromRegistry}
            lang={lang}
          />
        )}

        {activeTab === 'standards' && (
          <StandardsDoc lang={lang} />
        )}
      </main>

      {/* Footer */}
      <Footer lang={lang} />
    </div>
  );
}

export default App;
