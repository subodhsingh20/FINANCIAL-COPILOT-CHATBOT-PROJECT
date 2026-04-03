import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <nav className="fixed left-0 top-0 z-30 w-full border-b border-white/45 bg-white/68 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/35">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            NexusAI
          </div>
          <div className="hidden rounded-full border border-white/60 bg-white/72 px-2.5 py-1 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 md:block">
            Gemini
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
          {user ? (
            <div className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
              {user.username || user.email}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
