import React, { useMemo, useState } from 'react';
import { formatINR, formatPercent } from './formatters';

const COLORS = ['#0f766e', '#0284c7', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];
const SIZE = 260;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 96;
const INNER_RADIUS = 54;

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeSlicePath(startAngle, endAngle, outerRadius, innerRadius) {
  const outerStart = polarToCartesian(CENTER, CENTER, outerRadius, endAngle);
  const outerEnd = polarToCartesian(CENTER, CENTER, outerRadius, startAngle);
  const innerStart = polarToCartesian(CENTER, CENTER, innerRadius, startAngle);
  const innerEnd = polarToCartesian(CENTER, CENTER, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

function AllocationChart({ allocation = [] }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const safeAllocation = useMemo(
    () => allocation.filter((entry) => entry && Number(entry.percentage) > 0 && Number(entry.value) > 0),
    [allocation]
  );

  const slices = useMemo(() => {
    if (!safeAllocation.length) {
      return [];
    }

    let startAngle = 0;
    return safeAllocation.map((entry, index) => {
      const sweep = (Number(entry.percentage) / 100) * 360;
      const endAngle = startAngle + sweep;
      const slice = {
        ...entry,
        color: COLORS[index % COLORS.length],
        startAngle,
        endAngle,
        path: describeSlicePath(startAngle, endAngle, OUTER_RADIUS, INNER_RADIUS),
      };
      startAngle = endAngle;
      return slice;
    });
  }, [safeAllocation]);

  const totalValue = safeAllocation.reduce((sum, entry) => sum + Number(entry.value || 0), 0);

  if (!safeAllocation.length) {
    return (
    <details open className="rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/5">
        <summary className="cursor-pointer list-none">
          <div className="text-[0.68rem] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            Allocation Chart
          </div>
          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Portfolio mix</h3>
        </summary>
        <div className="mt-5 flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          No allocation data yet.
        </div>
      </details>
    );
  }

  return (
    <details open className="group rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/5">
      <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <div className="text-[0.68rem] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            Allocation Chart
          </div>
          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Portfolio mix</h3>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-right text-sm font-semibold text-slate-900 dark:bg-white/5 dark:text-white">
          <div className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Total</div>
          {formatINR(totalValue)}
        </div>
      </summary>

      <div className="mt-5 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="relative mx-auto flex w-full max-w-[240px] items-center justify-center sm:max-w-[300px]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.12),transparent_65%)] blur-2xl" />
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative h-[220px] w-[220px] sm:h-[260px] sm:w-[260px]">
            <circle
              cx={CENTER}
              cy={CENTER}
              r={OUTER_RADIUS}
              fill="none"
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="1"
            />
            {slices.map((slice) => {
              const isActive = hoveredSlice?.symbol === slice.symbol;
              return (
                <path
                  key={slice.symbol}
                  d={slice.path}
                  fill={slice.color}
                  opacity={isActive || !hoveredSlice ? 1 : 0.45}
                  className="transition-opacity duration-200"
                  onMouseEnter={(event) =>
                    setHoveredSlice({
                      symbol: slice.symbol,
                      value: slice.value,
                      percentage: slice.percentage,
                      x: event.nativeEvent.offsetX,
                      y: event.nativeEvent.offsetY,
                      color: slice.color,
                    })
                  }
                  onMouseMove={(event) =>
                    setHoveredSlice((current) =>
                      current?.symbol === slice.symbol
                        ? {
                            ...current,
                            x: event.nativeEvent.offsetX,
                            y: event.nativeEvent.offsetY,
                          }
                        : current
                    )
                  }
                  onMouseLeave={() => setHoveredSlice(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${slice.symbol} allocation ${slice.percentage.toFixed(1)} percent`}
                />
              );
            })}
            <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill="rgba(15, 23, 42, 0.96)" />
            <text x={CENTER} y={CENTER - 6} textAnchor="middle" className="fill-white text-[11px] uppercase tracking-[0.35em]">
              Total
            </text>
            <text x={CENTER} y={CENTER + 22} textAnchor="middle" className="fill-white text-2xl font-semibold">
              {formatINR(totalValue)}
            </text>
          </svg>

          {hoveredSlice ? (
            <div
              className="pointer-events-none absolute z-10 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950 dark:text-white"
              style={{
                left: `${Math.min(Math.max(hoveredSlice.x + 16, 12), 200)}px`,
                top: `${Math.min(Math.max(hoveredSlice.y - 8, 12), 200)}px`,
              }}
            >
              <div className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                {hoveredSlice.symbol}
              </div>
              <div className="mt-1 font-semibold" style={{ color: hoveredSlice.color }}>
                {formatPercent(hoveredSlice.percentage)}
              </div>
              <div className="mt-1 text-slate-600 dark:text-slate-300">{formatINR(hoveredSlice.value)}</div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {slices.map((entry) => (
            <div
              key={entry.symbol}
              className="flex h-full min-h-[110px] flex-col justify-between rounded-2xl border border-white/60 bg-white/80 px-4 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 h-3.5 w-3.5 flex-none rounded-full" style={{ backgroundColor: entry.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        {entry.symbol}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {String(entry.type || '').toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-slate-900 dark:text-white">
                        {formatPercent(entry.percentage)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {formatINR(entry.value)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

export default AllocationChart;
