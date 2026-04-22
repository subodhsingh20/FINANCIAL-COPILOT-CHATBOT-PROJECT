import React from 'react';
import { apiUrl } from '../../lib/api';

const Login = () => {
  const handleLogin = () => {
    window.location.assign(apiUrl('/appid/login'));
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
              IBM App ID
            </div>
            <h1 className="mt-8 max-w-lg text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Sign in to your dashboard.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600 dark:text-slate-300">
              Authentication is handled by IBM App ID, then your backend issues the JWT used by the portfolio and chat APIs.
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
                Continue with IBM App ID and return to your portfolio dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_20px_50px_-20px_rgba(29,78,216,0.5)] transition hover:translate-y-[-1px] hover:shadow-[0_28px_60px_-24px_rgba(29,78,216,0.55)] dark:bg-[linear-gradient(135deg,_#f8fafc,_#dbeafe)] dark:text-slate-950 dark:shadow-[0_20px_50px_-20px_rgba(255,255,255,0.22)]"
            >
              Login with IBM App ID
            </button>

          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
