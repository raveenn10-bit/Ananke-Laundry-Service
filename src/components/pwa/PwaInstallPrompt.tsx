'use client';

import { usePwa } from '@/context/PwaContext';
import { useLanguage } from '@/context/LanguageContext';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function PwaInstallPrompt() {
  const { t } = useLanguage();
  const {
    isInstallable,
    isInstalled,
    isIOS,
    installApp,
    showIOSPrompt,
    setShowIOSPrompt,
    isBannerDismissed,
    dismissBanner,
  } = usePwa();

  // If already running standalone or installed, don't show prompt
  if (isInstalled) return null;

  return (
    <>
      {/* Non-intrusive Floating App Install Banner for mobile / desktop browsers */}
      <AnimatePresence>
        {isInstallable && !isBannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-45 bg-[#163824]/95 text-white backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-white/20 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-white/10 border border-white/20 shadow-xs flex items-center justify-center">
                <Image
                  src="/icons/icon-192.png"
                  alt="Ananke App Icon"
                  width={44}
                  height={44}
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate font-heading tracking-wide">
                  {t('pwa.installTitle', 'Ananke Washing Plant')}
                </h4>
                <p className="text-[11px] sm:text-xs text-white/80 line-clamp-1">
                  {t('pwa.installDesc', '1-Click WhatsApp orders & instant bill receipts')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={installApp}
                className="bg-accent hover:bg-olive text-dark hover:text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>{t('pwa.installAction', 'Install')}</span>
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                aria-label="Dismiss install banner"
                className="p-1.5 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari Instruction Modal */}
      <AnimatePresence>
        {showIOSPrompt && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-cream text-dark w-full max-w-md rounded-3xl p-6 shadow-2xl border border-primary/20 relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setShowIOSPrompt(false)}
                className="absolute top-4 right-4 p-2 text-dark/60 hover:text-dark rounded-full bg-white/50 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md shrink-0 bg-primary">
                  <Image
                    src="/icons/apple-touch-icon.png"
                    alt="Ananke Logo"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-primary">
                    {t('pwa.iosTitle', 'Install Ananke Washing Plant')}
                  </h3>
                  <p className="text-xs text-dark/70">{t('pwa.iosDesc', 'Add to your iPhone / iPad Home Screen')}</p>
                </div>
              </div>

              <div className="space-y-3.5 my-5 text-sm">
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-dark/10 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Share size={18} />
                  </div>
                  <span className="text-dark/85">
                    {t('pwa.iosStep1', '1. Tap the Share button in Safari toolbar below.')}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-dark/10 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-primary shrink-0">
                    <PlusSquare size={18} />
                  </div>
                  <span className="text-dark/85">
                    {t('pwa.iosStep2', '2. Scroll down and tap "Add to Home Screen".')}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-dark/10 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                    <Smartphone size={18} />
                  </div>
                  <span className="text-dark/85">
                    {t('pwa.iosStep3', '3. Launch Ananke Washing Plant anytime with 1-tap from your home screen.')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSPrompt(false)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md"
              >
                {t('pwa.gotIt', 'Got It')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
