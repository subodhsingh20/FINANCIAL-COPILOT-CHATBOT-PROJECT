import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { apiUrl } from '../../lib/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch(apiUrl('/api/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      login(data.user, data.token);
      navigate('/chat');
    } catch {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.82),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(191,219,254,0.4),_transparent_30%),linear-gradient(180deg,_#f7fafc_0%,_#eef2ff_100%)] px-4 py-24 dark:bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.08),_transparent_28%),linear-gradient(180deg,_#09090b_0%,_#111827_100%)]">
      <div className="absolute inset-0 opacity-70 dark:opacity-100">
        <div className="absolute right-[10%] top-[14%] h-44 w-44 rounded-full bg-white/70 blur-3xl dark:bg-sky-500/20" />
        <div className="absolute bottom-[12%] left-[9%] h-52 w-52 rounded-full bg-indigo-200/70 blur-3xl dark:bg-amber-500/10" />
      </div>

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/60 bg-white/75 shadow-[0_40px_120px_-55px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_40px_120px_-55px_rgba(0,0,0,0.65)] md:grid-cols-[0.95fr_1.05fr]">
        <section className="p-6 md:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Create account</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Join NexusAI
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                Create your workspace and start saving conversations with Gemini.
              </p>
            </div>

            {error ? (
              <div className="mb-5 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[linear-gradient(135deg,_#111827,_#4338ca)] py-3.5 text-sm font-semibold text-white shadow-[0_20px_50px_-20px_rgba(67,56,202,0.45)] transition hover:translate-y-[-1px] hover:shadow-[0_28px_60px_-24px_rgba(67,56,202,0.5)] dark:bg-[linear-gradient(135deg,_#f8fafc,_#e0e7ff)] dark:text-slate-950 dark:shadow-[0_20px_50px_-20px_rgba(255,255,255,0.22)]"
              >
                Create account
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-900 hover:underline dark:text-white">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="hidden flex-col justify-center bg-[linear-gradient(160deg,_rgba(243,244,255,0.96),_rgba(226,232,255,0.78))] p-10 md:flex dark:bg-[linear-gradient(160deg,_rgba(15,23,42,0.9),_rgba(30,27,75,0.8))]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Gemini Powered
            </div>
            <h1 className="mt-8 max-w-lg text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Create a space that feels ready for work.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600 dark:text-slate-300">
              Organize ideas, continue conversations, and use a modern AI experience that feels simple and professional.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
