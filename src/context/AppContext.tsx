import React, { createContext, useContext, useState, useCallback } from 'react'
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

interface AppContextValue {
  documents: Document[]
  projects: Project[]
  reviewTasks: ReviewTask[]
  notifications: Notification[]
  activity: ActivityEvent[]
  fileStore: Record<string, File>
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
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(initDocs)
  const [projects, setProjects] = useState<Project[]>(initProjects)
  const [reviewTasks, setReviewTasks] = useState<ReviewTask[]>(initReviews)
  const [notifications, setNotifications] = useState<Notification[]>(initNotifs)
  const [activity, setActivity] = useState<ActivityEvent[]>(initActivity)
  const [fileStore, setFileStore] = useState<Record<string, File>>({})
  const [projectStages, setProjectStages] = useState<ProjectStage[]>(initStages)
  const [bimExecutionPlans, setBimExecutionPlans] = useState<BIMExecutionPlan[]>(initBEPs)
  const [coordinationIssues, setCoordinationIssues] = useState<CoordinationIssue[]>(initIssues)

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
      rt.documentId === docId
        ? { ...rt, status: 'approved', completedAt: now }
        : rt
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
            ...rt,
            status: 'rejected',
            completedAt: now,
            comments: [...rt.comments, {
              id: `c_${Date.now()}`, author: userName, authorId: userId,
              text: reason, createdAt: now, type: 'rejection' as const
            }]
          }
        : rt
    ))
  }, [])

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

  return (
    <AppContext.Provider value={{
      documents, projects, reviewTasks, notifications, activity, fileStore,
      projectStages, bimExecutionPlans, coordinationIssues,
      addDocument, updateDocument, addProject, updateProject, approveProject,
      markNotificationRead, markAllRead, approveDocument, rejectDocument, unreadCount,
      saveBEP, addCoordinationIssue, updateCoordinationIssue,
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
