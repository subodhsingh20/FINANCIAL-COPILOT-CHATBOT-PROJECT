import React from 'react';

const RISK_STYLES = {
  low: {
    label: 'Low risk',
    chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    fill: 'from-emerald-500 to-teal-500',
    ring: 'ring-emerald-500/20',
    description: 'Healthy diversification',
  },
  moderate: {
    label: 'Moderate risk',
    chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    fill: 'from-amber-500 to-orange-500',
    ring: 'ring-amber-500/20',
    description: 'Some concentration to watch',
  },
  high: {
    label: 'High risk',
    chip: 'bg-rose-600/10 text-rose-700 dark:text-rose-200',
    fill: 'from-rose-500 to-red-500',
    ring: 'ring-rose-500/25',
    description: 'Concentration is elevated',
  },
};

function getRiskStyle(level = 'moderate') {
  return RISK_STYLES[level] || RISK_STYLES.moderate;
}

function RiskAnalysis({ diversificationScore = 0, riskLevel = { level: 'moderate', reasons: [] } }) {
  const style = getRiskStyle(riskLevel?.level);
  const reasons = Array.isArray(riskLevel?.reasons) ? riskLevel.reasons : [];
  const scoreLabel = diversificationScore >= 80 ? 'Well diversified' : diversificationScore >= 60 ? 'Balanced mix' : 'Needs attention';

  return (
    <details open className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <div>
          <div className="text-[0.68rem] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            Risk Analysis
          </div>
          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Diversification score</h3>
        </div>

        <div className={`rounded-2xl px-4 py-2 text-center ring-1 ${style.chip} ${style.ring}`}>
          <div className="text-[0.65rem] uppercase tracking-[0.25em] opacity-80">Level</div>
          <div className="text-base font-bold">{style.label}</div>
        </div>
      </summary>

      <div className="mt-5 space-y-5">
        <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-white/5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Diversification score</div>
              <div className="mt-1 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
                {diversificationScore}
                <span className="text-base font-semibold text-slate-500 dark:text-slate-400">/100</span>
              </div>
            </div>
            <div className={`inline-flex items-center rounded-full bg-gradient-to-r ${style.fill} px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/10`}>
              {scoreLabel}
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/60">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${style.fill} transition-all duration-500`}
              style={{ width: `${Math.max(0, Math.min(100, diversificationScore))}%` }}
            />
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {style.description}
          </p>
        </div>

        {reasons.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {reasons.map((reason) => (
              <div
                key={reason}
                className="rounded-2xl border border-amber-200/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"
              >
                {reason}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
            No major concentration concerns detected.
          </div>
        )}
      </div>
    </details>
  );
}

export default RiskAnalysis;
