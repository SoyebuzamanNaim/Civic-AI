import {
  addProgressNoteAction,
  assignDepartmentAction,
  changeReportStatusAction,
} from '@/features/government-management/presentation/managementActions';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';
import { LanguageToggle } from '@/shared/presentation/components/LanguageToggle';
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

  // AI Auto-Suggestion Logic for Department Assignment
  let suggestedDepartmentId = '';
  let suggestedDepartmentName = '';

  const deptRecommendationText = aiAnalysis?.department_recommendation?.toLowerCase() || '';

  if (deptRecommendationText) {
    const matched = (departments || []).find(
      (d) => deptRecommendationText.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(deptRecommendationText)
    );
    if (matched) {
      suggestedDepartmentId = matched.id;
      suggestedDepartmentName = matched.name;
    }
  }

  if (!suggestedDepartmentId) {
    const categoryMap: Record<string, string> = {
      pothole: 'Roads & Highways Department',
      broken_streetlight: 'Street Lighting & Power',
      water_leak: 'Water & Sewerage Authority',
      illegal_dumping: 'Waste Management & Sanitation',
      other: 'General Public Works',
    };
    const targetName = categoryMap[report.final_category] || 'General Public Works';
    const matched = (departments || []).find((d) => d.name.toLowerCase() === targetName.toLowerCase());
    if (matched) {
      suggestedDepartmentId = matched.id;
      suggestedDepartmentName = matched.name;
    }
  }

  const defaultDepartmentValue = report.assigned_department_id || suggestedDepartmentId;

  return (
    <div className="public-page min-h-screen text-slate-900 p-4 sm:p-6 lg:p-8 space-y-8 selection:bg-teal-100 selection:text-teal-900">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/government/dashboard"
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-600 hover:text-slate-950 transition shadow-sm"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/government/dashboard"
                className="text-xs font-extrabold text-teal-800 bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200 hover:bg-teal-100 transition shadow-sm flex items-center gap-1"
              >
                CivicPulse Operations
              </Link>
              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {report.tracking_code}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">ID: {report.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 capitalize tracking-tight">
              {report.final_category.replace('_', ' ')} Issue
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <LanguageToggle />
          <span className="text-xs text-slate-500 font-bold">Status:</span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200 uppercase shadow-sm">
            {report.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Citizen Submission Summary Card */}
          <div className="admin-card rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-3">
              Citizen Submission Summary
            </h2>
            <p className="text-slate-800 text-sm leading-relaxed">{report.description}</p>

            <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
              <MapPin className="w-4 h-4 text-teal-700" />
              <span>Location: <strong className="text-slate-950">{report.location_text}</strong></span>
              {report.latitude && (
                <span className="text-slate-500 font-mono">({report.latitude}, {report.longitude})</span>
              )}
            </div>
          </div>

          {/* AI Severity & Assessment Card */}
          <div className="bg-gradient-to-br from-blue-50/60 via-white to-white border border-blue-200 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                <Sparkles className="w-5 h-5 text-blue-700" /> AI Severity & Taxonomy Assessment
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-medium">
                Provider: {aiAnalysis?.provider || 'fallback'} ({aiAnalysis?.model || 'none'})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold block">AI Category Confidence</span>
                <span className="text-lg font-extrabold text-blue-700">
                  {Math.round((aiAnalysis?.category_confidence || 0.8) * 100)}%
                </span>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold block">Severity Score (0-100)</span>
                <span className="text-lg font-extrabold text-amber-700">{Math.round(report.severity_score)} / 100</span>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold block">Severity Level</span>
                <span className="text-lg font-extrabold text-rose-700 capitalize">{report.severity_level}</span>
              </div>
            </div>

            {aiAnalysis?.severity_rationale && (
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs space-y-1 shadow-sm">
                <span className="font-extrabold text-slate-900 block">AI Severity Rationale:</span>
                <p className="text-slate-600 leading-relaxed">{aiAnalysis.severity_rationale}</p>
              </div>
            )}

            {/* AI Actionable Resolution Steps */}
            {(() => {
              const rawSteps = (aiAnalysis?.raw_output as { actionableResolutionSteps?: string[] } | null)?.actionableResolutionSteps;
              const steps = rawSteps && rawSteps.length > 0 ? rawSteps : [
                `Dispatch municipal ${report.final_category.replace('_', ' ')} inspection team to ${report.location_text}.`,
                `Issue immediate priority tag (${report.severity_level.toUpperCase()} - Score: ${Math.round(report.severity_score)}/100) and isolate hazardous zone.`,
                `Coordinate with assigned agency for structural repair and log completion verification.`,
              ];
              return (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                  <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" /> AI Recommended Action Plan & Resolution Steps
                  </h3>
                  <ol className="space-y-1.5 text-xs text-emerald-950 list-decimal list-inside pl-1 font-medium">
                    {steps.map((step: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
              );
            })()}
          </div>

          {/* Potential Duplicate Reports Card */}
          <div className="admin-card rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center justify-between">
              <span>Potential Duplicate Reports</span>
              <span className="text-xs text-blue-800 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
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
                    <div key={link.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-teal-800">{cand?.tracking_code}</span>
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {Math.round(link.similarity_score * 100)}% Multi-Signal Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2">{cand?.description}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200 text-center font-medium">
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

          {/* Full Audit & Activity History */}
          <div className="admin-card rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" /> Full Audit & Activity History
            </h2>

            <div className="space-y-3">
              {(historyLogs || []).map((h) => (
                <div key={h.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 capitalize">
                      Transition: {h.from_status || 'New'} → {h.to_status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                      h.visibility === 'public' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {h.visibility}
                    </span>
                  </div>
                  {h.note && <p className="text-xs text-slate-600">{h.note}</p>}
                  <span className="text-[10px] text-slate-400 block pt-1 font-medium">{new Date(h.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Department Assignment Card with AI Suggestion */}
          <div className="admin-card rounded-3xl p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Building2 className="w-4 h-4 text-amber-600" /> Department Assignment
            </h3>

            {/* AI Suggestion Highlight Banner */}
            {suggestedDepartmentName && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 shadow-sm">
                <div className="flex items-center justify-between gap-1 text-xs">
                  <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" /> AI Auto-Suggested
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-md border border-amber-300">
                    AI Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-bold">{suggestedDepartmentName}</p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Suggested based on reported issue category and automated infrastructure taxonomy.
                </p>
              </div>
            )}

            <form action={assignDepartmentAction} className="space-y-3">
              <input type="hidden" name="reportId" value={reportId} />
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Responsible Department
                </label>
                <select
                  name="departmentId"
                  defaultValue={defaultDepartmentValue}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                >
                  <option value="" disabled>Select Department</option>
                  {(departments || []).map((d) => {
                    const isAiSuggested = d.id === suggestedDepartmentId;
                    return (
                      <option key={d.id} value={d.id}>
                        {d.name} {isAiSuggested ? '✨ (AI Suggested)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-900/15 transition flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-4 h-4" /> Assign Department
              </button>
            </form>
          </div>

          {/* Update Case Status Card */}
          <div className="admin-card rounded-3xl p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-950 border-b border-slate-200 pb-3">
              Update Case Status
            </h3>

            <form action={changeReportStatusAction} className="space-y-3">
              <input type="hidden" name="reportId" value={reportId} />
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Status Transition</label>
                <select
                  name="newStatus"
                  defaultValue={report.status}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm"
                >
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Note (Optional)</label>
                <input
                  type="text"
                  name="note"
                  placeholder="Reason for status change..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-teal-900/15 transition"
              >
                Update Status
              </button>
            </form>
          </div>

          {/* Add Progress Note Card */}
          <div className="admin-card rounded-3xl p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-950 border-b border-slate-200 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" /> Add Progress Note
            </h3>

            <form action={addProgressNoteAction} className="space-y-3">
              <input type="hidden" name="reportId" value={reportId} />
              <textarea
                name="note"
                rows={3}
                required
                placeholder="Type note or resolution commentary..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm font-medium"
              />

              <div className="flex items-center gap-4 text-xs font-bold">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                  <input type="radio" name="visibility" value="public" defaultChecked className="text-emerald-600" /> Public
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                  <input type="radio" name="visibility" value="internal" className="text-amber-600" /> Internal
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-900/15 transition"
              >
                Add Progress Note
              </button>
            </form>
          </div>

          {/* Citizen Contact Info */}
          {contact && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 space-y-3 shadow-xl">
              <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-200 pb-2">
                <User className="w-4 h-4 text-emerald-700" /> Citizen Contact Info (Confidential)
              </h3>
              <div className="space-y-1.5 text-xs text-emerald-950 font-semibold">
                {contact.name && <div>Name: <strong className="text-slate-950 font-bold">{contact.name}</strong></div>}
                {contact.email && <div>Email: <strong className="text-slate-950 font-bold">{contact.email}</strong></div>}
                {contact.phone && <div>Phone: <strong className="text-slate-950 font-bold">{contact.phone}</strong></div>}
                <div className="text-[10px] text-emerald-800 pt-1 font-bold">
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
