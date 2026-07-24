import {
  FullReportAnalysisOutput,
  ReportAnalysisInput,
} from "../../domain/report-analysis.types";
import { AiProviderFactory } from "../../infrastructure/ai-provider.factory";
import { ReportAnalysisProvider } from "../ports/report-analysis-provider";

export class AnalyzeReportUseCase {
  private orchestrator: AiProviderFactory;

  constructor(customOrchestrator?: AiProviderFactory | ReportAnalysisProvider) {
    if (customOrchestrator instanceof AiProviderFactory) {
      this.orchestrator = customOrchestrator;
    } else if (customOrchestrator) {
      this.orchestrator = new AiProviderFactory({ primaryProvider: customOrchestrator });
    } else {
      this.orchestrator = new AiProviderFactory();
    }
  }

  async execute(input: ReportAnalysisInput): Promise<FullReportAnalysisOutput> {
    return await this.orchestrator.analyzeReportWithFailover(input);
  }
}
