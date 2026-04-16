import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getAssetHistory } from '../../lib/marketApi';
import { formatINR } from './formatters';

const RANGE_OPTIONS = [
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
];

function formatPrice(value) {
  if (!Number.isFinite(Number(value))) {
    return '-';
  }

  return formatINR(value);
}

function buildPath(points) {
  if (!points.length) {
    return '';
  }

  const values = points.map((point) => Number(point.close)).filter((value) => Number.isFinite(value));
  if (!values.length) {
    return '';
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 560;
  const height = 220;
  const padding = 18;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (usableWidth * index) / Math.max(values.length - 1, 1);
      const y = padding + (1 - (value - min) / Math.max(max - min, 1)) * usableHeight;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function AssetDetailPanel({ asset, onClose, onAddToPortfolio }) {
  const [range, setRange] = useState('1y');
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MotionPanel = motion.div;

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      if (!asset?.symbol) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await getAssetHistory(asset.symbol, { range });
        if (!active) {
          return;
        }

        setHistory(response);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError.message || 'Unable to load price history');
        setHistory(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [asset?.symbol, range]);

  const points = useMemo(() => history?.points || [], [history]);
  const path = useMemo(() => buildPath(points), [points]);
  const latest = points.at(-1);
  const first = points[0];
  const change = first && latest ? Number(latest.close) - Number(first.close) : 0;
  const changePercent = first && latest && Number(first.close) > 0 ? (change / Number(first.close)) * 100 : 0;
  const currentPrice = history?.meta?.currentPrice || latest?.close || asset?.currentPrice || 0;

  if (!asset) {
    return null;
  }

  return (
    <MotionPanel
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-950/80"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Asset preview</div>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {asset.symbol}
            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">{asset.name}</span>
          </h3>
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {asset.type} {asset.exchange ? `- ${asset.exchange}` : ''}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Current</div>
          <div className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{formatPrice(currentPrice)}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Change</div>
          <div className={`mt-1 text-xl font-semibold ${change >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
            {change >= 0 ? '+' : '-'}{formatPrice(Math.abs(change))}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Return</div>
          <div className={`mt-1 text-xl font-semibold ${changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
            {changePercent >= 0 ? '+' : '-'}{Math.abs(changePercent).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRange(option.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              range === option.value
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/60">
        {loading ? (
          <div className="flex h-56 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Loading chart...
          </div>
        ) : error ? (
          <div className="flex h-56 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : points.length && path ? (
          <svg viewBox="0 0 560 220" className="h-56 w-full">
            <defs>
              <linearGradient id="assetChartFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${path} L 542 202 L 18 202 Z`} fill="url(#assetChartFill)" />
            <path d={path} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            No chart data available.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Latest price</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">{formatPrice(currentPrice)}</div>
        </div>
        <button
          type="button"
          onClick={() => onAddToPortfolio(asset)}
          className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:brightness-105"
        >
          Add to portfolio
        </button>
      </div>
    </MotionPanel>
  );
}

export default AssetDetailPanel;
