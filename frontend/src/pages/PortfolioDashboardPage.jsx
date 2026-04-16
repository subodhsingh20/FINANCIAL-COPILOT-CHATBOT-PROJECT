import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchCurrentPortfolio, analyzePortfolio } from '../lib/portfolioApi';
import PortfolioDashboard from '../components/Portfolio/PortfolioDashboard';

const DEMO_PORTFOLIO = {
  _id: 'demo-nexusai-portfolio',
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

  if (authLoading) {
    return <div className="px-4 py-24 text-center text-slate-500">Loading account...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.88),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.24),_transparent_30%),linear-gradient(180deg,_#f7fafc_0%,_#eaf1ff_100%)] px-4 py-8 pt-24 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.18),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_52%,_#111827_100%)] dark:text-slate-100">
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
          onRefresh={loadData}
        />
      </div>
    </div>
  );
}

export default PortfolioDashboardPage;
