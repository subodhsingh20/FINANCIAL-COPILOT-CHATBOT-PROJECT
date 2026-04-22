import React, { useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { apiUrl } from '../lib/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const navbarRef = useRef(null);

  const isActive = (path) => location.pathname.startsWith(path);
  const themeLabel = darkMode ? 'Switch to light mode' : 'Switch to dark mode';

  useEffect(() => {
    const nav = navbarRef.current;
    if (!nav || typeof window === 'undefined') {
      return undefined;
    }

    const root = document.documentElement;
    const updateHeight = () => {
      root.style.setProperty('--app-nav-height', `${nav.offsetHeight}px`);
    };

    updateHeight();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateHeight) : null;
    observer?.observe(nav);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <nav ref={navbarRef} className="fixed left-0 top-0 z-30 w-full border-b border-white/45 bg-white/68 px-3 py-2.5 backdrop-blur-2xl sm:px-4 sm:py-3 dark:border-white/10 dark:bg-slate-950/35">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/portfolio" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              NOVA AI
            </Link>
            <div className="hidden rounded-full border border-white/60 bg-white/72 px-2.5 py-1 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:block">
              Financial Copilot
            </div>
          </div>
        </div>

        {user ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label={themeLabel}
              title={themeLabel}
            >
              {darkMode ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <path d="M12 3v2.25" />
                  <path d="M12 18.75V21" />
                  <path d="M4.5 12H6.75" />
                  <path d="M17.25 12H19.5" />
                  <path d="M5.64 5.64l1.59 1.59" />
                  <path d="M16.77 16.77l1.59 1.59" />
                  <path d="M5.64 18.36l1.59-1.59" />
                  <path d="M16.77 7.23l1.59-1.59" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 7.2 7.2 0 0 0 21 12.8Z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                window.location.assign(apiUrl('/appid/logout'));
              }}
              className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Logout
            </button>

            <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
              <Link
                to="/portfolio"
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${isActive('/portfolio') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/5'}`}
              >
                Portfolio
              </Link>
              <Link
                to="/chat"
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${isActive('/chat') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/5'}`}
              >
                Chat
              </Link>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/portfolio"
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${isActive('/portfolio') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/5'}`}
              >
                Portfolio
              </Link>
              <Link
                to="/chat"
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${isActive('/chat') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/5'}`}
              >
                Chat
              </Link>
              <div className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
                {user.username || user.email}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label={themeLabel}
              title={themeLabel}
            >
              {darkMode ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <path d="M12 3v2.25" />
                  <path d="M12 18.75V21" />
                  <path d="M4.5 12H6.75" />
                  <path d="M17.25 12H19.5" />
                  <path d="M5.64 5.64l1.59 1.59" />
                  <path d="M16.77 16.77l1.59 1.59" />
                  <path d="M5.64 18.36l1.59-1.59" />
                  <path d="M16.77 7.23l1.59-1.59" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 7.2 7.2 0 0 0 21 12.8Z" />
                </svg>
              )}
            </button>

            <Link
              to="/login"
              className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
