import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const navbarRef = useRef(null);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav ref={navbarRef} className="fixed left-0 top-0 z-30 w-full border-b border-white/45 bg-white/68 px-3 py-2 backdrop-blur-2xl sm:px-4 sm:py-3 dark:border-white/10 dark:bg-slate-950/35">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-1.5 md:flex-row md:items-center md:justify-between md:gap-2">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Link to="/portfolio" className="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              NOVA AI
            </Link>
            <div className="hidden rounded-full border border-white/60 bg-white/72 px-2.5 py-1 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:block">
              Financial Copilot
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 text-slate-700 shadow-sm transition hover:bg-white md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        {user ? (
          <>
            <div className="hidden flex-wrap items-center gap-2 md:flex">
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
                  navigate('/login');
                }}
                className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Logout
              </button>

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

            <div
              id="mobile-nav-menu"
              className={`md:hidden overflow-hidden transition-all duration-200 ${mobileMenuOpen ? 'max-h-[26rem] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="mt-2 rounded-2xl border border-white/55 bg-white/86 p-3 shadow-[0_18px_40px_rgba(148,163,184,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
                <div className="mb-3 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user.username || user.email}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">OpenRouter connected</div>
                </div>

                <div className="grid gap-2">
                  <Link
                    to="/portfolio"
                    className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition ${isActive('/portfolio') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white/70 text-slate-700 hover:bg-white dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'}`}
                  >
                    <span>Portfolio</span>
                    <span className="text-xs opacity-70">Open</span>
                  </Link>
                  <Link
                    to="/chat"
                    className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition ${isActive('/chat') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white/70 text-slate-700 hover:bg-white dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'}`}
                  >
                    <span>Chat</span>
                    <span className="text-xs opacity-70">Open</span>
                  </Link>
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-white dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    aria-label={themeLabel}
                    title={themeLabel}
                  >
                    <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
                    <span className="text-xs opacity-70">{darkMode ? 'On' : 'Off'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="flex items-center justify-between rounded-xl bg-rose-500/10 px-3 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-500/15 dark:text-rose-300"
                  >
                    <span>Logout</span>
                    <span className="text-xs opacity-70">Exit</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="hidden flex-wrap items-center gap-2 md:flex">
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

            <div
              id="mobile-nav-menu"
              className={`md:hidden overflow-hidden transition-all duration-200 ${mobileMenuOpen ? 'max-h-[18rem] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="mt-2 rounded-2xl border border-white/55 bg-white/86 p-3 shadow-[0_18px_40px_rgba(148,163,184,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
                <div className="grid gap-2">
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-white dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    aria-label={themeLabel}
                    title={themeLabel}
                  >
                    <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
                    <span className="text-xs opacity-70">{darkMode ? 'On' : 'Off'}</span>
                  </button>
                  <Link
                    to="/login"
                    className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-3 text-sm font-semibold text-white transition hover:brightness-110 dark:bg-white dark:text-slate-900"
                  >
                    <span>Login</span>
                    <span className="text-xs opacity-80">Open</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
