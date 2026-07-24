import { ReportAnalysisProvider } from "../../application/ports/report-analysis-provider";
import {
  ReportAnalysisInput,
  ReportAnalysisResult,
  ReportCategory,
} from "../../domain/report-analysis.types";

export class FallbackReportAnalysisProvider implements ReportAnalysisProvider {
  readonly providerName = "deterministic-fallback";
  readonly modelName = "keyword-rules";

  async analyzeReport(input: ReportAnalysisInput): Promise<ReportAnalysisResult> {
    const category = this.determineCategory(input);
    const safeSummary = this.generateSummary(input.description);

    return {
      category,
      categoryConfidence: 0.3,
      summary: safeSummary,
      severityLevel: "MEDIUM",
      severityScore: 50,
      severityRationale: "Default severity assigned during deterministic fallback processing.",
      recommendedDepartment: null,
      safetyRisks: [],
      uncertainties: [
        "Automated AI provider analysis was unavailable. Government manual review is required.",
      ],
      needsManualReview: true,
    };
  }

  private determineCategory(input: ReportAnalysisInput): ReportCategory {
    if (input.citizenCategory) {
      const upperCat = String(input.citizenCategory).toUpperCase();
      if (
        upperCat === "POTHOLE" ||
        upperCat === "BROKEN_STREETLIGHT" ||
        upperCat === "WATER_LEAK" ||
        upperCat === "ILLEGAL_DUMPING" ||
        upperCat === "OTHER"
      ) {
        return upperCat as ReportCategory;
      }
    }

    const text = (input.description + " " + input.locationText).toLowerCase();
    if (text.includes("pothole") || text.includes("crater") || text.includes("road defect")) {
      return "POTHOLE";
    }
    if (text.includes("light") || text.includes("lamp") || text.includes("dark") || text.includes("streetlight")) {
      return "BROKEN_STREETLIGHT";
    }
    if (text.includes("leak") || text.includes("pipe") || text.includes("water") || text.includes("burst")) {
      return "WATER_LEAK";
    }
    if (text.includes("dump") || text.includes("trash") || text.includes("waste") || text.includes("garbage")) {
      return "ILLEGAL_DUMPING";
    }

    return "OTHER";
  }

  private generateSummary(description: string): string {
    const cleaned = description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (cleaned.length <= 150) {
      return cleaned || "Citizen report submitted.";
    }
    return cleaned.slice(0, 147) + "...";
  }
}
