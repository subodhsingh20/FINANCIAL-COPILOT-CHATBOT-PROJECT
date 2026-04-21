import React from 'react';
import { formatINR } from './formatters';

function MetricCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur transition-colors dark:border-white/10 dark:bg-slate-950/50 dark:shadow-[0_18px_50px_rgba(2,6,23,0.4)]">
      <div className={`mb-4 h-1.5 w-20 rounded-full bg-gradient-to-r ${accent}`} />
      <div className="text-[0.68rem] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</div>
    </div>
  );
}

function ProjectionCard({ years, projection, accent }) {
  const projectedValue = projection?.projectedValue ?? 0;
  const annualReturnRate = Number(projection?.annualReturnRate ?? 0) * 100;

  return (
    <MetricCard
      label={`${years}-Year Projection`}
      value={formatINR(projectedValue)}
      hint={`Assumes ${annualReturnRate.toFixed(1)}% annual return`}
      accent={accent}
    />
  );
}

function Overview({ portfolioValue = 0, portfolioScore = 0, projections = {} }) {
  const projection3 = projections[3] || projections['3'] || {};
  const projection5 = projections[5] || projections['5'] || {};
  const projection10 = projections[10] || projections['10'] || {};

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        label="Portfolio Value"
        value={formatINR(portfolioValue)}
        hint="Marked to current market price"
        accent="from-cyan-500 to-teal-500"
      />
      <MetricCard
        label="Portfolio Score"
        value={`${portfolioScore}/10`}
        hint="Calculated from concentration, diversification, and portfolio balance"
        accent="from-sky-500 to-indigo-500"
      />
      <ProjectionCard years={3} projection={projection3} accent="from-amber-500 to-orange-500" />
      <ProjectionCard years={5} projection={projection5} accent="from-violet-500 to-fuchsia-500" />
      <ProjectionCard years={10} projection={projection10} accent="from-emerald-500 to-lime-500" />
    </section>
  );
}

export default Overview;
