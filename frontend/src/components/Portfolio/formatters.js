export function formatINR(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatCompactINR(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numeric);
}

export function formatPercent(value, digits = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '0.0%';
  }

  return `${numeric.toFixed(digits)}%`;
}
