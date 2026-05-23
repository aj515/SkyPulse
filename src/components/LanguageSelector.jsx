import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { LANGUAGES } from '../utils/constants';
import TranslateIcon from '@mui/icons-material/Translate';

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        id="language-selector"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg flex items-center gap-1
          hover:bg-sky-100/60 dark:hover:bg-sky-900/20
          text-slate-500 dark:text-slate-400
          transition-all duration-200"
        title={t('language')}
      >
        <TranslateIcon style={{ fontSize: 20 }} />
        <span className="hidden md:inline text-xs font-medium">{currentLang.flag}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44
          bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
          border border-slate-200/60 dark:border-slate-700/40
          rounded-xl shadow-xl overflow-hidden z-50
          animate-fade-in">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full px-3 py-2.5 text-left flex items-center gap-2.5
                hover:bg-sky-50/60 dark:hover:bg-sky-900/20 transition-colors text-sm
                ${language === lang.code ? 'bg-sky-50/80 dark:bg-sky-900/30 font-semibold' : ''}`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="text-slate-700 dark:text-slate-200">{lang.label}</span>
              {language === lang.code && (
                <span className="ml-auto w-2 h-2 rounded-full bg-sky-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
