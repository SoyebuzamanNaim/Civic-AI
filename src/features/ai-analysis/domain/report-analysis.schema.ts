import { z } from "zod";

const noHtmlOrScript = (val: string) => {
  const hasHtml = /<[^>]*>/g.test(val);
  const hasScript = /javascript:/i.test(val) || /on\w+=/i.test(val);
  return !hasHtml && !hasScript;
};

export const ReportCategoryEnum = z.enum([
  "POTHOLE",
  "BROKEN_STREETLIGHT",
  "WATER_LEAK",
  "ILLEGAL_DUMPING",
  "OTHER",
]);

export const SeverityLevelEnum = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const ReportAnalysisResultSchema = z.object({
  category: ReportCategoryEnum,
  categoryConfidence: z.number().min(0, "categoryConfidence must be >= 0").max(1, "categoryConfidence must be <= 1"),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(500, "Summary exceeds 500 characters")
    .refine(noHtmlOrScript, "Summary contains invalid HTML or executable content"),
  severityLevel: SeverityLevelEnum,
  severityScore: z.number().min(0, "severityScore must be >= 0").max(100, "severityScore must be <= 100"),
  severityRationale: z
    .string()
    .min(1, "Severity rationale is required")
    .max(1000, "Severity rationale exceeds 1000 characters")
    .refine(noHtmlOrScript, "Severity rationale contains invalid HTML or executable content"),
  recommendedDepartment: z.string().nullable(),
  safetyRisks: z.array(z.string().max(200)),
  uncertainties: z.array(z.string().max(200)),
  needsManualReview: z.boolean(),
});

export type ReportAnalysisResultValidated = z.infer<typeof ReportAnalysisResultSchema>;
