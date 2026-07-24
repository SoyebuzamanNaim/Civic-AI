import { GetPublicTrackingViewUseCase } from '@/features/tracking/application/GetPublicTrackingViewUseCase';
import { ArrowRight, CheckCircle2, ClipboardCheck, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicFooter, PublicNavigation } from '@/shared/presentation/components/PublicNavigation';

export const metadata: Metadata = { title: 'Report received | CivicPulse', description: 'Your report has been registered and is ready to track.' };

export default async function SubmissionSuccessPage({ params }: { params: Promise<{ trackingCode: string }> }) {
  const { trackingCode } = await params;
  const result = await new GetPublicTrackingViewUseCase().execute(trackingCode);
  if (!result.success) notFound();
  const report = result.data;

  return (
    <div className="public-page flex min-h-screen flex-col">
      <PublicNavigation />
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-12 sm:px-6 lg:px-8"><section className="public-panel w-full rounded-3xl border border-slate-200 p-6 text-center sm:p-10"><span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-8" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Report received</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Thanks for speaking up.</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">Your report is now in the system. Save this code — it&apos;s the simplest way to check public updates later.</p>

        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-teal-200 bg-teal-50 p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Your tracking code</p><p className="mt-3 break-all rounded-xl border border-teal-200 bg-white px-4 py-3 font-mono text-2xl font-extrabold tracking-[0.12em] text-teal-800 sm:text-3xl">{report.trackingCode}</p><p className="mt-3 text-xs text-teal-900/75">Keep it somewhere handy. No sign-in is needed to use it.</p></div>

        <div className="mx-auto mt-6 grid max-w-xl gap-3 text-left sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-4"><span className="flex items-center gap-2 text-sm font-bold text-slate-900"><Sparkles className="size-4 text-teal-700" /> Initial review</span><p className="mt-2 text-xs leading-5 text-slate-600">We&apos;ve identified this as <strong className="capitalize text-slate-800">{report.category.replace('_', ' ')}</strong>.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><span className="flex items-center gap-2 text-sm font-bold text-slate-900"><ClipboardCheck className="size-4 text-teal-700" /> What&apos;s next</span><p className="mt-2 text-xs leading-5 text-slate-600">Officials can review, assign, and post public progress updates.</p></div></div>

        <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"><Link href={`/track/${report.trackingCode}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800">Track this report <ArrowRight className="size-4" /></Link><Link href="/report/new" className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Report another issue</Link></div>
      </section></main>
      <PublicFooter />
    </div>
  );
}
