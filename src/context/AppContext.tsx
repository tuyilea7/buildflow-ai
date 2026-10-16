import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type {
  Document, Project, ReviewTask, Notification, ActivityEvent,
  ProjectStage, BIMExecutionPlan, CoordinationIssue
} from '../types'
import {
  DOCUMENTS as initDocs,
  PROJECTS as initProjects,
  REVIEW_TASKS as initReviews,
  NOTIFICATIONS as initNotifs,
  ACTIVITY as initActivity,
  PROJECT_STAGES as initStages,
  BIM_EXECUTION_PLANS as initBEPs,
  COORDINATION_ISSUES as initIssues,
} from '../data/mockData'

// ─── localStorage helpers ─────────────────────────────────────────────────────

const KEYS = {
  documents:          'bf_documents',
  projects:           'bf_projects',
  reviewTasks:        'bf_review_tasks',
  notifications:      'bf_notifications',
  activity:           'bf_activity',
  projectStages:      'bf_project_stages',
  bimExecutionPlans:  'bf_bim_execution_plans',
  coordinationIssues: 'bf_coordination_issues',
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

// ─── Context interface ────────────────────────────────────────────────────────

interface AppContextValue {
  documents: Document[]
  projects: Project[]
  reviewTasks: ReviewTask[]
  notifications: Notification[]
  activity: ActivityEvent[]
  fileStore: Record<string, File>         // Files can't be stored in localStorage — session only
  projectStages: ProjectStage[]
  bimExecutionPlans: BIMExecutionPlan[]
  coordinationIssues: CoordinationIssue[]
  addDocument: (doc: Document, file?: File) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  approveProject: (projectId: string, userId: string, userName: string) => void
  markNotificationRead: (id: string) => void
  markAllRead: (userId: string) => void
  approveDocument: (docId: string, userId: string, userName: string) => void
  rejectDocument: (docId: string, userId: string, userName: string, reason: string) => void
  unreadCount: (userId: string) => number
  saveBEP: (bep: BIMExecutionPlan) => void
  addCoordinationIssue: (issue: CoordinationIssue) => void
  updateCoordinationIssue: (id: string, updates: Partial<CoordinationIssue>) => void
  clearAllData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Load from localStorage on first render, fall back to mock data defaults
  const [documents,          setDocuments]          = useState<Document[]>(() =>           load(KEYS.documents,          initDocs))
  const [projects,           setProjects]           = useState<Project[]>(() =>            load(KEYS.projects,           initProjects))
  const [reviewTasks,        setReviewTasks]        = useState<ReviewTask[]>(() =>         load(KEYS.reviewTasks,        initReviews))
  const [notifications,      setNotifications]      = useState<Notification[]>(() =>      load(KEYS.notifications,      initNotifs))
  const [activity,           setActivity]           = useState<ActivityEvent[]>(() =>     load(KEYS.activity,           initActivity))
  const [projectStages,      setProjectStages]      = useState<ProjectStage[]>(() =>      load(KEYS.projectStages,      initStages))
  const [bimExecutionPlans,  setBimExecutionPlans]  = useState<BIMExecutionPlan[]>(() =>  load(KEYS.bimExecutionPlans,  initBEPs))
  const [coordinationIssues, setCoordinationIssues] = useState<CoordinationIssue[]>(() => load(KEYS.coordinationIssues, initIssues))

  // Files cannot be serialized to localStorage — they are session-only
  const [fileStore, setFileStore] = useState<Record<string, File>>({})

  // ── Persist to localStorage whenever state changes ──────────────────────────
  useEffect(() => { save(KEYS.documents,          documents)          }, [documents])
  useEffect(() => { save(KEYS.projects,           projects)           }, [projects])
  useEffect(() => { save(KEYS.reviewTasks,        reviewTasks)        }, [reviewTasks])
  useEffect(() => { save(KEYS.notifications,      notifications)      }, [notifications])
  useEffect(() => { save(KEYS.activity,           activity)           }, [activity])
  useEffect(() => { save(KEYS.projectStages,      projectStages)      }, [projectStages])
  useEffect(() => { save(KEYS.bimExecutionPlans,  bimExecutionPlans)  }, [bimExecutionPlans])
  useEffect(() => { save(KEYS.coordinationIssues, coordinationIssues) }, [coordinationIssues])

  // ── Actions ──────────────────────────────────────────────────────────────────

  const addDocument = useCallback((doc: Document, file?: File) => {
    setDocuments(prev => [doc, ...prev])
    if (file) setFileStore(prev => ({ ...prev, [doc.id]: file }))
    setProjects(prev => prev.map(p =>
      p.id === doc.projectId ? { ...p, totalDocuments: p.totalDocuments + 1 } : p
    ))
    setActivity(prev => [{
      id: `a_${Date.now()}`, userId: doc.uploadedById, userName: doc.uploadedBy,
      action: 'uploaded', target: doc.title, projectId: doc.projectId,
      documentId: doc.id, createdAt: new Date().toISOString()
    }, ...prev])
  }, [])

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
  }, [])

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev])
  }, [])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const approveProject = useCallback((projectId: string, userId: string, userName: string) => {
    const now = new Date().toISOString()
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'active' as const } : p
    ))
    setActivity(prev => [{
      id: `a_${Date.now()}`, userId, userName, action: 'approved project',
      target: projects.find(p => p.id === projectId)?.name ?? projectId,
      projectId, createdAt: now
    }, ...prev])
  }, [projects])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback((userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n))
  }, [])

  const approveDocument = useCallback((docId: string, userId: string, userName: string) => {
    const now = new Date().toISOString()
    setDocuments(prev => prev.map(d =>
      d.id === docId
        ? { ...d, status: 'approved', approvedBy: userName, approvedAt: now, updatedAt: now }
        : d
    ))
    setReviewTasks(prev => prev.map(rt =>
      rt.documentId === docId ? { ...rt, status: 'approved', completedAt: now } : rt
    ))
    setActivity(prev => [{
      id: `a_${Date.now()}`, userId, userName, action: 'approved',
      target: documents.find(d => d.id === docId)?.title ?? docId,
      documentId: docId, createdAt: now
    }, ...prev])
  }, [documents])

  const rejectDocument = useCallback((docId: string, userId: string, userName: string, reason: string) => {
    const now = new Date().toISOString()
    setDocuments(prev => prev.map(d =>
      d.id === docId ? { ...d, status: 'rejected', updatedAt: now } : d
    ))
    setReviewTasks(prev => prev.map(rt =>
      rt.documentId === docId
        ? {
            ...rt, status: 'rejected', completedAt: now,
            comments: [...rt.comments, {
              id: `c_${Date.now()}`, author: userName, authorId: userId,
              text: reason, createdAt: now, type: 'rejection' as const
            }]
          }
        : rt
    ))
    setActivity(prev => [{
      id: `a_${Date.now()}`, userId, userName, action: 'rejected',
      target: documents.find(d => d.id === docId)?.title ?? docId,
      documentId: docId, createdAt: now
    }, ...prev])
  }, [documents])

  const unreadCount = useCallback((userId: string) =>
    notifications.filter(n => n.userId === userId && !n.read).length,
    [notifications])

  const saveBEP = useCallback((bep: BIMExecutionPlan) => {
    setBimExecutionPlans(prev => {
      const exists = prev.find(b => b.id === bep.id)
      if (exists) return prev.map(b => b.id === bep.id ? bep : b)
      return [...prev, bep]
    })
  }, [])

  const addCoordinationIssue = useCallback((issue: CoordinationIssue) => {
    setCoordinationIssues(prev => [issue, ...prev])
  }, [])

  const updateCoordinationIssue = useCallback((id: string, updates: Partial<CoordinationIssue>) => {
    setCoordinationIssues(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }, [])

  // Clear all data and reset to defaults (admin utility)
  const clearAllData = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k))
    setDocuments(initDocs)
    setProjects(initProjects)
    setReviewTasks(initReviews)
    setNotifications(initNotifs)
    setActivity(initActivity)
    setProjectStages(initStages)
    setBimExecutionPlans(initBEPs)
    setCoordinationIssues(initIssues)
    setFileStore({})
  }, [])

  return (
    <AppContext.Provider value={{
      documents, projects, reviewTasks, notifications, activity, fileStore,
      projectStages, bimExecutionPlans, coordinationIssues,
      addDocument, updateDocument, addProject, updateProject, approveProject,
      markNotificationRead, markAllRead, approveDocument, rejectDocument, unreadCount,
      saveBEP, addCoordinationIssue, updateCoordinationIssue, clearAllData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
