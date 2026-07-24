import { ArrowRight, CheckCircle2, MapPin, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PublicFooter, PublicNavigation } from '@/shared/presentation/components/PublicNavigation';

const steps = [
  { icon: MapPin, title: 'Tell us where it is', copy: 'Use an address, landmark, or your current location.' },
  { icon: ScanLine, title: 'We make it actionable', copy: 'AI helps sort the issue, assess urgency, and prevent duplicate work.' },
  { icon: CheckCircle2, title: 'Follow the progress', copy: 'Use your private tracking code to see each public update.' },
];

export default function HomePage() {
  return (
    <div className="public-page flex min-h-screen flex-col text-slate-900">
      <PublicNavigation />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-20 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
              <Sparkles className="size-3.5" />
              A clearer path from report to response
            </span>
            <div className="flex flex-col gap-5">
              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">
                A simpler way to get your city&apos;s attention.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                See a pothole, leak, or broken streetlight? Tell us what happened and where. We&apos;ll help get the right details to the people who can act on it.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/report/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-teal-800">
                Report an issue <ArrowRight className="size-4" />
              </Link>
              <Link href="/track" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
                Track a report
              </Link>
            </div>
            <p className="flex items-center gap-2 text-xs font-medium text-slate-500"><ShieldCheck className="size-4 text-teal-700" /> No account required. Your contact details stay private.</p>
          </div>

          <aside className="relative overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-2xl shadow-slate-900/20 sm:p-7">
            <div className="absolute -right-16 -top-16 size-52 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-5">
              <div className="flex items-center justify-between"><span className="text-sm font-bold">A report in motion</span><span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">Updated today</span></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-teal-300">Broken streetlight</p><h2 className="mt-2 text-lg font-bold">Near the community clinic entrance</h2></div><MapPin className="size-5 shrink-0 text-teal-300" /></div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-teal-400" /></div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>Submitted</span><span>Assigned</span><span className="text-teal-200">In progress</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-300"><span className="rounded-xl bg-white/[0.06] p-2.5">Clear status</span><span className="rounded-xl bg-white/[0.06] p-2.5">Public updates</span><span className="rounded-xl bg-white/[0.06] p-2.5">Private details</span></div>
            </div>
          </aside>
        </section>

        <section className="flex flex-col gap-8">
          <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">How it works</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">A little clarity goes a long way.</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, copy }, index) => (
              <article key={title} className="public-panel rounded-2xl border border-slate-200 p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-sm font-extrabold text-teal-800">0{index + 1}</span>
                <Icon className="mt-5 size-5 text-teal-700" />
                <h3 className="mt-3 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
