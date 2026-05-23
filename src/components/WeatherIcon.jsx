import React from 'react';

/**
 * Premium, hand-crafted, high-contrast animated vector weather icons.
 * Replaces pixelated OpenWeatherMap icons with beautiful, responsive, and dynamic SVGs.
 *
 * @param {string} iconCode - OpenWeatherMap icon code (e.g., '01d', '02n', '04d')
 * @param {string} className - Additional CSS classes (e.g., width, height)
 * @param {boolean} showGlow - Enable outer drop shadow glow effect
 */
export const WeatherIcon = ({ iconCode = '01d', className = 'w-16 h-16', showGlow = true }) => {
  const isNight = iconCode.endsWith('n');
  const code = iconCode.substring(0, 2);

  const glowClass = showGlow ? 'filter drop-shadow-[0_8px_16px_rgba(15,23,42,0.12)] dark:drop-shadow-[0_10px_25px_rgba(56,189,248,0.2)]' : '';

  // Render SVG based on the weather icon code
  switch (code) {
    // 01: Clear Sky (Sun / Moon)
    case '01':
      if (isNight) {
        return (
          <svg className={`${className} ${glowClass} animate-float`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="moonGrad" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <filter id="moonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Stars */}
            <circle cx="16" cy="18" r="1.5" fill="#fef08a" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
            <circle cx="48" cy="16" r="1" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
            <circle cx="52" cy="36" r="1.5" fill="#fef08a" className="animate-pulse" style={{ animationDelay: '1.1s' }} />
            {/* Crescent Moon */}
            <path
              d="M44.5 38.5C44.5 47.6 37.1 55 28 55C22.2 55 17.1 52 14.1 47.5C21.6 47.5 27.6 41.5 27.6 34C27.6 28.5 24.3 23.8 19.5 21.6C24.5 15.5 32.1 13 39.5 16.5C36 19.5 33.8 24 33.8 29C33.8 38.1 38.5 38.5 44.5 38.5Z"
              fill="url(#moonGrad)"
              filter="url(#moonGlow)"
            />
          </svg>
        );
      }
      return (
        <svg className={`${className} ${glowClass}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sunGrad" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Glowing Aura */}
          <circle cx="32" cy="32" r="14" fill="#fef08a" opacity="0.15" className="animate-ping" style={{ animationDuration: '3s' }} />
          {/* Sun Rays */}
          <g className="animate-spin-slow origin-center" style={{ animationDuration: '20s' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1="32"
                y1="8"
                x2="32"
                y2="14"
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeLinecap="round"
                transform={`rotate(${i * 45} 32 32)`}
              />
            ))}
          </g>
          {/* Main Sun Body */}
          <circle cx="32" cy="32" r="14" fill="url(#sunGrad)" filter="url(#sunGlow)" />
        </svg>
      );

    // 02: Few Clouds (Sun/Moon with a floating cloud)
    case '02':
      return (
        <svg className={`${className} ${glowClass} animate-float`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sunBackGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="fewCloudGrad" x1="16" y1="24" x2="48" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
          {/* Background Sun or Moon */}
          {!isNight ? (
            <circle cx="26" cy="26" r="11" fill="url(#sunBackGrad)" className="animate-pulse-gentle" />
          ) : (
            <path
              d="M32 18C32 23 28.5 27 24 27C20.5 27 17.5 25 15.5 22C19.5 22 22.5 19 22.5 15C22.5 12 21 9.5 18.5 8C22.5 7.5 28 10 32 18Z"
              fill="#cbd5e1"
            />
          )}
          {/* Front Cloud */}
          <path
            d="M46 32C46 27.58 42.42 24 38 24C37.29 24 36.6 24.1 35.94 24.28C34.25 21.09 30.89 19 27 19C21.84 19 17.58 22.84 16.97 27.84C16.33 27.59 15.65 27.45 14.93 27.45C11.1 27.45 8 30.55 8 34.38C8 38.21 11.1 41.31 14.93 41.31H44.97C47.74 41.31 50 39.05 50 36.28C50 33.78 48.21 32.32 46 32Z"
            fill="url(#fewCloudGrad)"
            stroke="#cbd5e1"
            strokeWidth="0.5"
            transform="translate(4, 8)"
          />
        </svg>
      );

    // 03: Scattered Clouds (Standard fluffy single cloud)
    case '03':
      return (
        <svg className={`${className} ${glowClass} animate-float`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudGrad" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          <path
            d="M48 30C48 24.48 43.52 20 38 20C37.11 20 36.25 20.12 35.43 20.35C33.31 16.36 29.11 13.75 24.25 13.75C17.8 13.75 12.47 18.55 11.71 24.8C10.91 24.49 10.05 24.31 9.15 24.31C4.37 24.31 0.5 28.18 0.5 32.96C0.5 37.74 4.37 41.61 9.15 41.61H46.71C50.18 41.61 53 38.79 53 35.32C53 32.2 50.77 30.38 48 30Z"
            fill="url(#cloudGrad)"
            stroke="#cbd5e1"
            strokeWidth="0.5"
            transform="translate(5, 7)"
          />
        </svg>
      );

    // 04: Broken / Overcast Clouds (Multiple overlapping darker clouds for full overcast)
    case '04':
      return (
        <svg className={`${className} ${glowClass}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudBackGrad" x1="12" y1="12" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="cloudFrontGrad" x1="16" y1="20" x2="48" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          {/* Back Dark Cloud */}
          <path
            d="M38 24C38 19.58 34.42 16 30 16C29.29 16 28.6 16.1 27.94 16.28C26.25 13.09 22.89 11 19 11C13.84 11 9.58 14.84 8.97 19.84C8.33 19.59 7.65 19.45 6.93 19.45C3.1 19.45 0 22.55 0 26.38C0 30.21 3.1 33.31 6.93 33.31H36.97C39.74 33.31 42 31.05 42 28.28C42 25.78 40.21 24.32 38 24Z"
            fill="url(#cloudBackGrad)"
            className="animate-float"
            style={{ animationDuration: '4s' }}
            transform="translate(14, 6)"
          />
          {/* Front Fluffy Overcast Cloud */}
          <path
            d="M44 28C44 23.03 39.97 19 35 19C34.2 19 33.42 19.11 32.68 19.31C30.78 15.72 27 13.38 22.62 13.38C16.82 13.38 12.02 17.7 11.34 23.32C10.62 23.04 9.85 22.88 9.04 22.88C4.74 22.88 1.25 26.37 1.25 30.67C1.25 34.97 4.74 38.46 9.04 38.46H42.84C45.96 38.46 48.5 35.92 48.5 32.8C48.5 29.99 46.49 28.35 44 28Z"
            fill="url(#cloudFrontGrad)"
            stroke="#94a3b8"
            strokeWidth="0.5"
            className="animate-float"
            style={{ animationDuration: '3s', animationDelay: '0.2s' }}
            transform="translate(4, 11)"
          />
        </svg>
      );

    // 09: Shower Rain / Drizzle (Drizzle cloud with dropping rain lines)
    case '09':
      return (
        <svg className={`${className} ${glowClass}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rainCloudGrad" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
          {/* Rainy Cloud */}
          <path
            d="M44 28C44 23.03 39.97 19 35 19C34.2 19 33.42 19.11 32.68 19.31C30.78 15.72 27 13.38 22.62 13.38C16.82 13.38 12.02 17.7 11.34 23.32C10.62 23.04 9.85 22.88 9.04 22.88C4.74 22.88 1.25 26.37 1.25 30.67C1.25 34.97 4.74 38.46 9.04 38.46H42.84C45.96 38.46 48.5 35.92 48.5 32.8C48.5 29.99 46.49 28.35 44 28Z"
            fill="url(#rainCloudGrad)"
            className="animate-float"
            transform="translate(8, 6)"
          />
          {/* Rain Drops */}
          <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse">
            <line x1="22" y1="46" x2="19" y2="52" className="animate-bounce" style={{ animationDuration: '0.9s' }} />
            <line x1="32" y1="46" x2="29" y2="52" className="animate-bounce" style={{ animationDuration: '0.7s', animationDelay: '0.2s' }} />
            <line x1="42" y1="46" x2="39" y2="52" className="animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.4s' }} />
          </g>
        </svg>
      );

    // 10: Heavy Rain / Sun showers (Sun/Moon, clouds and heavy animated drops)
    case '10':
      return (
        <svg className={`${className} ${glowClass}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="heavyRainCloud" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* Peeking Sun if Day */}
          {!isNight && (
            <circle cx="22" cy="20" r="8" fill="#fbbf24" className="animate-pulse-gentle" />
          )}
          {/* Cloud */}
          <path
            d="M44 28C44 23.03 39.97 19 35 19C34.2 19 33.42 19.11 32.68 19.31C30.78 15.72 27 13.38 22.62 13.38C16.82 13.38 12.02 17.7 11.34 23.32C10.62 23.04 9.85 22.88 9.04 22.88C4.74 22.88 1.25 26.37 1.25 30.67C1.25 34.97 4.74 38.46 9.04 38.46H42.84C45.96 38.46 48.5 35.92 48.5 32.8C48.5 29.99 46.49 28.35 44 28Z"
            fill="url(#heavyRainCloud)"
            className="animate-float"
            transform="translate(8, 6)"
          />
          {/* Rain Drops */}
          <g stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round">
            <line x1="20" y1="46" x2="16" y2="54" className="animate-pulse" style={{ animationDuration: '0.6s' }} />
            <line x1="28" y1="46" x2="24" y2="54" className="animate-pulse" style={{ animationDuration: '0.8s', animationDelay: '0.1s' }} />
            <line x1="36" y1="46" x2="32" y2="54" className="animate-pulse" style={{ animationDuration: '0.7s', animationDelay: '0.3s' }} />
            <line x1="44" y1="46" x2="40" y2="54" className="animate-pulse" style={{ animationDuration: '0.9s', animationDelay: '0.2s' }} />
          </g>
        </svg>
      );

    // 11: Thunderstorm (Dark cloud + lightning bolt + heavy rain)
    case '11':
      return (
        <svg className={`${className} ${glowClass}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="stormCloud" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="lightningGrad" x1="24" y1="36" x2="36" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          {/* Cloud */}
          <path
            d="M44 28C44 23.03 39.97 19 35 19C34.2 19 33.42 19.11 32.68 19.31C30.78 15.72 27 13.38 22.62 13.38C16.82 13.38 12.02 17.7 11.34 23.32C10.62 23.04 9.85 22.88 9.04 22.88C4.74 22.88 1.25 26.37 1.25 30.67C1.25 34.97 4.74 38.46 9.04 38.46H42.84C45.96 38.46 48.5 35.92 48.5 32.8C48.5 29.99 46.49 28.35 44 28Z"
            fill="url(#stormCloud)"
            className="animate-float"
            transform="translate(8, 4)"
          />
          {/* Falling Storm Rain */}
          <g stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" opacity="0.6">
            <line x1="20" y1="44" x2="17" y2="50" className="animate-pulse" style={{ animationDuration: '0.5s' }} />
            <line x1="42" y1="44" x2="39" y2="50" className="animate-pulse" style={{ animationDuration: '0.6s', animationDelay: '0.2s' }} />
          </g>
          {/* Flashing Lightning Bolt */}
          <path
            d="M32 38L24 48H31L28 58L40 46H32L35 38Z"
            fill="url(#lightningGrad)"
            className="animate-pulse"
            style={{ animationDuration: '1.2s' }}
          />
        </svg>
      );

    // 13: Snow (Light blue/white cloud with spinning snowflakes)
    case '13':
      return (
        <svg className={`${className} ${glowClass}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="snowCloud" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>
          {/* Cloud */}
          <path
            d="M44 28C44 23.03 39.97 19 35 19C34.2 19 33.42 19.11 32.68 19.31C30.78 15.72 27 13.38 22.62 13.38C16.82 13.38 12.02 17.7 11.34 23.32C10.62 23.04 9.85 22.88 9.04 22.88C4.74 22.88 1.25 26.37 1.25 30.67C1.25 34.97 4.74 38.46 9.04 38.46H42.84C45.96 38.46 48.5 35.92 48.5 32.8C48.5 29.99 46.49 28.35 44 28Z"
            fill="url(#snowCloud)"
            stroke="#bae6fd"
            strokeWidth="0.5"
            className="animate-float"
            transform="translate(8, 6)"
          />
          {/* Snowflake Dots */}
          <g fill="#38bdf8">
            <circle cx="20" cy="46" r="2" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="32" cy="48" r="2.5" className="animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
            <circle cx="44" cy="46" r="2" className="animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.6s' }} />
          </g>
        </svg>
      );

    // 50: Mist / Fog / Haze (Flowing layered mist lines)
    case '50':
      return (
        <svg className={`${className} ${glowClass}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mistLine" x1="12" y1="0" x2="52" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <g stroke="url(#mistLine)" strokeWidth="3" strokeLinecap="round">
            {/* Wavy Horizontal Lines drifting horizontally */}
            <path d="M12 20H52" className="animate-pulse" style={{ animationDuration: '3s' }} />
            <path d="M18 28H46" className="animate-pulse" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
            <path d="M14 36H50" className="animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.2s' }} />
            <path d="M22 44H42" className="animate-pulse" style={{ animationDuration: '2.8s', animationDelay: '0.8s' }} />
          </g>
        </svg>
      );

    default:
      return (
        <svg className={`${className} ${glowClass}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="16" fill="#f59e0b" />
        </svg>
      );
  }
};

export default WeatherIcon;
