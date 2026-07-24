export type IssueCategory =
  | 'pothole'
  | 'broken_streetlight'
  | 'water_leak'
  | 'illegal_dumping'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type AnalysisStatus = 'pending' | 'completed' | 'fallback' | 'failed';

export type NoteVisibility = 'public' | 'internal';

export type DuplicateStatus = 'suggested' | 'confirmed' | 'rejected';

export interface CitizenContactInput {
  name?: string;
  email?: string;
  phone?: string;
  consentToContact: boolean;
}

export interface ReportSubmissionInput {
  description: string;
  citizenCategory?: IssueCategory;
  locationText: string;
  latitude?: number;
  longitude?: number;
  contact?: CitizenContactInput;
}

export interface PublicStatusTimelineItem {
  status: ReportStatus;
  note: string | null;
  timestamp: string;
}

export interface PublicReportDTO {
  trackingCode: string;
  category: IssueCategory;
  description: string;
  summary: string;
  status: ReportStatus;
  severityLevel: SeverityLevel;
  severityRationale: string | null;
  locationText: string;
  assignedDepartmentName: string | null;
  submittedAt: string;
  updatedAt: string;
  publicTimeline: PublicStatusTimelineItem[];
}
