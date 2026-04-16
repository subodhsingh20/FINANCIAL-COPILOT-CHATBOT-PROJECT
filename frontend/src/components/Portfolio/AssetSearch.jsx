import React, { useEffect, useMemo, useState } from 'react';
import { searchMarketAssets } from '../../lib/marketApi';
import { formatINR } from './formatters';

function AssetSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const run = async () => {
      if (!trimmedQuery || trimmedQuery.length < 2) {
        setResults([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await searchMarketAssets(trimmedQuery, { signal: controller.signal });
        if (!isActive) {
          return;
        }

        setResults(response.results || []);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(requestError.message || 'Search failed');
        setResults([]);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(run, 250);

    return () => {
      isActive = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmedQuery]);

  return (
    <div className="space-y-3 rounded-3xl border border-white/70 bg-white/85 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Search asset</div>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          Search stocks, ETFs, or mutual funds
        </h3>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
        placeholder="Search by name or symbol"
      />

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          Searching live market data...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {results.length ? (
        <div className="grid gap-3">
          {results.map((item) => (
            <button
              type="button"
              key={`${item.symbol}-${item.source}`}
              onClick={() => {
                onSelect(item);
                setQuery('');
                setResults([]);
              }}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {item.symbol}
                  <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                    {item.name}
                  </span>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {item.type} {item.exchange ? `- ${item.exchange}` : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.currentPrice ? formatINR(item.currentPrice) : 'Live'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {item.changePercent ? `${Number(item.changePercent).toFixed(2)}%` : item.marketState || item.source}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default AssetSearch;
