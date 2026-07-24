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
    
    // Pothole / Road damage keywords (English + Banglish + Bengali)
    if (
      text.includes("pothole") || text.includes("crater") || text.includes("road defect") ||
      text.includes("gorto") || text.includes("gortho") || text.includes("bhanga rasta") ||
      text.includes("rasta bhanga") || text.includes("rasta kharap") || text.includes("khana khondo") ||
      text.includes("গর্ত") || text.includes("রাস্তা ভাঙা")
    ) {
      return "POTHOLE";
    }

    // Streetlight keywords (English + Banglish + Bengali)
    if (
      text.includes("light") || text.includes("lamp") || text.includes("dark") || text.includes("streetlight") ||
      text.includes("bati") || text.includes("andhokar") || text.includes("jalena") || text.includes("jale na") ||
      text.includes("nosto") || text.includes("বাতি") || text.includes("অন্ধকার")
    ) {
      return "BROKEN_STREETLIGHT";
    }

    // Water leak keywords (English + Banglish + Bengali)
    if (
      text.includes("leak") || text.includes("pipe") || text.includes("water") || text.includes("burst") ||
      text.includes("pani") || text.includes("paani") || text.includes("panir pipe") || text.includes("pani leak") ||
      text.includes("পানি") || text.includes("পাইপ")
    ) {
      return "WATER_LEAK";
    }

    // Illegal dumping keywords (English + Banglish + Bengali)
    if (
      text.includes("dump") || text.includes("trash") || text.includes("waste") || text.includes("garbage") ||
      text.includes("moyla") || text.includes("moila") || text.includes("gondho") || text.includes("dustbin") ||
      text.includes("ময়লা") || text.includes("আবর্জনা")
    ) {
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
