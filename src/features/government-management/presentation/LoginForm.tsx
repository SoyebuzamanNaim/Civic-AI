'use client';

import { loginOfficialAction } from '@/features/government-management/presentation/authActions';
import { AlertCircle, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { useState, useTransition } from 'react';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginOfficialAction(null, formData);
      if (res && !res.success) {
        setErrorMsg(res.error);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Government Official Login</h1>
        <p className="text-xs text-slate-400">
          Access the municipal dispatch & case management system.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="officer@city.gov"
            className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition"
      >
        {isPending ? (
          <span>Authenticating Credentials...</span>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>Sign In to Dashboard</span>
          </>
        )}
      </button>

      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>Authorized personnel only. Unauthorized access attempts are audited and logged.</span>
      </div>
    </form>
  );
}
