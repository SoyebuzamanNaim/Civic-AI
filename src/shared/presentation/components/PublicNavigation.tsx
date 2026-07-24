import { ArrowUpRight, Landmark, MapPin } from 'lucide-react';
import Link from 'next/link';
import { LanguageToggle } from './LanguageToggle';

export function PublicNavigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="CivicPulse home">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/15 transition-transform group-hover:-translate-y-0.5"><MapPin className="size-5" /></span>
          <span><span className="block text-base font-extrabold tracking-tight text-slate-950">CivicPulse</span><span className="hidden text-[11px] font-medium text-slate-500 sm:block">Better streets, together</span></span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm font-semibold">
          <LanguageToggle />
          <Link href="/track" className="hidden rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex">Track a report</Link>
          <Link href="/government/login" className="hidden items-center gap-1 rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex"><Landmark className="size-4" />Official portal</Link>
          <Link href="/report/new" className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm shadow-teal-900/20 transition hover:bg-teal-800 sm:text-sm">Report an issue <ArrowUpRight className="size-4" /></Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>Built for quicker action on everyday civic issues.</p><p>Public tracking never shows your contact details.</p></div></footer>;
}
