import { IssueCategory, SeverityLevel } from '@/shared/domain/types';

export interface StructuredAnalysisOutput {
  category: IssueCategory;
  categoryConfidence: number;
  summary: string;
  severityLevel: SeverityLevel;
  severityScore: number;
  severityRationale: string;
  recommendedDepartmentKey?: string;
  actionableResolutionSteps?: string[];
  visualAnalysis?: string;
  uncertainties?: string[];
  provider: string;
  model: string;
  promptVersion: string;
}

export interface ReportAnalysisProvider {
  analyzeReport(
    description: string,
    locationText: string,
    citizenCategory?: IssueCategory,
    evidenceUrl?: string
  ): Promise<StructuredAnalysisOutput>;

  generateEmbedding(text: string): Promise<number[]>;
}

