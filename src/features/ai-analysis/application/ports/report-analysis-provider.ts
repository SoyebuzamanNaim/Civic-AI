import {
  ReportAnalysisInput,
  ReportAnalysisResult,
} from "../../domain/report-analysis.types";

export interface ReportAnalysisProvider {
  readonly providerName: string;
  readonly modelName: string;
  analyzeReport(input: ReportAnalysisInput): Promise<ReportAnalysisResult>;
}
