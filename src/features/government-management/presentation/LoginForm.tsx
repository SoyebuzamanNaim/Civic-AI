'use client';

import { loginOfficialAction } from '@/features/government-management/presentation/authActions';
import { AlertCircle, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';
import { useState, useTransition } from 'react';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setErrorMsg(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => { const res = await loginOfficialAction(null, formData); if (res && !res.success) setErrorMsg(res.error); });
  };

  return (
    <form onSubmit={handleSubmit} className="public-panel w-full max-w-md rounded-3xl border border-slate-200 p-7 sm:p-8">
      <div><span className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white"><LockKeyhole className="size-5" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Secure workspace</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Official sign in</h1><p className="mt-2 text-sm leading-6 text-slate-600">Access report management, assignment, and public progress updates.</p></div>
      {errorMsg && <div role="alert" className="mt-6 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800"><AlertCircle className="size-4 shrink-0" />{errorMsg}</div>}
      <div className="mt-6 flex flex-col gap-4"><label className="flex flex-col gap-1.5 text-sm font-bold text-slate-800">Official email<input type="email" name="email" required placeholder="officer@city.gov" className="rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label><label className="flex flex-col gap-1.5 text-sm font-bold text-slate-800">Password<input type="password" name="password" required placeholder="Enter your password" className="rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label></div>
      <button type="submit" disabled={isPending} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{isPending ? 'Signing you in…' : <><LogIn className="size-4" />Sign in to workspace</>}</button>
      <p className="mt-5 flex gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-700" />This workspace is restricted to authorised municipal personnel. Access is monitored.</p>
    </form>
  );
}
