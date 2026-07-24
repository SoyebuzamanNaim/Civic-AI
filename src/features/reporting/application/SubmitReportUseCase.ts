import { GeminiReportAnalysisAdapter } from '@/features/ai-analysis/infrastructure/GeminiReportAnalysisAdapter';
import { DuplicateScoringEngine } from '@/features/duplicate-detection/application/DuplicateScoringEngine';
import { generateTrackingCode } from '@/features/reporting/domain/generateTrackingCode';
import { CitizenReportFormInput } from '@/features/reporting/presentation/validationSchema';
import { err, ok, Result } from '@/shared/domain/Result';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';

export interface SubmitReportSuccessOutput {
  reportId: string;
  trackingCode: string;
  category: string;
  summary: string;
  severityLevel: string;
  suggestedDuplicatesCount: number;
}

export class SubmitReportUseCase {
  private aiAdapter: GeminiReportAnalysisAdapter;
  private duplicateScorer: DuplicateScoringEngine;

  constructor() {
    this.aiAdapter = new GeminiReportAnalysisAdapter();
    this.duplicateScorer = new DuplicateScoringEngine();
  }

  async execute(input: CitizenReportFormInput): Promise<Result<SubmitReportSuccessOutput>> {
    try {
      const trackingCode = generateTrackingCode();

      // 1. Execute AI Structured Analysis (with timeout & fallback guard)
      const aiAnalysis = await this.aiAdapter.analyzeReport(
        input.description,
        input.locationText,
        input.citizenCategory
      );

      const adminClient = createAdminClient();

      // 2. Execute Atomic Postgres Report Creation RPC Transaction
      const { data: reportId, error: rpcError } = await adminClient.rpc(
        'create_citizen_report_transaction',
        {
          p_tracking_code: trackingCode,
          p_description: input.description,
          p_citizen_category: input.citizenCategory || null,
          p_location_text: input.locationText,
          p_latitude: input.latitude || null,
          p_longitude: input.longitude || null,
          p_contact_name: input.contactName || null,
          p_contact_email: input.contactEmail || null,
          p_contact_phone: input.contactPhone || null,
          p_consent_contact: input.consentToContact || false,
          p_ai_summary: aiAnalysis.summary,
          p_ai_category: aiAnalysis.category,
          p_category_confidence: aiAnalysis.categoryConfidence,
          p_severity_level: aiAnalysis.severityLevel,
          p_severity_score: aiAnalysis.severityScore,
          p_severity_rationale: aiAnalysis.severityRationale,
          p_provider: aiAnalysis.provider,
          p_model: aiAnalysis.model,
          p_prompt_version: aiAnalysis.promptVersion,
        }
      );

      if (rpcError || !reportId) {
        console.error('RPC Report Creation Error:', rpcError);
        return err(new Error(rpcError?.message || 'Failed to persist report in database.'));
      }

      // 3. Multi-Signal Duplicate Detection (Non-blocking search)
      let duplicatesCount = 0;
      try {
        const { data: candidateRows } = await adminClient
          .from('reports')
          .select('id, tracking_code, description, final_category, latitude, longitude, submitted_at')
          .neq('id', reportId)
          .order('submitted_at', { ascending: false })
          .limit(20);

        if (candidateRows && candidateRows.length > 0) {
          const submissionEmbedding = await this.aiAdapter.generateEmbedding(input.description);
          const submittedAt = new Date();

          for (const cand of candidateRows) {
            const scoreResult = this.duplicateScorer.scoreCandidate(
              {
                category: aiAnalysis.category,
                latitude: input.latitude,
                longitude: input.longitude,
                submittedAt,
                embedding: submissionEmbedding,
              },
              {
                id: cand.id,
                trackingCode: cand.tracking_code,
                description: cand.description,
                category: cand.final_category,
                latitude: cand.latitude,
                longitude: cand.longitude,
                submittedAt: cand.submitted_at,
              }
            );

            if (scoreResult.isSuggested) {
              duplicatesCount++;
              await adminClient.from('report_duplicate_links').insert({
                report_id: reportId,
                candidate_report_id: cand.id,
                similarity_score: scoreResult.similarityScore,
                semantic_score: scoreResult.semanticScore,
                distance_score: scoreResult.distanceScore,
                temporal_score: scoreResult.temporalScore,
                category_score: scoreResult.categoryScore,
                status: 'suggested',
              });
            }
          }
        }
      } catch (dupErr) {
        console.warn('Duplicate detection evaluation warning:', dupErr);
        // Does not fail the submission
      }

      return ok({
        reportId: reportId as string,
        trackingCode,
        category: aiAnalysis.category,
        summary: aiAnalysis.summary,
        severityLevel: aiAnalysis.severityLevel,
        suggestedDuplicatesCount: duplicatesCount,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An unexpected submission error occurred.';
      return err(new Error(message));
    }
  }
}
