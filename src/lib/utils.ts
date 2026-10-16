import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type {
  DocumentStatus, ReviewStatus, ProjectStatus, DocumentCategory,
  Discipline, UserRole, ISOSuitabilityCode, ProjectStageCode
} from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return iso }
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  } catch { return iso }
}

export function timeAgo(iso: string): string {
  const now = new Date()
  const then = new Date(iso)
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(iso)
}

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Draft', in_review: 'In Review', approved: 'Approved',
  rejected: 'Rejected', superseded: 'Superseded', archived: 'Archived', published: 'Published'
}

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  in_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  superseded: 'bg-purple-100 text-purple-700',
  archived: 'bg-slate-200 text-slate-500',
  published: 'bg-blue-100 text-blue-700',
}

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  revision_required: 'bg-orange-100 text-orange-700',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
  on_hold: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-slate-200 text-slate-500',
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  drawing: 'Drawing', specification: 'Specification', report: 'Report',
  contract: 'Contract', schedule: 'Schedule', bq: 'Bill of Quantities',
  meeting_minutes: 'Meeting Minutes', site_record: 'Site Record',
  bim_model: 'BIM Model', correspondence: 'Correspondence', permit: 'Permit', other: 'Other'
}

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  architectural: 'Architectural', structural: 'Structural', civil: 'Civil',
  mechanical: 'Mechanical', electrical: 'Electrical', plumbing: 'Plumbing',
  landscape: 'Landscape', general: 'General', cost: 'Cost'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin', company_admin: 'Company Admin', director: 'Director / Boss',
  project_manager: 'Project Manager', architect: 'Architect',
  civil_engineer: 'Civil Engineer', structural_engineer: 'Structural Engineer',
  mep_engineer: 'MEP Engineer', quantity_surveyor: 'Quantity Surveyor',
  document_controller: 'Document Controller', contractor: 'Contractor / Site Engineer',
  readonly: 'Read-only User'
}

export const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: '📄', docx: '📝', doc: '📝', xlsx: '📊', xls: '📊',
  pptx: '📊', ppt: '📊', png: '🖼️', jpg: '🖼️', jpeg: '🖼️',
  dwg: '📐', dxf: '📐', ifc: '🏗️', rvt: '🏗️', default: '📁'
}

export function getFileIcon(fileType: string): string {
  return FILE_TYPE_ICONS[fileType.toLowerCase()] ?? FILE_TYPE_ICONS.default
}

// ─── ISO 19650 ────────────────────────────────────────────────────────────────

export const ISO_SUITABILITY_LABELS: Record<ISOSuitabilityCode, string> = {
  S0:  'S0 — Work in Progress',
  S1:  'S1 — Suitable for Coordination',
  S2:  'S2 — Suitable for Information',
  S3:  'S3 — Suitable for Construction',
  S4:  'S4 — Suitable for As-Built / Record',
  S5:  'S5 — Suitable for Authority Approval',
  S6:  'S6 — Suitable for Stage Sign-Off',
  D1:  'D1 — Preliminary',
  D2:  'D2 — Interim',
  D3:  'D3 — Draft for Comment',
  CR:  'CR — Comment / Review Requested',
  RVD: 'RVD — Revised per Comments',
  VOI: 'VOI — Void',
}

export const ISO_SUITABILITY_COLORS: Record<ISOSuitabilityCode, string> = {
  S0:  'bg-slate-100 text-slate-600',
  S1:  'bg-cyan-100 text-cyan-700',
  S2:  'bg-blue-100 text-blue-700',
  S3:  'bg-green-100 text-green-700',
  S4:  'bg-emerald-100 text-emerald-700',
  S5:  'bg-violet-100 text-violet-700',
  S6:  'bg-indigo-100 text-indigo-700',
  D1:  'bg-amber-100 text-amber-700',
  D2:  'bg-orange-100 text-orange-700',
  D3:  'bg-yellow-100 text-yellow-700',
  CR:  'bg-red-100 text-red-700',
  RVD: 'bg-teal-100 text-teal-700',
  VOI: 'bg-slate-200 text-slate-400',
}

export const PROJECT_STAGE_LABELS: Record<ProjectStageCode, string> = {
  stage_0: 'Stage 0 — Strategic Definition',
  stage_1: 'Stage 1 — Preparation & Briefing',
  stage_2: 'Stage 2 — Concept Design',
  stage_3: 'Stage 3 — Spatial Coordination',
  stage_4: 'Stage 4 — Technical Design',
  stage_5: 'Stage 5 — Manufacturing & Construction',
  stage_6: 'Stage 6 — Handover',
  stage_7: 'Stage 7 — Use (FM)',
}

export const PROJECT_STAGE_SHORT: Record<ProjectStageCode, string> = {
  stage_0: 'S0', stage_1: 'S1', stage_2: 'S2', stage_3: 'S3',
  stage_4: 'S4', stage_5: 'S5', stage_6: 'S6', stage_7: 'S7',
}

/**
 * Generate ISO 19650-compliant document number.
 * Format: [Project]-[Originator]-[Volume/Zone]-[Level]-[Type]-[Role]-[Seq]
 * e.g.  KGLRES-XX-ZZ-00-DR-A-0001
 */
export function generateISO19650Number(
  projectCode: string,
  originator: string,
  zone: string,
  level: string,
  discipline: Discipline,
  category: DocumentCategory,
  seq: number
): string {
  const typeCode: Record<DocumentCategory, string> = {
    drawing: 'DR', specification: 'SP', report: 'RP', contract: 'CT',
    schedule: 'SC', bq: 'BQ', meeting_minutes: 'MM', site_record: 'SR',
    bim_model: 'BM', correspondence: 'CO', permit: 'PM', other: 'OT'
  }
  const roleCode: Record<Discipline, string> = {
    architectural: 'A', structural: 'S', civil: 'C', mechanical: 'M',
    electrical: 'E', plumbing: 'P', landscape: 'L', general: 'Z', cost: 'Q'
  }
  const proj = projectCode.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
  const orig = (originator || 'XX').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6)
  const vol  = (zone || 'ZZ').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4)
  const lvl  = (level || '00').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4)
  return `${proj}-${orig}-${vol}-${lvl}-${typeCode[category]}-${roleCode[discipline]}-${String(seq).padStart(4, '0')}`
}

/** Legacy document number generator */
export function generateDocumentNumber(projectCode: string, discipline: Discipline, category: DocumentCategory, seq: number): string {
  const disc: Record<Discipline, string> = {
    architectural: 'ARCH', structural: 'STR', civil: 'CIV',
    mechanical: 'MECH', electrical: 'ELEC', plumbing: 'PLMB',
    landscape: 'LAND', general: 'GEN', cost: 'QS'
  }
  const cat: Record<DocumentCategory, string> = {
    drawing: 'DRW', specification: 'SPEC', report: 'RPT', contract: 'CTR',
    schedule: 'SCH', bq: 'BOQ', meeting_minutes: 'MIN', site_record: 'SIT',
    bim_model: 'BIM', correspondence: 'COR', permit: 'PRM', other: 'OTH'
  }
  return `${projectCode}-${disc[discipline]}-${cat[category]}-${String(seq).padStart(3, '0')}`
}

// ─── Rwanda districts ─────────────────────────────────────────────────────────
export const RWANDA_DISTRICTS = [
  'Gasabo', 'Kicukiro', 'Nyarugenge',
  'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana',
  'Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo',
  'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango',
  'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rutsiro', 'Rusizi',
]
