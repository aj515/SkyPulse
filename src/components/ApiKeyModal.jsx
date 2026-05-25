import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { useWeatherContext } from '../context/WeatherContext';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import KeyIcon from '@mui/icons-material/Key';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import LoadingIcon from '@mui/icons-material/Autorenew';

export default function ApiKeyModal({ open, onClose }) {
  const { t } = useTranslation();
  const { customApiKey, setCustomApiKey, effectiveApiKey, isDemoKey } = useSettings();
  const { fetchWeather, city } = useWeatherContext();

  const [inputValue, setInputValue] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null); // 'valid' | 'invalid' | null
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state with settings custom key
  useEffect(() => {
    if (open) {
      setInputValue(customApiKey);
      setStatus(null);
      setErrorMessage('');
    }
  }, [open, customApiKey]);

  if (!open) return null;

  const handleValidateAndSave = async (e) => {
    e.preventDefault();
    const keyToTest = inputValue.trim();

    if (!keyToTest) {
      // User is clearing the custom key, revert to environment key
      setCustomApiKey('');
      setStatus(null);
      onClose();
      // Refetch with the reverted default key
      if (city) {
        fetchWeather(city.lat, city.lon, city);
      }
      return;
    }

    setTesting(true);
    setStatus(null);
    setErrorMessage('');

    try {
      // Ping OpenWeatherMap standard weather endpoint with the new key to validate it
      const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${keyToTest}`;
      await axios.get(testUrl);

      // Succeeded! Key is valid
      setCustomApiKey(keyToTest);
      setStatus('valid');
      setTesting(false);

      // Automatically trigger a refetch of the dashboard weather using the new valid key
      if (city) {
        fetchWeather(city.lat, city.lon, city);
      }

      // Close modal after a short delay to show success animation
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setTesting(false);
      setStatus('invalid');
      
      const responseStatus = error.response?.status;
      if (responseStatus === 401) {
        setErrorMessage(t('key_invalid'));
      } else {
        setErrorMessage(error.message || 'Unable to connect to OpenWeatherMap servers.');
      }
    }
  };

  // Determine active key source label
  const isCurrentlyDemo = isDemoKey(effectiveApiKey);
  const activeSourceLabel = isCurrentlyDemo
    ? t('demo_mode_active')
    : customApiKey
    ? t('key_source_user')
    : t('key_source_env');

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-md z-50 transition-all duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md z-[60] animate-fade-in-up">
        <div className="glass-card-static !rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800/80 p-5 md:p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/40 dark:border-slate-800/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-md shadow-sky-500/10 shrink-0">
                <KeyIcon style={{ fontSize: 18 }} className="text-white" />
              </div>
              <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white leading-none">
                {t('api_key_manager')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          {/* Current Status */}
          <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800/30 text-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">{t('current_active_key')}</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase
                ${isCurrentlyDemo 
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/30 dark:border-amber-900/20'
                  : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-900/20'
                }`}>
                {activeSourceLabel}
              </span>
            </div>
            
            {effectiveApiKey && !isCurrentlyDemo && (
              <div className="font-mono text-slate-500 dark:text-slate-400 truncate bg-slate-100/60 dark:bg-slate-800/20 px-2 py-1 rounded select-all mt-1">
                {effectiveApiKey.slice(0, 8)}••••••••••••••••••••{effectiveApiKey.slice(-8)}
              </div>
            )}
            
            {isCurrentlyDemo && (
              <p className="text-slate-400 dark:text-slate-500 mt-1 flex gap-1.5 items-start">
                <InfoIcon style={{ fontSize: 14 }} className="text-amber-500 shrink-0 mt-0.5" />
                <span>{t('demo_mode_desc')}</span>
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleValidateAndSave} className="space-y-4">
            <div>
              <label htmlFor="api-key-input" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                {t('api_key_label')}
              </label>
              <div className="relative">
                <input
                  id="api-key-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setStatus(null);
                    setErrorMessage('');
                  }}
                  disabled={testing}
                  placeholder={t('api_key_placeholder')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl font-mono
                    bg-white/60 dark:bg-slate-900/40
                    border border-slate-200 dark:border-slate-850
                    text-slate-700 dark:text-slate-200
                    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500
                    transition-all duration-200 select-all"
                />
              </div>
            </div>

            {/* Validation Feedback */}
            {testing && (
              <div className="flex items-center gap-2 text-xs text-sky-500 font-semibold animate-pulse-gentle">
                <LoadingIcon className="animate-spin" style={{ fontSize: 16 }} />
                <span>{t('testing_key')}</span>
              </div>
            )}

            {status === 'valid' && (
              <div className="flex items-center gap-2 text-xs text-emerald-500 dark:text-emerald-400 font-semibold">
                <CheckCircleIcon style={{ fontSize: 16 }} />
                <span>{t('key_valid')}</span>
              </div>
            )}

            {status === 'invalid' && (
              <div className="flex items-start gap-2 text-xs text-rose-500 dark:text-rose-400 font-semibold p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200/20 dark:border-rose-900/20">
                <ErrorIcon className="shrink-0 mt-0.5" style={{ fontSize: 16 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={testing}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                  border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300
                  hover:bg-slate-50 dark:hover:bg-slate-800/40 active:scale-98 transition-all duration-150"
              >
                Close
              </button>
              
              <button
                type="submit"
                disabled={testing}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white gradient-primary
                  hover:shadow-lg hover:shadow-sky-500/20 active:scale-98 transition-all duration-150 disabled:opacity-50"
              >
                {t('validate_save')}
              </button>
            </div>
          </form>

          {/* Help Link */}
          <div className="text-center mt-5 text-[11px]">
            <a
              href="https://home.openweathermap.org/api_keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 font-semibold hover:underline"
            >
              {t('key_help')} →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
