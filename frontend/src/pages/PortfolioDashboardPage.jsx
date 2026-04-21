import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { deletePortfolio, fetchCurrentPortfolio, analyzePortfolio } from '../lib/portfolioApi';
import PortfolioDashboard from '../components/Portfolio/PortfolioDashboard';

const DEMO_PORTFOLIO = {
  _id: 'demo-nova-ai-portfolio',
  userId: 'demo-user',
  assets: [
    { symbol: 'TATAGOLD.NS', type: 'ETF', quantity: 1, buyPrice: 5000 },
    { symbol: 'TCS.NS', type: 'STOCK', quantity: 1, buyPrice: 3696 },
    { symbol: 'KALYANKJIL.BO', type: 'STOCK', quantity: 1, buyPrice: 2244 },
  ],
  createdAt: new Date('2026-04-16T00:00:00.000Z').toISOString(),
  updatedAt: new Date('2026-04-16T00:00:00.000Z').toISOString(),
};

const DEMO_ANALYSIS = {
  currency: 'INR',
  liveDataSource: 'demo',
  totalValue: 10940,
  allocation: [
    { symbol: 'TATAGOLD.NS', type: 'ETF', value: 5000, percentage: 45.7 },
    { symbol: 'TCS.NS', type: 'STOCK', value: 3696, percentage: 33.8 },
    { symbol: 'KALYANKJIL.BO', type: 'STOCK', value: 2244, percentage: 20.5 },
  ],
  diversificationScore: 58,
  riskLevel: {
    level: 'conservative',
    reasons: [
      'Gold exposure exceeds 40% of the portfolio.',
      'The largest holding still drives a meaningful share of returns.',
    ],
    factors: {
      highestAllocation: 45.7,
      goldExposure: 45.7,
      hasETF: true,
    },
  },
  score: 6,
  warnings: [
    'Gold exposure exceeds 40% of the portfolio.',
    'The portfolio would benefit from a broader asset mix.',
  ],
  aiInsights: {
    score: 6,
    keyMistakes: [
      'Gold exposure exceeds 40% of the portfolio.',
      'Concentration remains high across the top two holdings.',
    ],
    improvementSuggestions: [
      'Increase diversification across asset classes and position sizes.',
      'Review concentration risk and rebalance oversized positions.',
      'Keep an eye on fee drag and make sure every holding has a clear role.',
    ],
    fiveYearOutlook: 'The portfolio should be resilient, but upside may lag a more balanced growth mix.',
    provider: 'demo',
  },
  futureValueProjection: {
    years: 5,
    annualReturnRate: 0.075,
    projectedValue: 14298.14,
  },
  futureValueProjections: {
    3: { years: 3, annualReturnRate: 0.075, projectedValue: 13579.5 },
    5: { years: 5, annualReturnRate: 0.075, projectedValue: 14298.14 },
    10: { years: 10, annualReturnRate: 0.075, projectedValue: 20405.45 },
  },
};

const EMPTY_ANALYSIS = {
  currency: 'INR',
  liveDataSource: 'demo',
  totalValue: 0,
  allocation: [],
  profitLoss: { totalProfitLoss: 0, totalInvested: 0, returnPercentage: 0, positions: [] },
  returnPercentage: 0,
  diversificationScore: 0,
  riskLevel: { level: 'moderate', reasons: [], factors: { highestAllocation: 0, goldExposure: 0, hasETF: false } },
  score: 0,
  warnings: [],
  aiInsights: null,
  futureValueProjection: { years: 5, annualReturnRate: 0, projectedValue: 0 },
  futureValueProjections: {
    3: { years: 3, annualReturnRate: 0, projectedValue: 0 },
    5: { years: 5, annualReturnRate: 0, projectedValue: 0 },
    10: { years: 10, annualReturnRate: 0, projectedValue: 0 },
  },
};

function PortfolioDashboardPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [analysis, setAnalysis] = useState(EMPTY_ANALYSIS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const portfolioResponse = await fetchCurrentPortfolio();
      const nextPortfolio = portfolioResponse.portfolio;

      if (nextPortfolio?._id) {
        setPortfolio(nextPortfolio);

        const analysisResponse = await analyzePortfolio({ portfolioId: nextPortfolio._id });
        setAnalysis(analysisResponse);
        return;
      }

      setPortfolio(null);
      setAnalysis(EMPTY_ANALYSIS);
    } catch (requestError) {
      setPortfolio(null);
      setAnalysis(EMPTY_ANALYSIS);
      setError(requestError.message || 'Unable to load portfolio data.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  const handleEdit = () => navigate('/portfolio/manage');

  const handleDelete = () => {
    if (!portfolio?._id) {
      return;
    }

    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!portfolio?._id) {
      setDeleteDialogOpen(false);
      return;
    }

    setDeleting(true);
    try {
      await deletePortfolio(portfolio._id);
      setPortfolio(null);
      setAnalysis(EMPTY_ANALYSIS);
      setError('');
      setDeleteDialogOpen(false);
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete portfolio.');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return <div className="px-4 py-24 text-center text-slate-500">Loading account...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.88),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.24),_transparent_30%),linear-gradient(180deg,_#f7fafc_0%,_#eaf1ff_100%)] px-3 py-6 pt-20 text-slate-900 sm:px-4 sm:py-8 sm:pt-24 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.18),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_52%,_#111827_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-[1700px]">
        {error ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
            {error}
          </div>
        ) : null}

        <PortfolioDashboard
          portfolio={portfolio}
          analysis={analysis}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={loadData}
        />
      </div>

      {deleteDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/60 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-950">
            <div className="text-xs uppercase tracking-[0.35em] text-rose-500 dark:text-rose-300">
              Delete portfolio
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              Delete this portfolio?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This will permanently remove your saved portfolio and its analysis. You can create a new one later, but this action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete portfolio'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default PortfolioDashboardPage;
