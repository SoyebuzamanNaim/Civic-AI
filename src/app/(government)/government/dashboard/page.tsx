import { logoutOfficialAction } from '@/features/government-management/presentation/authActions';
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <RealtimeDashboardListener />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Operations overview</h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Realtime Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prioritize incoming reports, coordinate ownership, and keep residents informed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link
            href="/report/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" /> New report
          </Link>
          <form action={logoutOfficialAction}>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" /> Geographic Incident Heatmap & Live Pins
        </h2>
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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" /> Total Active Reports
          </span>
          <span className="text-3xl font-extrabold text-white block">{totalCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Critical Severity
          </span>
          <span className="text-3xl font-extrabold text-rose-400 block">{criticalCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-400" /> Unassigned Cases
          </span>
          <span className="text-3xl font-extrabold text-amber-400 block">{unassignedCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" /> In Progress
          </span>
          <span className="text-3xl font-extrabold text-emerald-400 block">{inProgressCount}</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <form method="GET" className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              name="query"
              defaultValue={query || ''}
              placeholder="Search tracking code, description, or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            name="status"
            defaultValue={status || ''}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            name="severity"
            defaultValue={severity || ''}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition"
          >
            Apply Filters
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tracking Code</th>
                <th className="py-3.5 px-4">Category & Summary</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No reports match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{r.tracking_code}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-100 capitalize">
                        {r.final_category.replace('_', ' ')}
                      </div>
                      <div className="text-slate-400 truncate text-[11px] mt-0.5">{r.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{r.location_text}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          r.severity_level === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : r.severity_level === 'high'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {r.severity_level} ({Math.round(r.severity_score)})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-[10px] font-semibold capitalize border border-slate-700">
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-400">
                        {r.departments?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/government/reports/${r.id}`}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition"
                      >
                        Inspect & Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
