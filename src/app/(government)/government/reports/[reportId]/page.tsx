import {
  addProgressNoteAction,
  assignDepartmentAction,
  changeReportStatusAction,
} from '@/features/government-management/presentation/managementActions';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';
import {
  ArrowLeft,
  Building2,
  Clock,
  MapPin,
  MessageSquare,
  Sparkles,
  User,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reportId: string }>;
}): Promise<Metadata> {
  const { reportId } = await params;
  return {
    title: `Manage Case ${reportId.substring(0, 8)} | Infrastructure AI Platform`,
  };
}

interface CandidateReport {
  tracking_code: string;
  description: string;
  final_category: string;
  submitted_at: string;
}

export default async function GovernmentReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const adminClient = createAdminClient();

  const { data: report } = await adminClient
    .from('reports')
    .select(`
      *,
      departments ( id, name )
    `)
    .eq('id', reportId)
    .single();

  if (!report) {
    notFound();
  }

  const { data: contact } = await adminClient
    .from('report_contacts')
    .select('*')
    .eq('report_id', reportId)
    .maybeSingle();

  const { data: aiAnalysis } = await adminClient
    .from('report_ai_analyses')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: rawDuplicateLinks } = await adminClient
    .from('report_duplicate_links')
    .select(`
      id,
      similarity_score,
      semantic_score,
      distance_score,
      temporal_score,
      category_score,
      status,
      candidate_report_id,
      reports!candidate_report_id ( tracking_code, description, final_category, submitted_at )
    `)
    .eq('report_id', reportId);

  const duplicateLinks = rawDuplicateLinks || [];

  const { data: departments } = await adminClient
    .from('departments')
    .select('id, name')
    .eq('is_active', true);

  const { data: historyLogs } = await adminClient
    .from('report_status_history')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/government/dashboard"
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {report.tracking_code}
              </span>
              <span className="text-xs text-slate-400">ID: {report.id}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 capitalize">
              {report.final_category.replace('_', ' ')} Issue
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Status:</span>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/20 uppercase">
            {report.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3">
              Citizen Submission Summary
            </h2>
            <p className="text-slate-100 text-sm leading-relaxed">{report.description}</p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Location: <strong className="text-slate-200">{report.location_text}</strong></span>
              {report.latitude && (
                <span className="text-slate-500">({report.latitude}, {report.longitude})</span>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-blue-900/40 rounded-3xl p-6 space-y-4 shadow-xl bg-gradient-to-b from-blue-950/20 to-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" /> AI Severity & Taxonomy Assessment
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Provider: {aiAnalysis?.provider || 'fallback'} ({aiAnalysis?.model || 'none'})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block">AI Category Confidence</span>
                <span className="text-lg font-bold text-blue-400">
                  {Math.round((aiAnalysis?.category_confidence || 0.8) * 100)}%
                </span>
              </div>
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block">Severity Score (0-100)</span>
                <span className="text-lg font-bold text-amber-400">{Math.round(report.severity_score)} / 100</span>
              </div>
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block">Severity Level</span>
                <span className="text-lg font-bold text-rose-400 capitalize">{report.severity_level}</span>
              </div>
            </div>

            {aiAnalysis?.severity_rationale && (
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-slate-300 block">AI Severity Rationale:</span>
                <p className="text-slate-400">{aiAnalysis.severity_rationale}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Potential Duplicate Reports</span>
              <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                {duplicateLinks.length} Suggested Matches
              </span>
            </h2>

            {duplicateLinks.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No duplicate candidates flagged above confidence threshold.</p>
            ) : (
              <div className="space-y-3">
                {duplicateLinks.map((link) => {
                  const cand = link.reports as unknown as CandidateReport;
                  return (
                    <div key={link.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-400">{cand?.tracking_code}</span>
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {Math.round(link.similarity_score * 100)}% Multi-Signal Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{cand?.description}</p>

                      <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                        <div>Semantic: <strong>{Math.round(link.semantic_score * 100)}%</strong></div>
                        <div>Distance: <strong>{Math.round(link.distance_score * 100)}%</strong></div>
                        <div>Temporal: <strong>{Math.round(link.temporal_score * 100)}%</strong></div>
                        <div>Category: <strong>{Math.round(link.category_score * 100)}%</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Full Audit & Activity History
            </h2>

            <div className="space-y-3">
              {(historyLogs || []).map((h) => (
                <div key={h.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 capitalize">
                      Transition: {h.from_status || 'New'} → {h.to_status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      h.visibility === 'public' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {h.visibility}
                    </span>
                  </div>
                  {h.note && <p className="text-xs text-slate-400">{h.note}</p>}
                  <span className="text-[10px] text-slate-500 block pt-1">{new Date(h.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-4 h-4 text-amber-400" /> Department Assignment
            </h3>

            <form action={assignDepartmentAction} className="space-y-3">
              <input type="hidden" name="reportId" value={reportId} />
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Assign Responsible Department</label>
                <select
                  name="departmentId"
                  defaultValue={report.assigned_department_id || ''}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="" disabled>Select Department</option>
                  {(departments || []).map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
              >
                Assign Department
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Update Case Status
            </h3>

            <form action={changeReportStatusAction} className="space-y-3">
              <input type="hidden" name="reportId" value={reportId} />
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Status Transition</label>
                <select
                  name="newStatus"
                  defaultValue={report.status}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status Note (Optional)</label>
                <input
                  type="text"
                  name="note"
                  placeholder="Reason for status change..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition"
              >
                Update Status
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Add Progress Note
            </h3>

            <form action={addProgressNoteAction} className="space-y-3">
              <input type="hidden" name="reportId" value={reportId} />
              <textarea
                name="note"
                rows={3}
                required
                placeholder="Type note or resolution commentary..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input type="radio" name="visibility" value="public" defaultChecked className="text-emerald-500" /> Public
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input type="radio" name="visibility" value="internal" className="text-amber-500" /> Internal
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
              >
                Add Progress Note
              </button>
            </form>
          </div>

          {contact && (
            <div className="bg-slate-900 border border-emerald-900/40 rounded-3xl p-6 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <User className="w-4 h-4" /> Citizen Contact Info (Confidential)
              </h3>
              <div className="space-y-1.5 text-xs text-slate-300">
                {contact.name && <div>Name: <strong className="text-white">{contact.name}</strong></div>}
                {contact.email && <div>Email: <strong className="text-white">{contact.email}</strong></div>}
                {contact.phone && <div>Phone: <strong className="text-white">{contact.phone}</strong></div>}
                <div className="text-[10px] text-slate-500 pt-1">
                  Consent given: {contact.consent_to_contact ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
