// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'company_admin'
  | 'director'
  | 'project_manager'
  | 'architect'
  | 'civil_engineer'
  | 'structural_engineer'
  | 'mep_engineer'
  | 'quantity_surveyor'
  | 'document_controller'
  | 'contractor'
  | 'readonly'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  department: string
  phone?: string
  active: boolean
  createdAt: string
  lastLogin?: string
}

// ─── Project ─────────────────────────────────────────────────────────────────

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'

// ISO 19650 project stages
export type ProjectStageCode =
  | 'stage_0'   // Strategic Definition
  | 'stage_1'   // Preparation & Briefing
  | 'stage_2'   // Concept Design
  | 'stage_3'   // Spatial Coordination
  | 'stage_4'   // Technical Design
  | 'stage_5'   // Manufacturing & Construction
  | 'stage_6'   // Handover
  | 'stage_7'   // Use (Facilities Management)

export interface ProjectStage {
  id: string
  projectId: string
  code: ProjectStageCode
  name: string
  startDate: string
  endDate: string
  status: 'not_started' | 'in_progress' | 'completed'
  description?: string
  deliverables: string[]
}

// BIM Execution Plan
export interface BIMExecutionPlan {
  id: string
  projectId: string
  preparedBy: string
  preparedById: string
  createdAt: string
  updatedAt: string
  bimObjectives: string
  softwareTools: string
  coordinationMethod: string
  modellingResponsibilities: string
  informationDeliveryMilestones: string
  cdeDescription: string
  qualityAssurance: string
  rwandaRegulationNotes: string
  status: 'draft' | 'approved'
}

// Coordination / Clash Issue
export type CoordinationIssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type CoordinationIssuePriority = 'low' | 'medium' | 'high' | 'critical'

export interface CoordinationIssue {
  id: string
  projectId: string
  title: string
  description: string
  disciplineA: string
  disciplineB: string
  priority: CoordinationIssuePriority
  status: CoordinationIssueStatus
  assignedTo: string
  assignedToId: string
  raisedBy: string
  raisedById: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  resolution?: string
  documentIds: string[]
}

export interface Project {
  id: string
  code: string
  name: string
  description: string
  location: string
  client: string
  projectManager: string
  projectManagerId: string
  status: ProjectStatus
  startDate: string
  endDate: string
  totalDocuments: number
  pendingReviews: number
  teamSize: number
  disciplines: string[]
  createdAt: string
  thumbnail?: string
  // Rwanda-specific
  rwandaDistrict?: string
  rucaPermitNumber?: string
}

// ─── Document ────────────────────────────────────────────────────────────────

export type DocumentStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'superseded'
  | 'archived'
  | 'published'

// ISO 19650 suitability codes
export type ISOSuitabilityCode =
  | 'S0'   // Work in Progress
  | 'S1'   // Suitable for Coordination
  | 'S2'   // Suitable for Information
  | 'S3'   // Suitable for Construction / Implementation
  | 'S4'   // Suitable for As-Built / Record
  | 'S5'   // Suitable for Approval by Authority
  | 'S6'   // Suitable for Stage Sign-Off
  | 'D1'   // Preliminary
  | 'D2'   // Interim
  | 'D3'   // Draft for Comment
  | 'CR'   // Comment / Review Requested
  | 'RVD'  // Revised per Comments
  | 'VOI'  // Void

export type DocumentCategory =
  | 'drawing'
  | 'specification'
  | 'report'
  | 'contract'
  | 'schedule'
  | 'bq'
  | 'meeting_minutes'
  | 'site_record'
  | 'bim_model'
  | 'correspondence'
  | 'permit'
  | 'other'

export type Discipline =
  | 'architectural'
  | 'structural'
  | 'civil'
  | 'mechanical'
  | 'electrical'
  | 'plumbing'
  | 'landscape'
  | 'general'
  | 'cost'

export interface DocumentRevision {
  id: string
  documentId: string
  revisionNumber: string
  uploadedBy: string
  uploadedById: string
  uploadedAt: string
  status: DocumentStatus
  suitabilityCode?: ISOSuitabilityCode
  description: string
  fileSize: number
  fileName: string
  comments?: string
}

export interface Document {
  id: string
  projectId: string
  projectName: string
  documentNumber: string
  isoDocumentNumber?: string       // Full ISO 19650 number
  title: string
  description: string
  category: DocumentCategory
  discipline: Discipline
  status: DocumentStatus
  suitabilityCode?: ISOSuitabilityCode
  projectStageCode?: ProjectStageCode
  currentRevision: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedById: string
  uploadedAt: string
  updatedAt: string
  tags: string[]
  revisions: DocumentRevision[]
  reviewerId?: string
  reviewerName?: string
  approvedBy?: string
  approvedAt?: string
  drawingNumber?: string
  zone?: string
  floor?: string
}

// ─── Review ──────────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'revision_required'

export interface ReviewTask {
  id: string
  documentId: string
  documentTitle: string
  documentNumber: string
  projectId: string
  projectName: string
  assignedTo: string
  assignedToId: string
  assignedBy: string
  status: ReviewStatus
  dueDate: string
  createdAt: string
  completedAt?: string
  comments: ReviewComment[]
}

export interface ReviewComment {
  id: string
  author: string
  authorId: string
  text: string
  createdAt: string
  type: 'comment' | 'approval' | 'rejection' | 'revision_request'
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationKind =
  | 'review_request'
  | 'document_approved'
  | 'document_rejected'
  | 'new_revision'
  | 'project_assigned'
  | 'overdue_review'
  | 'comment'

export interface Notification {
  id: string
  userId: string
  kind: NotificationKind
  title: string
  message: string
  read: boolean
  createdAt: string
  linkTo?: string
  documentId?: string
  projectId?: string
}

// ─── Activity ────────────────────────────────────────────────────────────────

export interface ActivityEvent {
  id: string
  userId: string
  userName: string
  action: string
  target: string
  projectId?: string
  documentId?: string
  createdAt: string
}
