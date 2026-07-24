export type ReportCategory =
  | "POTHOLE"
  | "BROKEN_STREETLIGHT"
  | "WATER_LEAK"
  | "ILLEGAL_DUMPING"
  | "OTHER";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ReportAnalysisInput {
  description: string;
  locationText: string;
  citizenCategory?: ReportCategory | string | null;
  latitude?: number | null;
  longitude?: number | null;
  evidenceMetadata?: Record<string, unknown> | null;
}

export interface ReportAnalysisResult {
  category: ReportCategory;
  categoryConfidence: number; // 0..1
  summary: string;
  severityLevel: SeverityLevel;
  severityScore: number; // 0..100
  severityRationale: string;
  recommendedDepartment: string | null;
  safetyRisks: string[];
  uncertainties: string[];
  needsManualReview: boolean;
}

export type AnalysisStatus =
  | "COMPLETED_PRIMARY"
  | "COMPLETED_FALLBACK"
  | "COMPLETED_DETERMINISTIC"
  | "FAILED";

export type SanitizedAiErrorCode =
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "AUTHENTICATION_ERROR"
  | "INVALID_PROVIDER_RESPONSE"
  | "SCHEMA_VALIDATION_FAILED"
  | "UNKNOWN_PROVIDER_ERROR";

export interface ReportAnalysisObservability {
  providerUsed: string;
  modelUsed: string;
  fallbackTriggered: boolean;
  fallbackReason: SanitizedAiErrorCode | null;
  attemptCount: number;
  latencyMs: number;
  analysisStatus: AnalysisStatus;
  createdAt: string;
}

export interface FullReportAnalysisOutput {
  result: ReportAnalysisResult;
  observability: ReportAnalysisObservability;
}
