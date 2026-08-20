import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import {
  Download,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Smartphone,
  CheckCircle2,
  Info,
  X,
  HardDrive,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface PWAHeaderBarProps {
  lang: 'ar' | 'en';
}

export const PWAHeaderBar: React.FC<PWAHeaderBarProps> = ({ lang }) => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    notificationPermission,
    isIOS,
    promptInstall,
    requestNotificationPermission,
    sendTestNotification
  } = usePWA();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [notificationSending, setNotificationSending] = useState(false);

  const handleTestNotificationClick = async () => {
    if (notificationPermission !== 'granted') {
      await requestNotificationPermission();
    } else {
      setNotificationSending(true);
      sendTestNotification(
        lang === 'ar' ? 'فحص جاهزية التطبيق 🚀' : 'App Status Check 🚀',
        lang === 'ar'
          ? 'نظام الجوازات والقراءة الآلية جاهز للعمل بدون إنترنت وبأداء سريع!'
          : 'ICAO Passport System is fully working offline with high performance!'
      );
      setTimeout(() => setNotificationSending(false), 1500);
    }
  };

  return (
    <>
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Connection Status Pill & Storage Info */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                isOnline
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-600/50 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'ar' ? 'متصل بالإنترنت' : 'Online'}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'ar' ? 'غير متصل (وضع الأوفلاين)' : 'Offline Mode'}</span>
                </>
              )}
            </div>

            <span className="hidden sm:flex items-center gap-1 text-slate-400 text-[11px]">
              <HardDrive className="w-3 h-3 text-slate-400" />
              <span>{lang === 'ar' ? 'التخزين المحلي نشط' : 'Local Storage Active'}</span>
            </span>
          </div>

          {/* Quick PWA Actions: Install, Notifications, Info */}
          <div className="flex items-center gap-2">
            {/* Install Button */}
            {!isInstalled ? (
              <button
                type="button"
                onClick={promptInstall}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-md hover:shadow-amber-500/20 transition-all text-[11px]"
                title={lang === 'ar' ? 'تثبيت التطبيق على جهازك' : 'Install App'}
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'ar' ? 'تثبيت التطبيق (PWA)' : 'Install App (PWA)'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'ar' ? 'تطبيق مثبت' : 'App Installed'}</span>
              </div>
            )}

            {/* Notification Button */}
            <button
              type="button"
              onClick={handleTestNotificationClick}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                notificationPermission === 'granted'
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title={lang === 'ar' ? 'تفعيل وتجربة الإشعارات' : 'Notifications'}
            >
              {notificationPermission === 'granted' ? (
                <Bell className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <BellOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden xs:inline">
                {notificationPermission === 'granted'
                  ? lang === 'ar' ? 'تجرِبة التنبيه' : 'Test Alert'
                  : lang === 'ar' ? 'تفعيل الإشعارات' : 'Enable Alerts'}
              </span>
            </button>

            {/* Info Drawer Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
              title={lang === 'ar' ? 'معلومات تطبيق الويب التقدمي' : 'PWA Information'}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* PWA Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {lang === 'ar' ? 'تطبيق الويب التقدمي (PWA)' : 'Progressive Web App (PWA)'}
                  <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold">
                    Ready
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'تجربة تطبيق أصلي متكاملة مباشرة من متصفحك' : 'Native App Experience directly from browser'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-6">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold mb-0.5">
                    {lang === 'ar' ? 'التثبيت المباشر:' : 'Direct Installation:'}
                  </strong>
                  <span>
                    {lang === 'ar'
                      ? 'يمكنك تثبيت هذا التطبيق على الشاشة الرئيسية لهاتفك المحمول أو كمبيوتر سطح المكتب ليعمل بشكل مستقل وبدون أشرطة المتصفح.'
                      : 'You can install this app directly on your phone or desktop home screen as a standalone application.'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-start gap-2.5">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold mb-0.5">
                    {lang === 'ar' ? 'العمل بدون إنترنت (الأوفلاين):' : 'Offline Support:'}
                  </strong>
                  <span>
                    {lang === 'ar'
                      ? 'يتم تخزين كافة الأدوات، معاينة الجوازات، توليد أكواد الـ MRZ والباركود PDF417 محلياً لتستمر بالعمل حتى عند انقطاع الإنترنت.'
                      : 'All tools, MRZ generation, passport preview, and PDF417 barcodes are stored locally for full offline functionality.'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold mb-0.5">
                    {lang === 'ar' ? 'إشعارات Push وتنبيهات المستندات:' : 'Push Notifications:'}
                  </strong>
                  <span>
                    {lang === 'ar'
                      ? 'تلقي تنبيهات فورية لمتابعة صلاحية الجوازات، عمليات المسح الذكي وحفظ سجل الوثائق.'
                      : 'Receive instant notifications for document expiration, registry saves, and scan updates.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              {!isInstalled ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowInfoModal(false);
                    promptInstall();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center gap-2 transition-colors text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تثبيت التطبيق الآن' : 'Install App Now'}</span>
                </button>
              ) : (
                <div className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 font-bold flex items-center justify-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'ar' ? 'التطبيق مثبت بنجاح على الجهاز' : 'App Installed Successfully'}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors text-xs"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
