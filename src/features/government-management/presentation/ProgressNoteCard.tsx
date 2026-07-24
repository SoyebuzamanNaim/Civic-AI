'use client';

import { addProgressNoteAction } from '@/features/government-management/presentation/managementActions';
import { AlertCircle, CheckCircle2, Eye, Globe, Loader2, Lock, MessageSquare, ShieldAlert } from 'lucide-react';
import { useState, useTransition } from 'react';

interface ProgressNoteCardProps {
  reportId: string;
}

const templateNotes = [
  '🛠️ Field team dispatched to inspect reported site.',
  '📝 Work order officially issued to primary maintenance contractor.',
  '🔍 Technical site inspection completed, awaiting repair materials.',
  '📞 Contacted citizen reporter to clarify location details.',
];

export function ProgressNoteCard({ reportId }: ProgressNoteCardProps) {
  const [note, setNote] = useState<string>('');
  const [visibility, setVisibility] = useState<'public' | 'internal'>('public');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setFeedback(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('reportId', reportId);
      formData.append('note', note.trim());
      formData.append('visibility', visibility);

      const res = await addProgressNoteAction(formData);

      if (res?.success) {
        setFeedback({
          type: 'success',
          text: res.message || 'Progress note recorded successfully.',
        });
        setNote('');
      } else {
        setFeedback({
          type: 'error',
          text: res?.error || 'Failed to add progress note.',
        });
      }
    });
  };

  return (
    <div className="admin-card rounded-3xl p-6 space-y-5 shadow-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-700" /> Add Progress Note
        </h3>
        <span
          className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border uppercase flex items-center gap-1 ${
            visibility === 'internal'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
          }`}
        >
          {visibility === 'internal' ? <Lock className="w-3 h-3 text-amber-800" /> : <Eye className="w-3 h-3 text-emerald-800" />}
          {visibility === 'internal' ? 'Internal Note' : 'Public Note'}
        </span>
      </div>

      {/* Visibility Scope Segmented Toggle */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1 border border-slate-200">
        <button
          type="button"
          onClick={() => setVisibility('public')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
            visibility === 'public'
              ? 'bg-white text-emerald-950 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span>Public (Citizen Visible)</span>
        </button>
        <button
          type="button"
          onClick={() => setVisibility('internal')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
            visibility === 'internal'
              ? 'bg-white text-amber-950 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>Internal (Government Only)</span>
        </button>
      </div>

      {/* Visibility Scope Explanation Banner */}
      <div
        className={`p-3 rounded-2xl text-xs space-y-1 transition border ${
          visibility === 'internal'
            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-1.5 font-extrabold">
          {visibility === 'internal' ? (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Confidential Internal Commentary</span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Public Citizen Timeline Notification</span>
            </>
          )}
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">
          {visibility === 'internal'
            ? 'This note is strictly private and accessible only to verified government officials. Citizens cannot see this.'
            : 'This note will be published to the public tracking page and sent via live notifications to the citizen reporter.'}
        </p>
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

      {/* Progress Note Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">Note or Resolution Commentary</label>
            <span className="text-[10px] font-mono text-slate-400">{note.length} characters</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
            rows={3}
            required
            placeholder={
              visibility === 'internal'
                ? 'Type internal operational notes, contractor IDs, or officer remarks...'
                : 'Type public resolution updates or status updates for the citizen...'
            }
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm font-medium disabled:opacity-60 leading-relaxed"
          />

          {/* Quick Template Preset Buttons */}
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Templates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {templateNotes.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNote((prev) => (prev ? `${prev}\n${tmpl}` : tmpl))}
                  className="text-[10px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 transition"
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !note.trim()}
          className={`w-full py-2.5 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 ${
            visibility === 'internal'
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/15'
              : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-900/15'
          }`}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          <span>{visibility === 'internal' ? 'Add Internal Note' : 'Add Public Progress Note'}</span>
        </button>
      </form>
    </div>
  );
}
