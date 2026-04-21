import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AssetSearch from './AssetSearch';
import AssetDetailPanel from './AssetDetailPanel';

const EMPTY_ASSET = { symbol: '', name: '', type: 'STOCK', quantity: '', buyPrice: '' };

function normalizeAsset(asset) {
  return {
    symbol: asset.symbol || '',
    name: asset.name || '',
    type: asset.type || 'STOCK',
    quantity: asset.quantity ?? '',
    buyPrice: asset.buyPrice ?? '',
  };
}

function PortfolioForm({
  initialPortfolio,
  submitting = false,
  error = '',
  onSubmit,
  onCancel,
}) {
  const MotionForm = motion.form;
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (initialPortfolio?.assets?.length) {
      setAssets(initialPortfolio.assets.map(normalizeAsset));
      setLocalError('');
      return;
    }

    setAssets([]);
    setLocalError('');
  }, [initialPortfolio]);

  const updateAsset = (index, field, value) => {
    setAssets((current) => current.map((asset, assetIndex) => (
      assetIndex === index ? { ...asset, [field]: value } : asset
    )));
  };

  const addAsset = () => {
    setAssets((current) => [...current, { ...EMPTY_ASSET }]);
  };

  const addSelectedAsset = (asset) => {
    setSelectedAsset(asset);
  };

  const removeAsset = (index) => {
    setAssets((current) => current.filter((_, assetIndex) => assetIndex !== index));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanedAssets = assets
      .map((asset) => ({
        symbol: String(asset.symbol || '').trim().toUpperCase(),
        name: String(asset.name || '').trim(),
        type: asset.type,
        quantity: asset.quantity === '' || asset.quantity == null ? NaN : Number(asset.quantity),
        buyPrice: asset.buyPrice === '' || asset.buyPrice == null ? NaN : Number(asset.buyPrice),
      }))
      .filter((asset) => asset.symbol || Number.isFinite(asset.quantity) || Number.isFinite(asset.buyPrice));

    const incompleteRows = cleanedAssets.filter((asset) => !asset.symbol || !Number.isFinite(asset.quantity) || asset.quantity <= 0 || !Number.isFinite(asset.buyPrice) || asset.buyPrice < 0);

    if (!cleanedAssets.length) {
      setLocalError('');
      onSubmit({
        assets: [],
        deletePortfolio: Boolean(initialPortfolio?._id),
      });
      return;
    }

    if (incompleteRows.length > 0) {
      setLocalError('Please complete or remove any rows with missing quantity or buy price.');
      return;
    }

    setLocalError('');
    onSubmit({
      assets: cleanedAssets,
      deletePortfolio: false,
    });
  };

  return (
    <MotionForm
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
    >
      <AssetSearch onSelect={addSelectedAsset} />
        <AssetDetailPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onAddToPortfolio={(asset) => {
            setAssets((current) => [
            ...current,
            {
              symbol: asset.symbol || '',
              name: asset.name || '',
              type: asset.type || 'STOCK',
              quantity: '',
              buyPrice: '',
            },
          ]);
          setSelectedAsset(null);
        }}
      />

      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Portfolio Builder</div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
          {initialPortfolio ? 'Edit portfolio' : 'Create portfolio'}
        </h2>
      </div>

      <div className="space-y-4">
        {assets.map((asset, index) => (
          <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5 md:grid-cols-[1.1fr_1.5fr_0.8fr_0.8fr_0.8fr_auto]">
            <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-300">
              Symbol
              <input
                value={asset.symbol}
                onChange={(event) => updateAsset(index, 'symbol', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                required
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-300">
              Name
              <input
                value={asset.name}
                onChange={(event) => updateAsset(index, 'name', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-300">
              Type
              <select
                value={asset.type}
                onChange={(event) => updateAsset(index, 'type', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
              >
                <option value="STOCK">Stock</option>
                <option value="ETF">ETF</option>
                <option value="MF">Mutual Fund</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-300">
              Quantity
              <input
                type="number"
                min="0"
                step="1"
                value={asset.quantity}
                onChange={(event) => updateAsset(index, 'quantity', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                required
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-300">
              Buy price
              <input
                type="number"
                min="0"
                step="0.01"
                value={asset.buyPrice}
                onChange={(event) => updateAsset(index, 'buyPrice', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                required
              />
            </label>

            <button
              type="button"
              onClick={() => removeAsset(index)}
              className="mt-auto rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={addAsset}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          Add asset
        </button>

        <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save portfolio'}
          </button>
        </div>
      </div>

      {localError || error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {localError || error}
        </div>
      ) : null}
    </MotionForm>
  );
}

export default PortfolioForm;
