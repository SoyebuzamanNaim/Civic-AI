import { SubmissionForm } from '@/features/reporting/presentation/SubmissionForm';
import { ClipboardCheck, Eye, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';
import { PublicFooter, PublicNavigation } from '@/shared/presentation/components/PublicNavigation';

export const metadata: Metadata = {
  title: 'Report an Issue | CivicPulse',
  description: 'Send a civic infrastructure report for intelligent review and public progress tracking.',
};

export default function NewReportPage() {
  return (
    <div className="public-page flex min-h-screen flex-col">
      <PublicNavigation />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-start lg:px-8 lg:py-16">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">A quick, useful report</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-950">Small details can lead to real change.</h2><p className="mt-3 text-sm leading-6 text-slate-600">You don&apos;t need to know the right department or technical terms. Just describe what you noticed.</p></div>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/70 p-5 text-sm text-slate-600"><div className="flex gap-3"><ClipboardCheck className="size-5 shrink-0 text-teal-700" /><span><strong className="block text-slate-900">Takes about two minutes</strong>Start with the issue and location.</span></div><div className="flex gap-3"><Eye className="size-5 shrink-0 text-teal-700" /><span><strong className="block text-slate-900">See the public progress</strong>Save the tracking code we give you.</span></div><div className="flex gap-3"><ShieldCheck className="size-5 shrink-0 text-teal-700" /><span><strong className="block text-slate-900">Your privacy is protected</strong>Contact details are kept out of public view.</span></div></div>
        </aside>
        <SubmissionForm />
      </main>
      <PublicFooter />
    </div>
  );
}
