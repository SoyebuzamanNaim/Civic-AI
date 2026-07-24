import { LoginForm } from '@/features/government-management/presentation/LoginForm';
import { BarChart3, ClipboardList, Users } from 'lucide-react';
import { Metadata } from 'next';
import { PublicFooter, PublicNavigation } from '@/shared/presentation/components/PublicNavigation';

export const metadata: Metadata = { title: 'Official portal | CivicPulse', description: 'Secure civic report management for municipal officials.' };

export default function GovernmentLoginPage() {
  return (
    <div className="public-page flex min-h-screen flex-col"><PublicNavigation /><main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8"><section className="order-2 lg:order-1"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Municipal operations</p><h2 className="mt-3 max-w-md text-4xl font-extrabold leading-tight tracking-tight text-slate-950">A more focused way to move cases forward.</h2><p className="mt-4 max-w-md text-sm leading-7 text-slate-600">Review incoming reports, act on the ones that need attention, and make the next public update clear.</p><div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">{[[ClipboardList, 'Review'], [Users, 'Assign'], [BarChart3, 'Resolve']].map(([Icon, label]) => { const ItemIcon = Icon as typeof ClipboardList; return <div key={label as string} className="rounded-2xl border border-slate-200 bg-white/75 p-4"><ItemIcon className="size-5 text-teal-700" /><p className="mt-4 text-sm font-bold text-slate-900">{label as string}</p></div>; })}</div></section><div className="order-1 flex justify-center lg:order-2"><LoginForm /></div></main><PublicFooter /></div>
  );
}
