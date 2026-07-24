import { SubmissionForm } from '@/features/reporting/presentation/SubmissionForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report Civic Issue | Infrastructure AI Platform',
  description: 'Submit public infrastructure issues for AI classification, severity scoring, and government resolution tracking.',
};

export default function NewReportPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <SubmissionForm />
    </div>
  );
}
