'use client';

import { changeReportStatusAction } from '@/features/government-management/presentation/managementActions';
import { ReportStatus } from '@/shared/domain/types';
import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useState, useTransition } from 'react';

interface StatusUpdateCardProps {
  reportId: string;
  currentStatus: ReportStatus | string;
}

const statusOptions: Array<{ id: ReportStatus; label: string; bg: string; text: string }> = [
  { id: 'submitted', label: 'Submitted', bg: 'bg-blue-100', text: 'text-blue-900' },
  { id: 'under_review', label: 'Under Review', bg: 'bg-amber-100', text: 'text-amber-900' },
  { id: 'assigned', label: 'Assigned', bg: 'bg-purple-100', text: 'text-purple-900' },
  { id: 'in_progress', label: 'In Progress', bg: 'bg-sky-100', text: 'text-sky-900' },
  { id: 'resolved', label: 'Resolved', bg: 'bg-emerald-100', text: 'text-emerald-900' },
  { id: 'rejected', label: 'Rejected', bg: 'bg-rose-100', text: 'text-rose-900' },
];

const quickReasonChips = [
  '🚀 Dispatched municipal field crew to site',
  '🔍 Technical site assessment underway',
  '📦 Awaiting required replacement materials',
  '✅ Repair completed & quality verified',
  '❌ Duplicate case or invalid report',
];

export function StatusUpdateCard({ reportId, currentStatus }: StatusUpdateCardProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [statusNote, setStatusNote] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setFeedback(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('reportId', reportId);
      formData.append('newStatus', selectedStatus);
      if (statusNote.trim()) {
        formData.append('note', statusNote.trim());
      }

      const res = await changeReportStatusAction(formData);

      if (res?.success) {
        setFeedback({
          type: 'success',
          text: res.message || `Status changed to ${selectedStatus.replace('_', ' ')}.`,
        });
        setStatusNote('');
      } else {
        setFeedback({
          type: 'error',
          text: res?.error || 'Failed to update case status.',
        });
      }
    });
  };

  const currentOption = statusOptions.find((s) => s.id === currentStatus) || statusOptions[0];

  return (
    <div className="admin-card rounded-3xl p-6 space-y-5 shadow-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-teal-700" /> Update Case Status
        </h3>
        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase border shadow-2xs ${currentOption.bg} ${currentOption.text}`}>
          Current: {currentStatus.replace('_', ' ')}
        </span>
      </div>

      {/* Workflow Progression Visualizer */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
          Lifecycle Progression
        </span>
        <div className="flex items-center justify-between text-[11px] font-bold overflow-x-auto pb-1 gap-1">
          {['submitted', 'under_review', 'assigned', 'in_progress', 'resolved'].map((step, idx) => {
            const stepOrder = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved'];
            const currentIdx = stepOrder.indexOf(currentStatus);
            const isCompleted = currentIdx >= idx && currentStatus !== 'rejected';
            const isCurrent = currentStatus === step;

            return (
              <div key={step} className="flex items-center gap-1 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase transition ${
                    isCurrent
                      ? 'bg-teal-700 text-white border-teal-800 font-extrabold shadow-sm ring-2 ring-teal-600/30'
                      : isCompleted
                      ? 'bg-teal-50 text-teal-900 border-teal-200'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {step.replace('_', ' ')}
                </span>
                {idx < 4 && <span className="text-slate-300 font-normal">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
              : 'bg-rose-50 text-rose-950 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Status Update Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Status Transition</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={isPending}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm disabled:opacity-60 capitalize"
          >
            {statusOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label} {opt.id === currentStatus ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Status Transition Note <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            disabled={isPending}
            placeholder="Reason for status change..."
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm font-medium disabled:opacity-60"
          />

          {/* Quick Pre-filled Reason Chips */}
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Preset Reasons:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickReasonChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStatusNote(chip)}
                  className="text-[10px] font-semibold bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md shadow-teal-900/15 transition flex items-center justify-center gap-1.5"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
          <span>Update Status</span>
        </button>
      </form>
    </div>
  );
}
