import { ReportAnalysisProvider } from "../application/ports/report-analysis-provider";
import {
  FullReportAnalysisOutput,
  ReportAnalysisInput,
  ReportAnalysisObservability,
  ReportAnalysisResult,
  SanitizedAiErrorCode,
} from "../domain/report-analysis.types";
import { FallbackReportAnalysisProvider } from "./providers/fallback-report-analysis.provider";
import { GeminiReportAnalysisProvider } from "./providers/gemini-report-analysis.provider";
import { GroqReportAnalysisProvider } from "./providers/groq-report-analysis.provider";

export interface FailoverOptions {
  primaryProvider?: ReportAnalysisProvider;
  secondaryProvider?: ReportAnalysisProvider;
  fallbackProvider?: ReportAnalysisProvider;
  maxPrimaryAttempts?: number;
  maxSecondaryAttempts?: number;
}

export class AiProviderFactory implements ReportAnalysisProvider {
  readonly providerName = "failover-orchestrator";
  readonly modelName = "multi-provider";

  private primaryProvider: ReportAnalysisProvider;
  private secondaryProvider: ReportAnalysisProvider;
  private fallbackProvider: ReportAnalysisProvider;
  private maxPrimaryAttempts: number;
  private maxSecondaryAttempts: number;

  constructor(options?: FailoverOptions) {
    this.primaryProvider = options?.primaryProvider || new GeminiReportAnalysisProvider();
    this.secondaryProvider = options?.secondaryProvider || new GroqReportAnalysisProvider();
    this.fallbackProvider = options?.fallbackProvider || new FallbackReportAnalysisProvider();
    this.maxPrimaryAttempts = options?.maxPrimaryAttempts ?? (Number(process.env.AI_MAX_PRIMARY_ATTEMPTS) || 2);
    this.maxSecondaryAttempts = options?.maxSecondaryAttempts ?? (Number(process.env.AI_MAX_FALLBACK_ATTEMPTS) || 1);
  }

  async analyzeReport(input: ReportAnalysisInput): Promise<ReportAnalysisResult> {
    const fullOutput = await this.analyzeReportWithFailover(input);
    return fullOutput.result;
  }

  async analyzeReportWithFailover(
    input: ReportAnalysisInput
  ): Promise<FullReportAnalysisOutput> {
    const startTime = Date.now();
    let totalAttempts = 0;
    let lastErrorCode: SanitizedAiErrorCode | null = null;

    // 1. Primary Provider (Gemini) - Up to maxPrimaryAttempts (e.g. 2 attempts)
    for (let i = 1; i <= this.maxPrimaryAttempts; i++) {
      totalAttempts++;
      try {
        const result = await this.primaryProvider.analyzeReport(input);
        const latencyMs = Date.now() - startTime;
        const observability: ReportAnalysisObservability = {
          providerUsed: this.primaryProvider.providerName,
          modelUsed: this.primaryProvider.modelName,
          fallbackTriggered: false,
          fallbackReason: null,
          attemptCount: totalAttempts,
          latencyMs,
          analysisStatus: "COMPLETED_PRIMARY",
          createdAt: new Date().toISOString(),
        };
        return { result, observability };
      } catch (err: unknown) {
        lastErrorCode = this.extractSanitizedErrorCode(err);
      }
    }

    // 2. Secondary Provider (Groq) - Up to maxSecondaryAttempts (e.g. 1 attempt)
    for (let i = 1; i <= this.maxSecondaryAttempts; i++) {
      totalAttempts++;
      try {
        const result = await this.secondaryProvider.analyzeReport(input);
        const latencyMs = Date.now() - startTime;
        const observability: ReportAnalysisObservability = {
          providerUsed: this.secondaryProvider.providerName,
          modelUsed: this.secondaryProvider.modelName,
          fallbackTriggered: true,
          fallbackReason: lastErrorCode || "UNKNOWN_PROVIDER_ERROR",
          attemptCount: totalAttempts,
          latencyMs,
          analysisStatus: "COMPLETED_FALLBACK",
          createdAt: new Date().toISOString(),
        };
        return { result, observability };
      } catch (err: unknown) {
        lastErrorCode = this.extractSanitizedErrorCode(err);
      }
    }

    // 3. Deterministic Fallback Provider
    totalAttempts++;
    const fallbackResult = await this.fallbackProvider.analyzeReport(input);
    const latencyMs = Date.now() - startTime;
    const observability: ReportAnalysisObservability = {
      providerUsed: this.fallbackProvider.providerName,
      modelUsed: this.fallbackProvider.modelName,
      fallbackTriggered: true,
      fallbackReason: lastErrorCode || "UNKNOWN_PROVIDER_ERROR",
      attemptCount: totalAttempts,
      latencyMs,
      analysisStatus: "COMPLETED_DETERMINISTIC",
      createdAt: new Date().toISOString(),
    };

    return { result: fallbackResult, observability };
  }

  private extractSanitizedErrorCode(err: unknown): SanitizedAiErrorCode {
    if (err && typeof err === "object" && "errorCode" in err) {
      const code = String((err as { errorCode?: unknown }).errorCode);
      if (
        code === "TIMEOUT" ||
        code === "RATE_LIMITED" ||
        code === "PROVIDER_UNAVAILABLE" ||
        code === "AUTHENTICATION_ERROR" ||
        code === "INVALID_PROVIDER_RESPONSE" ||
        code === "SCHEMA_VALIDATION_FAILED"
      ) {
        return code as SanitizedAiErrorCode;
      }
    }
    return "UNKNOWN_PROVIDER_ERROR";
  }
}
