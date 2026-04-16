import React from 'react';
import { motion } from 'framer-motion';
import AllocationChart from './AllocationChart';
import AIInsights from './AIInsights';
import Header from './Header';
import Overview from './Overview';
import RiskAnalysis from './RiskAnalysis';
import { formatINR } from './formatters';

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-[1.75rem] bg-slate-200/70 dark:bg-white/10 ${className}`} />;
}

function PortfolioDashboard({
  portfolio,
  analysis,
  loading = false,
  error = '',
  onEdit,
  onRefresh,
}) {
  const MotionPanel = motion.div;

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <SkeletonBlock className="h-[28rem]" />
          <SkeletonBlock className="h-[28rem]" />
        </div>
      </div>
    );
  }

  if (error && !portfolio) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
        <div className="text-lg font-semibold">We could not load the portfolio</div>
        <div className="mt-2 text-sm">{error}</div>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  const title = portfolio?.userId ? `NexusAI Portfolio Dashboard` : 'NexusAI Portfolio Dashboard';
  const subtitle = portfolio?.assets?.length
    ? `${portfolio.assets.length} Indian holdings tracked across value, score, and risk.`
    : 'Start with the sample holdings to review allocation, AI notes, and risk balance.';
  const sourceLabel = analysis?.liveDataSource
    ? analysis.liveDataSource === 'nse-api-ruby' || analysis.liveDataSource === 'nse-api-ruby-fallback'
      ? 'Live Data: NSE'
      : analysis.liveDataSource
    : portfolio?.userId
      ? 'Live Data: Demo'
      : 'Live Data: Demo';
  const aiLabel = analysis?.aiSource === 'gemini'
    ? 'Gemini'
    : analysis?.aiSource === 'remote'
      ? 'Remote'
      : 'Fallback';

  const totalValue = analysis?.totalValue || 0;
  const score = analysis?.score ?? analysis?.aiInsights?.score ?? 0;
  const projections = analysis?.futureValueProjections || {};
  const allocation = analysis?.allocation || [];
  const diversificationScore = analysis?.diversificationScore || 0;
  const riskLevel = analysis?.riskLevel || { level: 'moderate', reasons: [] };

  if (!portfolio) {
    return (
      <MotionPanel initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <Header
          title="NexusAI Portfolio Dashboard"
          subtitle="No portfolio is saved right now. Create a new one to start tracking holdings."
          sourceLabel="Live Data: NSE"
          aiLabel="Fallback"
          onRefresh={onRefresh}
          onEdit={onEdit}
        />

        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto max-w-2xl">
            <div className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Empty portfolio</div>
            <h3 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
              Your portfolio has been cleared
            </h3>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Add holdings again when you’re ready. Refresh will stay empty until a new portfolio is saved.
            </p>
            <button
              type="button"
              onClick={onEdit}
              className="mt-6 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-105"
            >
              Create portfolio
            </button>
          </div>
        </div>
      </MotionPanel>
    );
  }

  return (
    <MotionPanel initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Header
        title={title}
        subtitle={subtitle}
        sourceLabel={sourceLabel}
        aiLabel={aiLabel}
        onRefresh={onRefresh}
        onEdit={onEdit}
      />

      <Overview
        portfolioValue={totalValue}
        portfolioScore={score}
        projections={projections}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
        <div className="space-y-6">
          <AllocationChart allocation={allocation} />
          <RiskAnalysis diversificationScore={diversificationScore} riskLevel={riskLevel} />
        </div>
        <AIInsights insights={analysis?.aiInsights} />
      </div>

      {portfolio?.assets?.length ? (
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                Holdings
              </div>
              <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                Placeholder portfolio in INR
              </h3>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 dark:bg-white/5 dark:text-white">
              {portfolio.assets.length} assets
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {portfolio.assets.map((asset) => (
              <div
                key={asset.symbol}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{asset.symbol}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {asset.type}
                </div>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Qty {asset.quantity} | Buy {formatINR(asset.buyPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </MotionPanel>
  );
}

export default PortfolioDashboard;
