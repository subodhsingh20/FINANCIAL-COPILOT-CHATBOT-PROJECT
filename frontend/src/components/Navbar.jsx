import React, { useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navbarRef = useRef(null);

  const isActive = (path) => location.pathname.startsWith(path);

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

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
            {user ? (
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
            ) : null}
          </div>
        </div>

        {user ? (
          <div className="flex flex-wrap items-center gap-2">
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
              <button
                onClick={toggleDarkMode}
                className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Toggle theme"
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <div className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
                {user.username || user.email}
              </div>
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
            </div>
          </div>
        ) : (
          <button
            onClick={toggleDarkMode}
            className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
