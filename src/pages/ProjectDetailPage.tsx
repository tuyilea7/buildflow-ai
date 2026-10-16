import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Calendar, Users, FileText,
  Plus, ShieldCheck, XCircle, Info, CheckCircle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import {
  STATUS_COLORS, STATUS_LABELS, PROJECT_STATUS_COLORS,
  DISCIPLINE_LABELS, formatDate, formatFileSize, getFileIcon
} from '../lib/utils'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { projects, documents, approveProject, updateProject } = useApp()
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()
  const [showApprove, setShowApprove] = useState(false)
  const [showOnHold, setShowOnHold] = useState(false)

  const project = projects.find(p => p.id === id)
  if (!project) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-slate-500">Project not found.</p>
      <Button variant="ghost" onClick={() => navigate('/projects')} className="mt-3">Back to Projects</Button>
    </div>
  )

  const projectDocs = documents.filter(d => d.projectId === id)
  const approvedCount = projectDocs.filter(d => d.status === 'approved' || d.status === 'published').length
  const inReviewCount = projectDocs.filter(d => d.status === 'in_review').length
  const draftsCount   = projectDocs.filter(d => d.status === 'draft').length

  // Only Director and Company Admin can approve / put on hold a project
  const canApproveProject = hasRole('director', 'company_admin')

  const byDiscipline = projectDocs.reduce((acc, doc) => {
    if (!acc[doc.discipline]) acc[doc.discipline] = []
    acc[doc.discipline].push(doc)
    return acc
  }, {} as Record<string, typeof projectDocs>)

  function handleApproveProject() {
    if (!user || !project) return
    approveProject(project.id, user.id, user.name)
    setShowApprove(false)
  }

  function handlePutOnHold() {
    if (!project) return
    updateProject(project.id, { status: 'on_hold' })
    setShowOnHold(false)
  }

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Back + header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/projects')} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900">{project.name}</h2>
            <Badge className={PROJECT_STATUS_COLORS[project.status]}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs font-mono text-blue-600 mt-0.5">{project.code}</p>
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {project.status === 'planning' && canApproveProject && (
            <Button size="sm" variant="primary" icon={<ShieldCheck className="w-4 h-4" />} onClick={() => setShowApprove(true)}>
              Approve Project
            </Button>
          )}
          {project.status === 'active' && canApproveProject && (
            <Button size="sm" variant="outline" icon={<XCircle className="w-4 h-4" />} onClick={() => setShowOnHold(true)}>
              Put On Hold
            </Button>
          )}
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate(`/documents?project=${project.id}`)}>
            Upload Document
          </Button>
        </div>
      </div>

      {/* Status banner */}
      {project.status === 'planning' && (
        <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            This project is in <strong>Planning</strong> status.
            {canApproveProject
              ? ' Click "Approve Project" to activate it for the full team.'
              : ' Waiting for the Director or Company Admin to approve it before construction work begins.'}
          </span>
        </div>
      )}
      {project.status === 'active' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Project is <strong>Active</strong> — approved and open for document management.</span>
        </div>
      )}
      {project.status === 'on_hold' && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <Info className="w-4 h-4 shrink-0" />
          <span>This project is currently <strong>On Hold</strong>.</span>
        </div>
      )}

      {/* Project info + stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardBody>
            <p className="text-sm text-slate-600 mb-4">{project.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Location</div>
                  <div className="font-medium text-slate-800">{project.location}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Client</div>
                  <div className="font-medium text-slate-800">{project.client}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Project Manager</div>
                  <div className="font-medium text-slate-800">{project.projectManager}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Schedule</div>
                  <div className="font-medium text-slate-800">{formatDate(project.startDate)} – {formatDate(project.endDate)}</div>
                </div>
              </div>
            </div>
            {project.disciplines.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.disciplines.map(d => (
                  <Badge key={d} className="bg-blue-50 text-blue-700">
                    {DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS] ?? d}
                  </Badge>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-3">
          <StatCard label="Total Documents" value={projectDocs.length} icon={<FileText className="w-5 h-5" />} color="blue" />
          <StatCard label="Approved / Published" value={approvedCount} icon={<FileText className="w-5 h-5" />} color="green" />
          <StatCard label="In Review" value={inReviewCount} icon={<FileText className="w-5 h-5" />} color="amber" />
          <StatCard label="Drafts" value={draftsCount} icon={<FileText className="w-5 h-5" />} color="slate" />
        </div>
      </div>

      {/* Documents by discipline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Project Documents</h3>
            <Button size="sm" variant="outline" onClick={() => navigate(`/documents?project=${project.id}`)}>
              View All & Upload
            </Button>
          </div>
        </CardHeader>
        {projectDocs.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={<FileText className="w-10 h-10" />}
              title="No documents yet"
              description="Upload the first document for this project."
              action={{ label: 'Upload Document', onClick: () => navigate(`/documents?project=${project.id}`) }}
            />
          </CardBody>
        ) : (
          <div>
            {Object.entries(byDiscipline).map(([disc, docs]) => (
              <div key={disc}>
                <div className="px-5 py-2 bg-slate-50 border-y border-slate-100">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {DISCIPLINE_LABELS[disc as keyof typeof DISCIPLINE_LABELS] ?? disc}
                  </span>
                </div>
                {docs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left"
                  >
                    <span className="text-xl shrink-0">{getFileIcon(doc.fileType)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{doc.title}</div>
                      <div className="text-xs text-slate-400">{doc.documentNumber} · Rev {doc.currentRevision} · {formatFileSize(doc.fileSize)}</div>
                    </div>
                    <Badge className={STATUS_COLORS[doc.status]}>{STATUS_LABELS[doc.status]}</Badge>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Approve Project Modal */}
      <Modal
        open={showApprove}
        onClose={() => setShowApprove(false)}
        title="Approve Project"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApprove(false)}>Cancel</Button>
            <Button variant="primary" icon={<ShieldCheck className="w-4 h-4" />} onClick={handleApproveProject}>
              Approve & Activate
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">{project.name}</p>
            <p className="text-xs text-green-600">{project.code} · {project.location}</p>
          </div>
          <p className="text-sm text-slate-600">
            Approving this project will change its status to <strong>Active</strong>, making it fully open for document uploads, reviews, and team collaboration.
          </p>
          <p className="text-xs text-slate-400">
            Approving as <strong>{user?.name}</strong>. This action is recorded in the activity log.
          </p>
        </div>
      </Modal>

      {/* Put On Hold Modal */}
      <Modal
        open={showOnHold}
        onClose={() => setShowOnHold(false)}
        title="Put Project On Hold"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowOnHold(false)}>Cancel</Button>
            <Button variant="danger" onClick={handlePutOnHold}>Put On Hold</Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          This will change the project status to <strong>On Hold</strong>. Document uploads remain accessible but the project will be flagged as paused.
        </p>
      </Modal>
    </div>
  )
}
