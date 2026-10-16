import type {
  User, Project, Document, ReviewTask, Notification, ActivityEvent,
  ProjectStage, BIMExecutionPlan, CoordinationIssue
} from '../types'

// ─── Users ────────────────────────────────────────────────────────────────────

export const USERS: User[] = [
  {
    id: 'u1', name: 'Edgar Nkurunziza', email: 'edgar@buildflow.rw',
    role: 'director', department: 'Management', active: true,
    createdAt: '2024-01-10', lastLogin: '2026-10-13', phone: '+250 788 100 001'
  },
  {
    id: 'u2', name: 'Alice Uwimana', email: 'alice@buildflow.rw',
    role: 'project_manager', department: 'Project Management', active: true,
    createdAt: '2024-01-12', lastLogin: '2026-10-13', phone: '+250 788 100 002'
  },
  {
    id: 'u3', name: 'Jean-Paul Habimana', email: 'jeanpaul@buildflow.rw',
    role: 'architect', department: 'Architecture', active: true,
    createdAt: '2024-02-01', lastLogin: '2026-10-12', phone: '+250 788 100 003'
  },
  {
    id: 'u4', name: 'Marie Mukamana', email: 'marie@buildflow.rw',
    role: 'structural_engineer', department: 'Structural', active: true,
    createdAt: '2024-02-05', lastLogin: '2026-10-11', phone: '+250 788 100 004'
  },
  {
    id: 'u5', name: 'David Bizimana', email: 'david@buildflow.rw',
    role: 'mep_engineer', department: 'MEP', active: true,
    createdAt: '2024-02-10', lastLogin: '2026-10-10', phone: '+250 788 100 005'
  },
  {
    id: 'u6', name: 'Grace Ingabire', email: 'grace@buildflow.rw',
    role: 'document_controller', department: 'Document Control', active: true,
    createdAt: '2024-01-15', lastLogin: '2026-10-13', phone: '+250 788 100 006'
  },
  {
    id: 'u7', name: 'Patrick Nshimiyimana', email: 'patrick@buildflow.rw',
    role: 'quantity_surveyor', department: 'Cost Management', active: true,
    createdAt: '2024-03-01', lastLogin: '2026-10-09', phone: '+250 788 100 007'
  },
  {
    id: 'u8', name: 'Claudine Uwase', email: 'claudine@buildflow.rw',
    role: 'civil_engineer', department: 'Civil', active: true,
    createdAt: '2024-03-05', lastLogin: '2026-10-08', phone: '+250 788 100 008'
  },
  {
    id: 'u9', name: 'Admin User', email: 'admin@buildflow.rw',
    role: 'company_admin', department: 'Administration', active: true,
    createdAt: '2024-01-01', lastLogin: '2026-10-13', phone: '+250 788 100 009'
  },
  {
    id: 'u10', name: 'Robert Contractor', email: 'robert@buildflow.rw',
    role: 'contractor', department: 'Construction', active: true,
    createdAt: '2024-04-01', lastLogin: '2026-10-07', phone: '+250 788 100 010'
  },
]

// ─── Project ──────────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = []

// ─── Documents — empty, ready for your uploads ────────────────────────────────

export const DOCUMENTS: Document[] = []

// ─── Review Tasks — empty ─────────────────────────────────────────────────────

export const REVIEW_TASKS: ReviewTask[] = []

// ─── Notifications — empty ────────────────────────────────────────────────────

export const NOTIFICATIONS: Notification[] = []

// ─── Activity Feed — empty ────────────────────────────────────────────────────

export const ACTIVITY: ActivityEvent[] = []

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export const DEMO_CREDENTIALS: Record<string, string> = {
  'edgar@buildflow.rw':    'u1',
  'alice@buildflow.rw':    'u2',
  'jeanpaul@buildflow.rw': 'u3',
  'marie@buildflow.rw':    'u4',
  'david@buildflow.rw':    'u5',
  'grace@buildflow.rw':    'u6',
  'patrick@buildflow.rw':  'u7',
  'claudine@buildflow.rw': 'u8',
  'admin@buildflow.rw':    'u9',
  'robert@buildflow.rw':   'u10',
}
// All demo passwords: "password"

// ─── Project Stages (ISO 19650) ───────────────────────────────────────────────

export const PROJECT_STAGES: ProjectStage[] = []

// ─── BIM Execution Plan ───────────────────────────────────────────────────────

export const BIM_EXECUTION_PLANS: BIMExecutionPlan[] = []

// ─── Coordination Issues — empty, ready to add ───────────────────────────────

export const COORDINATION_ISSUES: CoordinationIssue[] = []
