import { GetPublicTrackingViewUseCase } from '@/features/tracking/application/GetPublicTrackingViewUseCase';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Submission Confirmed | Infrastructure AI Platform',
  description: 'Your report has been successfully registered. Save your unique tracking code to follow progress.',
};

export default async function SubmissionSuccessPage({
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Report Successfully Registered!</h1>
          <p className="text-slate-400 text-sm mt-2">
            Your civic infrastructure report has been assigned a unique tracking code and logged into the system.
          </p>
        </div>

        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Your Public Tracking Code
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-blue-400 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
              {report.trackingCode}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Keep this code to check progress anytime without logging in.
          </p>
        </div>

        <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Automated AI Classification
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 capitalize">
              {report.category.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-300 italic">{report.summary}</p>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Severity Rating: <strong className="text-slate-200 capitalize">{report.severityLevel}</strong></span>
            <span>Status: <strong className="text-emerald-400 uppercase">{report.status.replace('_', ' ')}</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Link
            href={`/track/${report.trackingCode}`}
            className="w-full sm:w-1/2 py-3.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition"
          >
            <span>View Live Tracking Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/report/new"
            className="w-full sm:w-1/2 py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition border border-slate-700"
          >
            <span>Submit Another Report</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
