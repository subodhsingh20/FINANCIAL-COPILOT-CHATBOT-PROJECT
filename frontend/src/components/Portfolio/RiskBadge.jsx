import React from 'react';

const styles = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  moderate: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  conservative: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  high: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  very_high: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
};

const labels = {
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  conservative: 'Over-Conservative',
  high: 'High Risk',
  very_high: 'Very High Risk',
};

function RiskBadge({ level = 'moderate' }) {
  const style = styles[level] || styles.moderate;
  const label = labels[level] || labels.moderate;

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${style}`}>
      {label}
    </span>
  );
}

export default RiskBadge;
