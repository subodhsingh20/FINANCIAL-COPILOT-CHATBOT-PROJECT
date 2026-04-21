import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const data = await apiRequest('/api/login', {
        method: 'POST',
        body: { email, password },
      });

      login(data.user, data.token);
      navigate('/chat');
    } catch (requestError) {
      setError(requestError.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.35),_transparent_30%),linear-gradient(180deg,_#f7fafc_0%,_#eaf1ff_100%)] px-4 py-16 sm:py-24 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_28%),linear-gradient(180deg,_#09090b_0%,_#111827_100%)]">
      <div className="absolute inset-0 opacity-60 dark:opacity-100">
        <div className="absolute left-[10%] top-[14%] h-40 w-40 rounded-full bg-white/70 blur-3xl dark:bg-sky-500/20" />
        <div className="absolute bottom-[12%] right-[10%] h-52 w-52 rounded-full bg-sky-200/60 blur-3xl dark:bg-orange-500/10" />
      </div>

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/60 bg-white/75 shadow-[0_40px_120px_-55px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_40px_120px_-55px_rgba(0,0,0,0.65)] md:grid-cols-[1.05fr_0.95fr] md:rounded-[36px]">
        <section className="hidden flex-col justify-center bg-[linear-gradient(160deg,_rgba(255,255,255,0.92),_rgba(236,245,255,0.75))] p-10 md:flex dark:bg-[linear-gradient(160deg,_rgba(15,23,42,0.9),_rgba(17,24,39,0.8))]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Chat Workspace
            </div>
            <h1 className="mt-8 max-w-lg text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Sign in to your chat workspace.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600 dark:text-slate-300">
              Continue your saved conversations, revisit ideas, and work with OpenRouter in a calm, professional interface.
            </p>
          </div>
        </section>

        <section className="p-6 md:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Welcome back</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Sign in
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                Access your saved chats and continue working from where you left off.
              </p>
            </div>

            {error ? (
              <div className="mb-5 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-500/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-500/10"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8)] py-3.5 text-sm font-semibold text-white shadow-[0_20px_50px_-20px_rgba(29,78,216,0.5)] transition hover:translate-y-[-1px] hover:shadow-[0_28px_60px_-24px_rgba(29,78,216,0.55)] dark:bg-[linear-gradient(135deg,_#f8fafc,_#dbeafe)] dark:text-slate-950 dark:shadow-[0_20px_50px_-20px_rgba(255,255,255,0.22)]"
              >
                Continue
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-slate-900 hover:underline dark:text-white">
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
