import { ArrowRight, Search, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PublicFooter, PublicNavigation } from '@/shared/presentation/components/PublicNavigation';

export const metadata: Metadata = {
  title: 'Track a Report | CivicPulse',
  description: 'See public progress updates for a civic infrastructure report.',
};

export default function TrackSearchPage() {
  async function searchAction(formData: FormData) {
    'use server';
    const code = formData.get('trackingCode')?.toString().trim();
    if (code) redirect(`/track/${encodeURIComponent(code)}`);
  }

  return (
    <div className="public-page flex min-h-screen flex-col">
      <PublicNavigation />
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <section className="public-panel grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 md:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col justify-between bg-teal-800 p-7 text-white sm:p-9"><div><span className="flex size-11 items-center justify-center rounded-2xl bg-white/15"><Search className="size-5" /></span><p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Public progress</p><h1 className="mt-3 text-3xl font-extrabold leading-tight">See where your report stands.</h1><p className="mt-3 text-sm leading-6 text-teal-50/85">Every submitted issue gets a unique code so you can follow public updates without creating an account.</p></div><p className="mt-10 flex items-center gap-2 text-xs font-medium text-teal-100"><ShieldCheck className="size-4" /> Private details are never shown here.</p></div>
          <div className="p-7 sm:p-9"><h2 className="text-xl font-extrabold tracking-tight text-slate-950">Enter your tracking code</h2><p className="mt-2 text-sm leading-6 text-slate-600">It looks like <span className="font-mono font-semibold text-slate-800">TRK-8K9P-2X4M</span> and was shown after you submitted your report.</p><form action={searchAction} className="mt-7 flex flex-col gap-3"><label htmlFor="trackingCode" className="text-sm font-bold text-slate-800">Tracking code</label><input id="trackingCode" type="text" name="trackingCode" required placeholder="TRK-XXXX-XXXX" autoCapitalize="characters" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 font-mono text-base font-bold tracking-[0.12em] text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800">View report progress <ArrowRight className="size-4" /></button></form><p className="mt-5 text-xs leading-5 text-slate-500">Can&apos;t find the code? Check the confirmation screen or message you received when you reported the issue.</p></div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
