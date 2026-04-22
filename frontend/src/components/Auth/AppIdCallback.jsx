import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

const AppIdCallback = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    const finishLogin = async () => {
      try {
        const user = await apiRequest('/api/user', { method: 'GET' });
        login(user);
        navigate('/portfolio', { replace: true });
      } catch (error) {
        setMessage(error.message || 'Unable to complete sign-in.');
        navigate('/login', { replace: true });
      }
    };

    finishLogin();
  }, [login, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
        {message}
      </div>
    </div>
  );
};

export default AppIdCallback;
