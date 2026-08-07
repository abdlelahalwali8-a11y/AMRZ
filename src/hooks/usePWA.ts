import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Detect standalone mode (App is already installed & open as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
          setSwRegistration(registration);
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    // Capture Install Prompt Event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Capture App Installed Event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('[PWA] App successfully installed!');
    };

    // Capture Network Connection Status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Trigger PWA Installation
  const promptInstall = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        alert(
          'لتثبيت التطبيق على جهاز iPhone/iPad:\n1. اضغط على زر "مشاركة" (Share) أسفل المتصفح.\n2. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
        );
      } else {
        alert('يمكنك تثبيت التطبيق مباشرة من خيارات المتصفح (إضافة إلى الشاشة الرئيسية).');
      }
      return false;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    } else {
      console.log('[PWA] User dismissed the install prompt');
      return false;
    }
  };

  // Request Notification Permissions
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('المتصفح الحالي لا يدعم الإشعارات في هذا الجهاز.');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        sendTestNotification(
          'تم تفعيل الإشعارات بنجاح! 🔔',
          'ستتلقى تنبيهات هامة بخصوص مراجعة الجوازات وصلاحية المستندات وعمليات الحفظ.'
        );
      }
      return permission;
    } catch (error) {
      console.error('[PWA] Notification permission error:', error);
      return 'denied';
    }
  };

  // Dispatch Local Notification
  const sendTestNotification = (title: string, body: string) => {
    if (notificationPermission !== 'granted') return;

    if (swRegistration && 'showNotification' in swRegistration) {
      swRegistration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        tag: 'icao-pwa-notification'
      } as any);
    } else if ('Notification' in window) {
      new Notification(title, {
        body,
        icon: '/icon-192.png'
      });
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    notificationPermission,
    isIOS,
    promptInstall,
    requestNotificationPermission,
    sendTestNotification
  };
}
