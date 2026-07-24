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
  latitude?: number;
  longitude?: number;
  submitted_at: string;
  assigned_department_id: string | null;
  needs_manual_review: boolean;
  departments: { name: string } | null;
}

import { BrandLogo } from '@/shared/presentation/components/BrandLogo';

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
      latitude,
      longitude,
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
    <div className="public-page min-h-screen text-slate-900 p-4 sm:p-6 lg:p-8 selection:bg-teal-100 selection:text-teal-900">
      <RealtimeDashboardListener />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-4">
            <BrandLogo size="lg" href="/government/dashboard" />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> Realtime Sync
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-700" /> Admin Access
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Real-time incident dispatch, AI automated assessment, and multi-agency coordination portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <LanguageToggle />
            <ExecutiveSummaryModal />
            <Link
              href="/report/new"
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-teal-900/15 transition hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" /> New Report
            </Link>
            <form action={logoutOfficialAction}>
              <button
                type="submit"
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card admin-glow-blue rounded-2xl p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-white border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700" /> Total Incidents
              </span>
              <span className="p-2 rounded-xl bg-blue-100/80 border border-blue-200">
                <Activity className="w-4 h-4 text-blue-700" />
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-950">{totalCount}</span>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                Active Pool
              </span>
            </div>
          </div>

          <div className="admin-card admin-glow-critical rounded-2xl p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-rose-50/80 via-white to-white border-rose-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" /> Critical Severity
              </span>
              <span className="p-2 rounded-xl bg-rose-100/80 border border-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-rose-700">{criticalCount}</span>
              <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                Immediate Action Required
              </span>
            </div>
          </div>

          <div className="admin-card admin-glow-amber rounded-2xl p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-amber-50/80 via-white to-white border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-700" /> Unassigned Cases
              </span>
              <span className="p-2 rounded-xl bg-amber-100/80 border border-amber-200">
                <Building2 className="w-4 h-4 text-amber-700" />
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-800">{unassignedCount}</span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                Needs Dispatcher
              </span>
            </div>
          </div>

          <div className="admin-card admin-glow-emerald rounded-2xl p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-white to-white border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" /> In Progress
              </span>
              <span className="p-2 rounded-xl bg-emerald-100/80 border border-emerald-200">
                <Clock className="w-4 h-4 text-emerald-700" />
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-800">{inProgressCount}</span>
              <span className="text-[11px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                Field Teams Active
              </span>
            </div>
          </div>
        </section>

        {/* Heatmap Section */}
        <section className="admin-card rounded-3xl p-6 space-y-4 shadow-xl">
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
              latitude: r.latitude,
              longitude: r.longitude,
            }))}
          />
        </section>

        {/* Filter Controls Bar */}
        <section className="admin-card rounded-2xl p-4 shadow-lg">
          <form method="GET" className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 w-full max-w-lg">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="query"
                  defaultValue={query || ''}
                  placeholder="Search by tracking code, keywords, or location..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 transition shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-44">
                  <select
                    name="status"
                    defaultValue={status || ''}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold shadow-sm"
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold shadow-sm"
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
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </Link>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-900/15 transition flex items-center gap-2"
              >
                <Filter className="w-3.5 h-3.5" /> Apply Filters
              </button>
            </div>
          </form>
        </section>

        {/* Data Table */}
        <section className="admin-card rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 bg-slate-50/50">
            <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" /> Operational Incident Queue ({filteredReports.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">Showing up to 50 active reports</span>
          </div>

          {/* Mobile Card List (Smarthones) */}
          <div className="block md:hidden divide-y divide-slate-200 bg-white">
            {filteredReports.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2 p-4">
                <Layers className="w-8 h-8 mx-auto text-slate-400" />
                <p className="font-bold text-slate-800">No reports match the current criteria.</p>
                <p className="text-[11px] text-slate-500">Try adjusting your search query or severity filters.</p>
              </div>
            ) : (
              filteredReports.map((r) => (
                <div key={r.id} className="p-4 space-y-3 hover:bg-slate-50/80 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-teal-800 flex items-center gap-1.5">
                      <span>{r.tracking_code}</span>
                      {r.needs_manual_review && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title="Flagged for manual review" />
                      )}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] inline-flex items-center gap-1 ${
                        r.severity_level === 'critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : r.severity_level === 'high'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-teal-100 text-teal-800 border border-teal-300'
                      }`}
                    >
                      {r.severity_level} ({Math.round(r.severity_score)})
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-950 capitalize">{r.final_category.replace('_', ' ')}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{r.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span className="truncate">{r.location_text}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold capitalize border border-slate-200">
                        {r.status.replace('_', ' ')}
                      </span>
                      {r.departments?.name ? (
                        <span className="text-[11px] font-bold text-slate-800">{r.departments.name}</span>
                      ) : (
                        <span className="text-amber-800 text-[10px] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/government/reports/${r.id}`}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-sm shrink-0"
                    >
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] tracking-wider font-extrabold">
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
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                      <Layers className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="font-bold text-slate-800">No reports match the current criteria.</p>
                      <p className="text-[11px] text-slate-500">Try adjusting your search query or severity filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-5 font-mono font-bold text-teal-800">
                        <div className="flex items-center gap-1.5">
                          <span>{r.tracking_code}</span>
                          {r.needs_manual_review && (
                            <span className="w-2 h-2 rounded-full bg-amber-500" title="Flagged for manual review" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-extrabold text-slate-950 capitalize">
                          {r.final_category.replace('_', ' ')}
                        </div>
                        <div className="text-slate-600 truncate text-[11px] mt-0.5" title={r.description}>
                          {r.description}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-700 max-w-xs truncate" title={r.location_text}>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span className="truncate font-medium">{r.location_text}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] inline-flex items-center gap-1.5 ${
                            r.severity_level === 'critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : r.severity_level === 'high'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-teal-100 text-teal-800 border border-teal-300'
                          }`}
                        >
                          {r.severity_level === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />}
                          {r.severity_level} ({Math.round(r.severity_score)})
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-[10px] font-bold capitalize border border-slate-200 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {r.departments?.name ? (
                          <span className="text-slate-900 font-bold">{r.departments.name}</span>
                        ) : (
                          <span className="text-amber-800 text-[11px] font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/government/reports/${r.id}`}
                          className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-sm"
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
