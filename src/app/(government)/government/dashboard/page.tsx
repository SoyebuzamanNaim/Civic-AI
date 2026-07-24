import { logoutOfficialAction } from '@/features/government-management/presentation/authActions';
import { ExecutiveSummaryModal } from '@/features/government-management/presentation/ExecutiveSummaryModal';
import { RealtimeDashboardListener } from '@/features/government-management/presentation/RealtimeDashboardListener';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';
import { LanguageToggle } from '@/shared/presentation/components/LanguageToggle';
import { InteractiveMap } from '@/shared/presentation/components/InteractiveMap';
import {
  AlertTriangle,
  Building2,
  Clock,
  Layers,
  LogOut,
  PlusCircle,
  Search,
  MapPin,
  Shield,
  Activity,
  Filter,
  RotateCcw,
  ChevronRight,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Government Operational Dashboard | Infrastructure AI Platform',
  description: 'Manage civic reports, review AI severity assessments, assign departments, and track issue resolution.',
};

interface ReportWithDept {
  id: string;
  tracking_code: string;
  description: string;
  final_category: string;
  status: string;
  severity_level: string;
  severity_score: number;
  location_text: string;
  submitted_at: string;
  assigned_department_id: string | null;
  needs_manual_review: boolean;
  departments: { name: string } | null;
}

export default async function GovernmentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string; severity?: string }>;
}) {
  const { query, status, severity } = await searchParams;
  const adminClient = createAdminClient();

  const { data: allReports } = await adminClient.from('reports').select('status, severity_level, assigned_department_id');
  const totalCount = allReports?.length || 0;
  const criticalCount = allReports?.filter((r) => r.severity_level === 'critical').length || 0;
  const unassignedCount = allReports?.filter((r) => !r.assigned_department_id).length || 0;
  const inProgressCount = allReports?.filter((r) => r.status === 'in_progress').length || 0;

  let dbQuery = adminClient
    .from('reports')
    .select(`
      id,
      tracking_code,
      description,
      final_category,
      status,
      severity_level,
      severity_score,
      location_text,
      submitted_at,
      assigned_department_id,
      needs_manual_review,
      departments ( name )
    `)
    .order('submitted_at', { ascending: false });

  if (status) {
    dbQuery = dbQuery.eq('status', status);
  }
  if (severity) {
    dbQuery = dbQuery.eq('severity_level', severity);
  }

  const { data: rawReports } = await dbQuery.limit(50);
  const reports = (rawReports as unknown as ReportWithDept[]) || [];

  const filteredReports = reports.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.tracking_code.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.location_text.toLowerCase().includes(q)
    );
  });

  const hasActiveFilters = Boolean(query || status || severity);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-teal-500/30 selection:text-teal-200">
      <RealtimeDashboardListener />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-teal-400/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">CivicPulse Operations</h1>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Realtime Sync
                </span>
                <span className="px-3 py-1 bg-slate-800/80 text-slate-300 text-xs font-medium rounded-full border border-slate-700/80 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Admin Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time incident dispatch, AI automated assessment, and multi-agency coordination portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <LanguageToggle />
            <ExecutiveSummaryModal />
            <Link
              href="/report/new"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" /> New Report
            </Link>
            <form action={logoutOfficialAction}>
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 transition hover:text-white"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card admin-glow-blue rounded-2xl p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" /> Total Incidents
              </span>
              <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Activity className="w-4 h-4 text-blue-400" />
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-white">{totalCount}</span>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-700/50">
                Active Pool
              </span>
            </div>
          </div>

          <div className="admin-card admin-glow-critical rounded-2xl p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" /> Critical Severity
              </span>
              <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-rose-400">{criticalCount}</span>
              <span className="text-[11px] font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                Immediate Action Required
              </span>
            </div>
          </div>

          <div className="admin-card admin-glow-amber rounded-2xl p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" /> Unassigned Cases
              </span>
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Building2 className="w-4 h-4 text-amber-400" />
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-amber-400">{unassignedCount}</span>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                Needs Dispatcher
              </span>
            </div>
          </div>

          <div className="admin-card admin-glow-emerald rounded-2xl p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> In Progress
              </span>
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Clock className="w-4 h-4 text-emerald-400" />
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400">{inProgressCount}</span>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                Field Teams Active
              </span>
            </div>
          </div>
        </section>

        {/* Heatmap Section */}
        <section className="admin-card rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" /> Geographic Incident Heatmap & Live Dispatch Pins
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time geospatial positioning of reported hazards and active infrastructure tickets.
              </p>
            </div>
            <span className="px-3 py-1 bg-teal-500/10 text-teal-300 text-xs font-bold rounded-xl border border-teal-500/20 w-fit">
              {filteredReports.length} Map Pin(s) Rendered
            </span>
          </div>

          <InteractiveMap
            reports={filteredReports.map((r) => ({
              id: r.id,
              trackingCode: r.tracking_code,
              description: r.description,
              category: r.final_category,
              severityLevel: r.severity_level,
              severityScore: r.severity_score,
              locationText: r.location_text,
              status: r.status,
              departmentName: r.departments?.name,
            }))}
          />
        </section>

        {/* Filter Controls Bar */}
        <section className="admin-card rounded-2xl p-4 shadow-xl">
          <form method="GET" className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 w-full max-w-lg">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="query"
                  defaultValue={query || ''}
                  placeholder="Search by tracking code, keywords, or location..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-44">
                  <select
                    name="status"
                    defaultValue={status || ''}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    <option value="">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="relative flex-1 sm:w-44">
                  <select
                    name="severity"
                    defaultValue={severity || ''}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical (90+)</option>
                    <option value="high">High (70+)</option>
                    <option value="medium">Medium (40+)</option>
                    <option value="low">Low (&lt;40)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              {hasActiveFilters && (
                <Link
                  href="/government/dashboard"
                  className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </Link>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition flex items-center gap-2"
              >
                <Filter className="w-3.5 h-3.5" /> Apply Filters
              </button>
            </div>
          </form>
        </section>

        {/* Data Table */}
        <section className="admin-card rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" /> Operational Incident Queue ({filteredReports.length})
            </h2>
            <span className="text-xs text-slate-400">Showing up to 50 active reports</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-5">Tracking Code</th>
                  <th className="py-4 px-5">Category & Description</th>
                  <th className="py-4 px-5">Location</th>
                  <th className="py-4 px-5">AI Severity</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Assigned Department</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                      <Layers className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="font-semibold">No reports match the current criteria.</p>
                      <p className="text-[11px]">Try adjusting your search query or severity filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-5 font-mono font-bold text-teal-400">
                        <div className="flex items-center gap-1.5">
                          <span>{r.tracking_code}</span>
                          {r.needs_manual_review && (
                            <span className="w-2 h-2 rounded-full bg-amber-400" title="Flagged for manual review" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-bold text-slate-100 capitalize">
                          {r.final_category.replace('_', ' ')}
                        </div>
                        <div className="text-slate-400 truncate text-[11px] mt-0.5" title={r.description}>
                          {r.description}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-300 max-w-xs truncate" title={r.location_text}>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{r.location_text}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] inline-flex items-center gap-1.5 ${
                            r.severity_level === 'critical'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : r.severity_level === 'high'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                          }`}
                        >
                          {r.severity_level === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
                          {r.severity_level} ({Math.round(r.severity_score)})
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 bg-slate-800/80 text-slate-200 rounded-full text-[10px] font-bold capitalize border border-slate-700/80 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {r.departments?.name ? (
                          <span className="text-slate-300 font-medium">{r.departments.name}</span>
                        ) : (
                          <span className="text-amber-400 text-[11px] font-semibold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/government/reports/${r.id}`}
                          className="px-3.5 py-1.5 bg-teal-600/20 hover:bg-teal-600/40 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold transition inline-flex items-center gap-1"
                        >
                          Inspect & Manage <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

