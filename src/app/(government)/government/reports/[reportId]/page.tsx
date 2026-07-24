import { DuplicateScoringEngine } from '@/features/duplicate-detection/application/DuplicateScoringEngine';
import { AuditHistoryTimeline } from '@/features/government-management/presentation/AuditHistoryTimeline';
import { DepartmentAssignmentCard } from '@/features/government-management/presentation/DepartmentAssignmentCard';
import { ProgressNoteCard } from '@/features/government-management/presentation/ProgressNoteCard';
import { StatusUpdateCard } from '@/features/government-management/presentation/StatusUpdateCard';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';
import { LanguageToggle } from '@/shared/presentation/components/LanguageToggle';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  id: string;
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
      report_id,
      candidate_report_id,
      candidate_report:reports!candidate_report_id ( id, tracking_code, description, final_category, submitted_at ),
      source_report:reports!report_id ( id, tracking_code, description, final_category, submitted_at )
    `)
    .or(`report_id.eq.${reportId},candidate_report_id.eq.${reportId}`);

  interface DuplicateLinkItem {
    id: string;
    report_id: string;
    candidate_report_id: string;
    similarity_score: number;
    semantic_score?: number | null;
    distance_score?: number | null;
    temporal_score?: number | null;
    category_score?: number | null;
    status: string;
    cand?: CandidateReport | null;
  }

  let duplicateLinks: DuplicateLinkItem[] = (rawDuplicateLinks || []).map((link) => {
    const rawCand = link.report_id === reportId ? link.candidate_report : link.source_report;
    const cand = (Array.isArray(rawCand) ? rawCand[0] : rawCand) as CandidateReport | null | undefined;
    return {
      id: link.id,
      report_id: link.report_id,
      candidate_report_id: link.candidate_report_id,
      similarity_score: link.similarity_score,
      semantic_score: link.semantic_score,
      distance_score: link.distance_score,
      temporal_score: link.temporal_score,
      category_score: link.category_score,
      status: link.status,
      cand,
    };
  });

  // Evaluate candidate reports with AI Multi-Signal engine
  interface EvaluatedCandidate {
    id?: string;
    candidate_report_id: string;
    similarity_score: number;
    semantic_score: number;
    distance_score: number;
    temporal_score: number;
    category_score: number;
    status?: string;
    isSuggested: boolean;
    cand: CandidateReport;
  }

  let evaluatedCandidates: EvaluatedCandidate[] = [];
  let candidatesScannedCount = 0;

  if (report) {
    try {
      const scorer = new DuplicateScoringEngine();
      const { data: candidates } = await adminClient
        .from('reports')
        .select('id, tracking_code, description, final_category, citizen_category, location_text, latitude, longitude, submitted_at')
        .neq('id', reportId)
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (candidates && candidates.length > 0) {
        candidatesScannedCount = candidates.length;
        for (const cand of candidates) {
          const existingLink = duplicateLinks.find(
            (link) => link.candidate_report_id === cand.id || link.report_id === cand.id || link.cand?.id === cand.id
          );

          const scoreResult = scorer.scoreCandidate(
            {
              category: report.final_category || report.citizen_category || 'other',
              latitude: report.latitude,
              longitude: report.longitude,
              locationText: report.location_text,
              submittedAt: new Date(report.submitted_at),
              description: report.description,
            },
            {
              id: cand.id,
              trackingCode: cand.tracking_code,
              description: cand.description,
              category: cand.final_category || cand.citizen_category || 'other',
              latitude: cand.latitude,
              longitude: cand.longitude,
              locationText: cand.location_text,
              submittedAt: cand.submitted_at,
            }
          );

          let linkId: string = existingLink?.id || '';
          let linkStatus = existingLink?.status;

          if (!existingLink && scoreResult.similarityScore >= 0.40) {
            let insertedLink: any = null;
            try {
              const { data: newLink } = await adminClient
                .from('report_duplicate_links')
                .insert({
                  report_id: reportId,
                  candidate_report_id: cand.id,
                  similarity_score: scoreResult.similarityScore,
                  semantic_score: scoreResult.semanticScore,
                  distance_score: scoreResult.distanceScore,
                  temporal_score: scoreResult.temporalScore,
                  category_score: scoreResult.categoryScore,
                  status: 'suggested',
                })
                .select()
                .maybeSingle();

              insertedLink = newLink;
            } catch (err) {
              console.warn('Duplicate link insertion warning:', err);
            }

            linkId = insertedLink?.id || `link-${cand.id}`;
            linkStatus = 'suggested';

            const candidateItem: DuplicateLinkItem = {
              id: linkId,
              report_id: reportId,
              candidate_report_id: cand.id,
              similarity_score: scoreResult.similarityScore,
              semantic_score: scoreResult.semanticScore,
              distance_score: scoreResult.distanceScore,
              temporal_score: scoreResult.temporalScore,
              category_score: scoreResult.categoryScore,
              status: 'suggested',
              cand: {
                id: cand.id,
                tracking_code: cand.tracking_code,
                description: cand.description,
                final_category: cand.final_category || cand.citizen_category,
                submitted_at: cand.submitted_at,
              },
            };

            duplicateLinks.push(candidateItem);
          }

          evaluatedCandidates.push({
            id: linkId,
            candidate_report_id: cand.id,
            similarity_score: existingLink ? existingLink.similarity_score : scoreResult.similarityScore,
            semantic_score: existingLink ? (existingLink.semantic_score ?? scoreResult.semanticScore) : scoreResult.semanticScore,
            distance_score: existingLink ? (existingLink.distance_score ?? scoreResult.distanceScore) : scoreResult.distanceScore,
            temporal_score: existingLink ? (existingLink.temporal_score ?? scoreResult.temporalScore) : scoreResult.temporalScore,
            category_score: existingLink ? (existingLink.category_score ?? scoreResult.categoryScore) : scoreResult.categoryScore,
            status: linkStatus,
            isSuggested: scoreResult.isSuggested || (existingLink ? existingLink.similarity_score >= 0.50 : false),
            cand: {
              id: cand.id,
              tracking_code: cand.tracking_code,
              description: cand.description,
              final_category: cand.final_category || cand.citizen_category,
              submitted_at: cand.submitted_at,
            },
          });
        }
      }
    } catch (evalErr) {
      console.warn('On-demand duplicate evaluation warning:', evalErr);
    }
  }

  duplicateLinks.sort((a, b) => b.similarity_score - a.similarity_score);
  evaluatedCandidates.sort((a, b) => b.similarity_score - a.similarity_score);

  const unflaggedCandidates = evaluatedCandidates.filter(
    (item) => !duplicateLinks.some((link) => link.candidate_report_id === item.candidate_report_id || link.cand?.id === item.candidate_report_id)
  );

  const maxSimilarityPercent = evaluatedCandidates.length > 0
    ? Math.round(Math.max(...evaluatedCandidates.map((c) => c.similarity_score)) * 100)
    : 0;

  const maxUnflaggedSimilarityPercent = unflaggedCandidates.length > 0
    ? Math.round(Math.max(...unflaggedCandidates.map((c) => c.similarity_score)) * 100)
    : 0;

  const { data: departments } = await adminClient
    .from('departments')
    .select('id, name')
    .eq('is_active', true);

  const { data: historyLogs } = await adminClient
    .from('report_status_history')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true });

  const currentAssignedDept = (departments || []).find((d) => d.id === report.assigned_department_id) ||
    (Array.isArray(report.departments) ? report.departments[0] : report.departments);
  const currentAssignedDepartmentName = currentAssignedDept?.name || null;

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

  const statusStyles: Record<string, string> = {
    submitted: 'bg-blue-50 text-blue-800 border-blue-200',
    under_review: 'bg-amber-50 text-amber-800 border-amber-200',
    assigned: 'bg-purple-50 text-purple-800 border-purple-200',
    in_progress: 'bg-sky-50 text-sky-800 border-sky-200',
    resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-800 border-rose-200',
  };

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
          {currentAssignedDepartmentName && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-950 font-extrabold text-xs rounded-full border border-purple-200 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-purple-700" />
              <span>Assigned: {currentAssignedDepartmentName}</span>
            </div>
          )}
          <span className="text-xs text-slate-500 font-bold">Status:</span>
          <span className={`px-3 py-1 font-extrabold text-xs rounded-full border uppercase shadow-sm ${statusStyles[report.status] || statusStyles.submitted}`}>
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
          <div className="admin-card rounded-3xl p-6 space-y-5 shadow-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" /> Potential Duplicate Reports & AI Multi-Signal Confidence
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {candidatesScannedCount > 0 && (
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    🔍 {candidatesScannedCount} Reports Scanned | Max Similarity: {maxSimilarityPercent}%
                  </span>
                )}
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${duplicateLinks.length > 0 ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-teal-50 text-teal-800 border-teal-200'}`}>
                  {duplicateLinks.length} {duplicateLinks.length === 1 ? 'Match Flagged' : 'Matches Flagged'}
                </span>
              </div>
            </div>

            {duplicateLinks.length === 0 ? (
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>AI Multi-Signal Duplicate Analysis Summary</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The AI engine evaluated <strong>{candidatesScannedCount} candidate reports</strong> across 4 weighted signals (Semantic text similarity, Geographic proximity, Temporal decay, and Category match).
                    {candidatesScannedCount > 0 ? (
                      <> No candidate reports met or exceeded the <strong>50% confidence threshold</strong> required for automated duplicate flagging. The highest similarity score found among non-flagged candidates was <strong>{maxUnflaggedSimilarityPercent}%</strong>.</>
                    ) : (
                      <> No other candidate reports currently exist in the database to compare against.</>
                    )}
                  </p>
                </div>

                {unflaggedCandidates.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                      Top Evaluated Candidate Reports & Similarity Signals (Below 50% Threshold)
                    </span>
                    <div className="space-y-4">
                      {unflaggedCandidates.slice(0, 3).map((item) => {
                        const cand = item.cand;
                        const overallPercent = Math.round(item.similarity_score * 100);
                        const semScore = Math.round(item.semantic_score * 100);
                        const distScore = Math.round(item.distance_score * 100);
                        const tempScore = Math.round(item.temporal_score * 100);
                        const catScore = Math.round(item.category_score * 100);

                        return (
                          <div
                            key={item.candidate_report_id}
                            className="p-5 bg-gradient-to-br from-slate-50/70 via-white to-slate-50/40 border border-slate-200 rounded-2xl space-y-4 shadow-sm hover:border-slate-300 transition"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-semibold">Candidate:</span>
                                <Link
                                  href={`/government/reports/${cand.id}`}
                                  className="font-mono text-sm font-bold text-teal-800 hover:text-teal-950 hover:underline flex items-center gap-1.5"
                                >
                                  <span>{cand.tracking_code}</span>
                                  {cand.final_category && (
                                    <span className="text-xs text-slate-500 font-medium capitalize">
                                      ({cand.final_category.replace('_', ' ')})
                                    </span>
                                  )}
                                </Link>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs bg-slate-100 text-slate-800 border-slate-300">
                                  {overallPercent}% Match — Below Threshold
                                </span>
                              </div>
                            </div>

                            {cand.description && (
                              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Candidate Issue Description</span>
                                <p className="text-xs text-slate-800 leading-relaxed line-clamp-2">{cand.description}</p>
                              </div>
                            )}

                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Evaluated AI Signal Breakdown
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
                                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5 shadow-2xs">
                                  <div className="flex items-center justify-between text-[11px] font-extrabold text-blue-950">
                                    <span>🧠 Semantic Similarity</span>
                                    <span className="text-blue-700 font-black text-xs">{semScore}%</span>
                                  </div>
                                  <div className="w-full bg-blue-200/80 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${semScore}%` }} />
                                  </div>
                                  <span className="text-[10px] text-blue-800/80 block font-bold">(45% Weight)</span>
                                </div>

                                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5 shadow-2xs">
                                  <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-950">
                                    <span>📍 Geographic Proximity</span>
                                    <span className="text-emerald-700 font-black text-xs">{distScore}%</span>
                                  </div>
                                  <div className="w-full bg-emerald-200/80 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${distScore}%` }} />
                                  </div>
                                  <span className="text-[10px] text-emerald-800/80 block font-bold">(30% Weight)</span>
                                </div>

                                <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1.5 shadow-2xs">
                                  <div className="flex items-center justify-between text-[11px] font-extrabold text-purple-950">
                                    <span>⏱️ Temporal Decay</span>
                                    <span className="text-purple-700 font-black text-xs">{tempScore}%</span>
                                  </div>
                                  <div className="w-full bg-purple-200/80 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${tempScore}%` }} />
                                  </div>
                                  <span className="text-[10px] text-purple-800/80 block font-bold">(15% Weight)</span>
                                </div>

                                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5 shadow-2xs">
                                  <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-950">
                                    <span>🏷️ Category Match</span>
                                    <span className="text-amber-700 font-black text-xs">{catScore}%</span>
                                  </div>
                                  <div className="w-full bg-amber-200/80 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{ width: `${catScore}%` }} />
                                  </div>
                                  <span className="text-[10px] text-amber-800/80 block font-bold">(10% Weight)</span>
                                </div>
                              </div>
                            </div>


                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {duplicateLinks.map((link) => {
                  const cand = link.cand;
                  const overallPercent = Math.round(link.similarity_score * 100);

                  const getConfidenceLabel = (score: number) => {
                    if (score >= 0.70) return { label: 'High Confidence Match', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
                    if (score >= 0.50) return { label: 'Medium Confidence Match', color: 'bg-amber-100 text-amber-900 border-amber-300' };
                    return { label: 'Low / Partial Match', color: 'bg-slate-100 text-slate-800 border-slate-300' };
                  };

                  const conf = getConfidenceLabel(link.similarity_score);

                  const statusBadges = {
                    suggested: 'bg-amber-50 text-amber-800 border-amber-300',
                    confirmed: 'bg-rose-50 text-rose-800 border-rose-300',
                    rejected: 'bg-slate-100 text-slate-600 border-slate-300',
                  };

                  return (
                    <div
                      key={link.id}
                      className="p-5 bg-gradient-to-br from-slate-50/70 via-white to-slate-50/40 border border-slate-200 rounded-2xl space-y-4 shadow-sm hover:border-slate-300 transition"
                    >
                      {/* Top Header: Candidate Tracking & Overall Confidence */}
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-semibold">Candidate:</span>
                          {cand?.id ? (
                            <Link
                              href={`/government/reports/${cand.id}`}
                              className="font-mono text-sm font-bold text-teal-800 hover:text-teal-950 hover:underline flex items-center gap-1.5"
                            >
                              <span>{cand.tracking_code}</span>
                              {cand.final_category && (
                                <span className="text-xs text-slate-500 font-medium capitalize">
                                  ({cand.final_category.replace('_', ' ')})
                                </span>
                              )}
                            </Link>
                          ) : (
                            <span className="font-mono text-sm font-bold text-teal-800">{cand?.tracking_code || 'Candidate Case'}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${statusBadges[link.status as keyof typeof statusBadges] || statusBadges.suggested}`}>
                            Link: {link.status}
                          </span>
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-sm ${conf.color}`}>
                            {overallPercent}% Match — {conf.label}
                          </span>
                        </div>
                      </div>

                      {/* Candidate Description */}
                      {cand?.description && (
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Candidate Issue Description</span>
                          <p className="text-xs text-slate-800 leading-relaxed line-clamp-2">{cand.description}</p>
                        </div>
                      )}

                      {/* Similarity Tokens & Breakdown Grid */}
                      {(() => {
                        const semScore = Math.round((typeof link.semantic_score === 'number' && !isNaN(link.semantic_score) ? link.semantic_score : 0.5) * 100);
                        const distScore = Math.round((typeof link.distance_score === 'number' && !isNaN(link.distance_score) ? link.distance_score : 0.5) * 100);
                        const tempScore = Math.round((typeof link.temporal_score === 'number' && !isNaN(link.temporal_score) ? link.temporal_score : 1.0) * 100);
                        const catScore = Math.round((typeof link.category_score === 'number' && !isNaN(link.category_score) ? link.category_score : 1.0) * 100);

                        return (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                              AI Similarity Tokens & Signal Breakdown
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
                              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5 shadow-2xs">
                                <div className="flex items-center justify-between text-[11px] font-extrabold text-blue-950">
                                  <span>🧠 Semantic Similarity</span>
                                  <span className="text-blue-700 font-black text-xs">{semScore}%</span>
                                </div>
                                <div className="w-full bg-blue-200/80 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${semScore}%` }} />
                                </div>
                                <span className="text-[10px] text-blue-800/80 block font-bold">(45% Weight)</span>
                              </div>

                              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5 shadow-2xs">
                                <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-950">
                                  <span>📍 Geographic Proximity</span>
                                  <span className="text-emerald-700 font-black text-xs">{distScore}%</span>
                                </div>
                                <div className="w-full bg-emerald-200/80 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${distScore}%` }} />
                                </div>
                                <span className="text-[10px] text-emerald-800/80 block font-bold">(30% Weight)</span>
                              </div>

                              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1.5 shadow-2xs">
                                <div className="flex items-center justify-between text-[11px] font-extrabold text-purple-950">
                                  <span>⏱️ Temporal Decay</span>
                                  <span className="text-purple-700 font-black text-xs">{tempScore}%</span>
                                </div>
                                <div className="w-full bg-purple-200/80 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${tempScore}%` }} />
                                </div>
                                <span className="text-[10px] text-purple-800/80 block font-bold">(15% Weight)</span>
                              </div>

                              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5 shadow-2xs">
                                <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-950">
                                  <span>🏷️ Category Match</span>
                                  <span className="text-amber-700 font-black text-xs">{catScore}%</span>
                                </div>
                                <div className="w-full bg-amber-200/80 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{ width: `${catScore}%` }} />
                                </div>
                                <span className="text-[10px] text-amber-800/80 block font-bold">(10% Weight)</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}


                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full Audit & Activity History */}
          <AuditHistoryTimeline logs={historyLogs || []} />
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Department Assignment Card with AI Suggestion */}
          <DepartmentAssignmentCard
            reportId={reportId}
            currentAssignedDeptName={currentAssignedDepartmentName}
            currentAssignedDeptId={report.assigned_department_id}
            suggestedDeptName={suggestedDepartmentName || null}
            suggestedDeptId={suggestedDepartmentId || null}
            departments={departments || []}
          />

          {/* Update Case Status Card */}
          <StatusUpdateCard
            reportId={reportId}
            currentStatus={report.status}
          />

          {/* Add Progress Note Card */}
          <ProgressNoteCard
            reportId={reportId}
          />

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
