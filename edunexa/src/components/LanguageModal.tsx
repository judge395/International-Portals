import { motion, AnimatePresence } from 'motion/react';
import { Globe, ArrowRight } from 'lucide-react';
import type { Language } from '../types';
import { uiCopy } from '../i18n/translations';

interface LanguageModalProps {
  isOpen: boolean;
  onSelectLanguage: (lang: Language) => void;
}

export function LanguageModal({ isOpen, onSelectLanguage }: LanguageModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-[#081B4B] px-7 py-6 text-white">
              <div className="flex items-center gap-2.5 text-amber-400 text-xs font-semibold tracking-wider mb-2">
                <Globe className="w-4 h-4" />
                <span>{uiCopy.en.brand} · {uiCopy.en.langPopup.eyebrow}</span>
              </div>
              <h2 id="lang-modal-title" className="text-2xl font-bold tracking-tight text-white">
                {uiCopy.en.langPopup.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                {uiCopy.bn.langPopup.title} — {uiCopy.en.langPopup.subtitle}
              </p>
            </div>

            <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50">
              <button
                type="button"
                onClick={() => onSelectLanguage('en')}
                className="group text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-[#081B4B] hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#081B4B]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold text-[#081B4B] tracking-wide">
                    EN · ENGLISH
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#081B4B] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xl font-bold text-slate-900 mb-1">
                  {uiCopy.en.langPopup.enTitle}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {uiCopy.en.langPopup.enDesc}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectLanguage('bn')}
                className="group text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-600 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold text-amber-700 tracking-wide">
                    BN · বাংলা
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xl font-bold text-slate-900 mb-1">
                  {uiCopy.bn.langPopup.bnTitle}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {uiCopy.bn.langPopup.bnDesc}
                </p>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
