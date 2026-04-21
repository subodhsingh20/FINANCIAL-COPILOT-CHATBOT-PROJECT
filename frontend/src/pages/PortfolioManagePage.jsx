import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PortfolioForm from '../components/Portfolio/PortfolioForm';
import { createPortfolio, deletePortfolio, fetchCurrentPortfolio, updatePortfolio } from '../lib/portfolioApi';

function PortfolioManagePage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user?._id) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetchCurrentPortfolio();
        setPortfolio(response.portfolio);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load portfolio');
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      load();
    }
  }, [authLoading, user?._id]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');

    try {
      if (payload.deletePortfolio && portfolio?._id) {
        await deletePortfolio(portfolio._id);
      } else if (!payload.assets.length && !portfolio?._id) {
        navigate('/portfolio');
        return;
      } else if (portfolio?._id) {
        await updatePortfolio(portfolio._id, payload);
      } else {
        await createPortfolio(payload);
      }

      navigate('/portfolio');
    } catch (requestError) {
      setError(requestError.data?.errors?.join(', ') || requestError.message || 'Unable to save portfolio');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="px-4 py-20 text-center text-slate-500 sm:py-24">Loading portfolio form...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 pt-20 sm:px-4 sm:py-8 sm:pt-24">
      <PortfolioForm
        initialPortfolio={portfolio}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/portfolio')}
      />
    </div>
  );
}

export default PortfolioManagePage;
