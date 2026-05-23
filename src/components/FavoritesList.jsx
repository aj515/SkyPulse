import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { useWeatherContext } from '../context/WeatherContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';

export default function FavoritesList({ open, onClose }) {
  const { t } = useTranslation();
  const { favorites, removeFavorite } = useSettings();
  const { fetchWeather, city } = useWeatherContext();

  const handleSelectCity = (fav) => {
    fetchWeather(fav.lat, fav.lon, fav);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
          shadow-2xl border-l border-slate-200/40 dark:border-slate-700/30
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/40 dark:border-slate-700/30">
          <div className="flex items-center gap-2">
            <FavoriteIcon style={{ fontSize: 20 }} className="text-rose-500" />
            <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white">
              {t('favorites')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <CloseIcon style={{ fontSize: 20 }} className="text-slate-400" />
          </button>
        </div>

        {/* List */}
        <div className="p-3 overflow-y-auto" style={{ height: 'calc(100% - 65px)' }}>
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FavoriteIcon style={{ fontSize: 40 }} className="text-slate-200 dark:text-slate-750 mb-3" />
              <p className="text-sm text-slate-400 dark:text-slate-400 font-semibold">{t('no_favorites')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((fav, i) => {
                const isActive = city?.lat === fav.lat && city?.lon === fav.lon;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer
                      transition-all duration-200
                      ${isActive
                        ? 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200/40 dark:border-sky-700/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'}`}
                    onClick={() => handleSelectCity(fav)}
                  >
                    <PlaceIcon
                      style={{ fontSize: 18 }}
                      className={isActive ? 'text-sky-500' : 'text-slate-300 dark:text-slate-500'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {fav.name}
                      </p>
                      {fav.country && (
                        <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">{fav.country}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(fav);
                      }}
                      className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <DeleteIcon style={{ fontSize: 16 }} className="text-slate-300 dark:text-slate-600 hover:text-rose-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
