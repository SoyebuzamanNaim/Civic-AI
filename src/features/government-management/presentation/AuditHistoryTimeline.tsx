'use client';

import { Clock, Eye, Filter, Lock, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export interface AuditHistoryLog {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  visibility: string | null;
  created_at: string;
}

interface AuditHistoryTimelineProps {
  logs: AuditHistoryLog[];
}

export function AuditHistoryTimeline({ logs }: AuditHistoryTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'public' | 'internal' | 'status'>('all');

  const filteredLogs = logs.filter((h) => {
    if (filter === 'all') return true;
    if (filter === 'internal') return h.visibility === 'internal';
    if (filter === 'public') return h.visibility === 'public' && h.from_status === h.to_status;
    if (filter === 'status') return h.from_status !== h.to_status;
    return true;
  });

  return (
    <div className="admin-card rounded-3xl p-6 space-y-5 shadow-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
        <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-700" /> Full Audit & Activity History
        </h2>

        {/* Timeline Filter Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
          <span className="text-slate-400 px-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-0.5 rounded-lg transition ${
              filter === 'all' ? 'bg-white text-slate-950 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('public')}
            className={`px-2.5 py-0.5 rounded-lg transition ${
              filter === 'public' ? 'bg-white text-emerald-950 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Public Notes
          </button>
          <button
            type="button"
            onClick={() => setFilter('internal')}
            className={`px-2.5 py-0.5 rounded-lg transition ${
              filter === 'internal' ? 'bg-white text-amber-950 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Internal Notes
          </button>
          <button
            type="button"
            onClick={() => setFilter('status')}
            className={`px-2.5 py-0.5 rounded-lg transition ${
              filter === 'status' ? 'bg-white text-teal-950 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Status Changes
          </button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 rounded-2xl">
          No audit history events match the selected filter criterion.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((h) => {
            const isProgressNote = Boolean(h.from_status && h.from_status === h.to_status);
            const isInternal = h.visibility === 'internal';

            return (
              <div
                key={h.id}
                className={`p-4 rounded-2xl space-y-2 border shadow-2xs transition ${
                  isInternal
                    ? 'bg-amber-50/70 border-amber-300/80 text-amber-950 ring-1 ring-amber-400/20'
                    : isProgressNote
                    ? 'bg-emerald-50/50 border-emerald-200/80 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                  <span className="font-bold capitalize flex items-center gap-1.5 flex-wrap">
                    {isInternal ? (
                      <>
                        <Lock className="w-4 h-4 text-amber-700 inline shrink-0" />
                        <span className="text-amber-950 font-extrabold">Internal Note (Private to Officials)</span>
                      </>
                    ) : isProgressNote ? (
                      <>
                        <MessageSquare className="w-4 h-4 text-emerald-700 inline shrink-0" />
                        <span className="text-emerald-950 font-extrabold">Public Progress Note</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-teal-700 inline shrink-0" />
                        Status Transition:{' '}
                        <span className="text-slate-600 font-semibold">
                          {h.from_status ? h.from_status.replace('_', ' ') : 'Submitted'}
                        </span>{' '}
                        → <span className="text-teal-700 font-extrabold">{h.to_status.replace('_', ' ')}</span>
                      </>
                    )}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold flex items-center gap-1 shrink-0 ${
                      isInternal
                        ? 'bg-amber-200/90 text-amber-900 border border-amber-300 shadow-2xs'
                        : 'bg-emerald-100/90 text-emerald-900 border border-emerald-300 shadow-2xs'
                    }`}
                  >
                    {isInternal ? <Lock className="w-3 h-3 text-amber-800" /> : <Eye className="w-3 h-3 text-emerald-800" />}
                    {isInternal ? 'INTERNAL (PRIVATE)' : 'PUBLIC TIMELINE'}
                  </span>
                </div>

                {h.note && (
                  <p className={`text-xs leading-relaxed font-medium pl-5.5 ${isInternal ? 'text-amber-950 font-semibold' : 'text-slate-800'}`}>
                    {h.note}
                  </p>
                )}

                <span className="text-[10px] text-slate-400 block pt-1 font-medium pl-5.5">
                  Logged: {new Date(h.created_at).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
