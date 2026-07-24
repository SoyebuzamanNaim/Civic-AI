import { GetPublicTrackingViewUseCase } from '@/features/tracking/application/GetPublicTrackingViewUseCase';
import { ArrowLeft, Building2, Calendar, Check, Clock3, MapPin, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicFooter, PublicNavigation } from '@/shared/presentation/components/PublicNavigation';

const STATUS_STEPS = [{ key: 'submitted', label: 'Submitted' }, { key: 'under_review', label: 'Under review' }, { key: 'assigned', label: 'Assigned' }, { key: 'in_progress', label: 'In progress' }, { key: 'resolved', label: 'Resolved' }];
const formatValue = (value: string) => value.replaceAll('_', ' ');

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ trackingCode: string }> }): Promise<Metadata> {
  const { trackingCode } = await params;
  return { title: `Track ${trackingCode} | CivicPulse`, description: `Public progress for civic report ${trackingCode}.` };
}

export default async function TrackingDetailPage({ params }: { params: Promise<{ trackingCode: string }> }) {
  const { trackingCode } = await params;
  const result = await new GetPublicTrackingViewUseCase().execute(trackingCode);
  if (!result.success) notFound();
  const report = result.data;
  const currentStep = STATUS_STEPS.findIndex((step) => step.key === report.status);
  const severityClass = report.severityLevel === 'critical' ? 'bg-rose-50 text-rose-800 ring-rose-200' : report.severityLevel === 'high' ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-sky-50 text-sky-800 ring-sky-200';

  return (
    <div className="public-page flex min-h-screen flex-col">
      <PublicNavigation />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-center justify-between gap-3"><Link href="/track" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-800 hover:text-teal-950"><ArrowLeft className="size-4" /> Back to tracking</Link><span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-600">{report.trackingCode}</span></div>

        <section className="public-panel rounded-3xl border border-slate-200 p-6 sm:p-8"><div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 capitalize">{formatValue(report.category)}</p><h1 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{report.summary}</h1><p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="size-4 shrink-0 text-teal-700" />{report.locationText}</p></div><div className="shrink-0 rounded-2xl bg-teal-50 px-4 py-3 sm:text-right"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">Current status</p><p className="mt-1 text-sm font-extrabold capitalize text-teal-950">{formatValue(report.status)}</p></div></div>
          <div className="mt-7"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Progress so far</h2><span className="text-xs text-slate-500">We&apos;ll add updates here as the case moves forward.</span></div><ol className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-5">{STATUS_STEPS.map((step, index) => { const done = currentStep >= index; const current = currentStep === index; return <li key={step.key} className="flex items-center gap-2 sm:flex-col sm:items-start"><span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${current ? 'bg-teal-700 text-white ring-4 ring-teal-100' : done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>{done && !current ? <Check className="size-4" /> : index + 1}</span><span className={`text-xs font-semibold ${current ? 'text-teal-900' : done ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</span></li>; })}</ol></div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
          <section className="public-panel rounded-3xl border border-slate-200 p-6">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-950">
              <Clock3 className="size-5 text-teal-700" />
              Public updates
            </h2>
            <p className="mt-1 text-sm text-slate-600">Only updates selected for public view appear here.</p>
            {report.publicTimeline.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                There are no public updates yet. The report is still recorded and ready for official review.
              </div>
            ) : (
              <ol className="mt-6 flex flex-col gap-5">
                {report.publicTimeline.map((item, index) => {
                  const isNote = item.isProgressNote;
                  const headerTitle = isNote
                    ? 'Progress Note'
                    : `Status Update: ${formatValue(item.status)}`;

                  return (
                    <li key={`${item.timestamp}-${index}`} className="relative border-l-2 border-teal-100 pl-5">
                      <span className={`absolute -left-[5px] top-1 size-2 rounded-full ${isNote ? 'bg-emerald-500' : 'bg-teal-600'}`} />
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold capitalize text-slate-900">{headerTitle}</h3>
                          {isNote && (
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800 border border-emerald-200">
                              Note
                            </span>
                          )}
                        </div>
                        <time className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</time>
                      </div>
                      {item.note && <p className="mt-2 text-sm leading-6 text-slate-700">{item.note}</p>}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
          <aside className="flex flex-col gap-4"><section className="public-panel rounded-3xl border border-slate-200 p-5"><h2 className="text-sm font-extrabold text-slate-950">Report details</h2><dl className="mt-4 flex flex-col gap-4 text-sm"><div className="flex gap-3"><Building2 className="size-4 shrink-0 text-teal-700" /><div><dt className="text-xs font-semibold text-slate-500">Responsible department</dt><dd className="mt-1 font-bold text-slate-800">{report.assignedDepartmentName || 'Not assigned yet'}</dd></div></div><div className="flex gap-3"><span className={`mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ring-1 ${severityClass}`}>{report.severityLevel}</span><div><dt className="text-xs font-semibold text-slate-500">Priority level</dt><dd className="mt-1 font-bold text-slate-800">{Math.round(report.severityScore)} / 100</dd></div></div><div className="flex gap-3"><Calendar className="size-4 shrink-0 text-teal-700" /><div><dt className="text-xs font-semibold text-slate-500">Submitted</dt><dd className="mt-1 font-bold text-slate-800">{new Date(report.submittedAt).toLocaleDateString()}</dd></div></div></dl></section><section className="rounded-3xl border border-teal-200 bg-teal-50 p-5"><h2 className="flex items-center gap-2 text-sm font-extrabold text-teal-950"><ShieldCheck className="size-4 text-teal-700" /> Your privacy</h2><p className="mt-2 text-xs leading-5 text-teal-900/80">Contact details and internal notes are not included on this public page.</p></section></aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
