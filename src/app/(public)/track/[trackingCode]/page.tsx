import { GetPublicTrackingViewUseCase } from '@/features/tracking/application/GetPublicTrackingViewUseCase';
import {
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackingCode: string }>;
}): Promise<Metadata> {
  const { trackingCode } = await params;
  return {
    title: `Track Report ${trackingCode} | Infrastructure AI Platform`,
    description: `Public status tracking and resolution history for infrastructure report ${trackingCode}.`,
  };
}

export default async function TrackingDetailPage({
  params,
}: {
  params: Promise<{ trackingCode: string }>;
}) {
  const { trackingCode } = await params;
  const useCase = new GetPublicTrackingViewUseCase();
  const result = await useCase.execute(trackingCode);

  if (!result.success) {
    notFound();
  }

  const report = result.data;

  const STATUS_STEPS = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === report.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/track" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
            ← Back to Tracking Search
          </Link>
          <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full">
            {report.trackingCode}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20 capitalize mb-2">
                {report.category.replace('_', ' ')}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{report.summary}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {report.locationText}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-slate-400 block mb-1">Current Status</span>
              <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 uppercase tracking-wider">
                {report.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Lifecycle Progress Timeline
            </h2>
            <div className="grid grid-cols-5 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const isComplete = currentStepIdx >= 0 && idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition ${
                        isCurrent
                          ? 'bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/20'
                          : isComplete
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      {isComplete ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium ${
                        isCurrent ? 'text-white font-bold' : isComplete ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-blue-400" /> Public Progress Updates
            </h3>

            {report.publicTimeline.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No public updates logged yet.</p>
            ) : (
              <div className="space-y-4 pt-2">
                {report.publicTimeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 border-l-2 border-slate-800 pl-4 py-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 capitalize">
                          Status updated to {item.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {item.note && <p className="text-xs text-slate-400 mt-1">{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
                Case Details
              </span>

              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Department:
                  </span>
                  <span className="font-medium text-slate-200">
                    {report.assignedDepartmentName || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> Severity:
                  </span>
                  <span className="font-semibold capitalize text-amber-400">
                    {report.severityLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Submitted:
                  </span>
                  <span className="text-slate-300">
                    {new Date(report.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" /> Privacy Guarantee
              </div>
              <p>
                Contact details and internal dispatcher notes are strictly redacted from this public view.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
