import React from 'react';

function AIInsights({ insights }) {
  const mistakes = Array.isArray(insights?.risks)
    ? insights.risks
    : Array.isArray(insights?.keyMistakes)
      ? insights.keyMistakes
      : [];
  const suggestions = Array.isArray(insights?.suggestions)
    ? insights.suggestions
    : Array.isArray(insights?.improvementSuggestions)
      ? insights.improvementSuggestions
      : [];
  const score = Number(insights?.score ?? 0);
  const outlook = insights?.projection || insights?.fiveYearOutlook || 'No outlook generated yet.';
  const interpretation = score >= 8 ? 'Strong' : score >= 6 ? 'Needs polish' : 'Needs attention';

  return (
    <details open className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <div>
          <div className="text-[0.68rem] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            AI Insights
          </div>
          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Portfolio guidance</h3>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-right text-slate-900 dark:bg-white/5 dark:text-white">
          <div className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Score</div>
          <div className="text-lg font-bold">
            {score}
            <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">/10</span>
          </div>
        </div>
      </summary>

      <div className="mt-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-white/5">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">AI score</div>
            <div className="mt-2 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
              {score}
              <span className="text-base font-semibold text-slate-500 dark:text-slate-400">/10</span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {outlook}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950/30">
            <div className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Interpretation
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{interpretation}</div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              The score reflects concentration, diversification, and portfolio balance.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-white/5">
            <div className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Mistakes</div>
            <ul className="space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {mistakes.length
                ? mistakes.map((item) => <li key={item}>- {item}</li>)
                : <li>- None highlighted.</li>}
            </ul>
          </div>

          <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-white/5">
            <div className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Suggestions</div>
            <ul className="space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {suggestions.length
                ? suggestions.map((item) => <li key={item}>- {item}</li>)
                : <li>- No suggestions yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </details>
  );
}

export default AIInsights;
