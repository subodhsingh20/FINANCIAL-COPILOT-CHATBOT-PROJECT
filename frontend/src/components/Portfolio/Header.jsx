import React from 'react';

function formatSourceLabel(source) {
  const normalized = String(source || '').trim().toLowerCase();

  if (!normalized || normalized === 'demo') {
    return 'Live Data: Demo';
  }

  if (normalized === 'nse-api-ruby') {
    return 'Live Data: NSE API Ruby';
  }

  if (normalized === 'nse-api-ruby-fallback') {
    return 'Live Data: NSE API Ruby Fallback';
  }

  if (normalized === 'alpha-vantage') {
    return 'Live Data: Alpha Vantage';
  }

  if (normalized === 'yahoo-finance') {
    return 'Live Data: Yahoo Finance';
  }

  if (normalized === 'fallback-buy-price') {
    return 'Live Data: Buy Price Fallback';
  }

  return `Live Data: ${source}`;
}

function Header({ title, subtitle, sourceLabel, aiLabel, onRefresh, onEdit, onDelete }) {
  const displaySource = formatSourceLabel(sourceLabel);
  const displayAi = aiLabel || 'Fallback';

  return (
    <section className="rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(226,232,240,0.72))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(15,23,42,0.72))] sm:p-6 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-[0.7rem] uppercase tracking-[0.45em] text-slate-500 dark:text-slate-400">
              Portfolio Dashboard
            </div>
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
              INR
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {displaySource}
            </span>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
              Analysis: {displayAi}
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
            {subtitle}
          </p>
          <div className="mt-4 inline-flex rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            Demo holdings shown in rupees, with live analysis across Indian tickers.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            Refresh analysis
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Edit portfolio
          </button>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"
            >
              Delete portfolio
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default Header;
