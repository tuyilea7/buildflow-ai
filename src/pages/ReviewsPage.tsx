import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardCheck, CheckCircle, XCircle, Clock,
  AlertTriangle, Eye, Calendar, Filter
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Textarea } from '../components/ui/Input'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate, cn } from '../lib/utils'
import type { ReviewStatus } from '../types'

const STATUS_FILTER_OPTS: { value: ReviewStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'revision_required', label: 'Revision Required' },
]

export function ReviewsPage() {
  const { reviewTasks, approveDocument, rejectDocument, documents } = useApp()
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all')
  const [rejectModal, setRejectModal] = useState<{ open: boolean; docId: string; docTitle: string }>({ open: false, docId: '', docTitle: '' })
  const [rejectReason, setRejectReason] = useState('')

  const isReviewer = hasRole(
    'project_manager', 'document_controller', 'director', 'company_admin',
    'architect', 'structural_engineer', 'civil_engineer', 'mep_engineer'
  )

  // Show own tasks for reviewers, all tasks for managers/admins
  const visibleTasks = hasRole('director', 'company_admin', 'project_manager')
    ? reviewTasks
    : reviewTasks.filter(rt => rt.assignedToId === user?.id)

  const filtered = visibleTasks.filter(rt =>
    statusFilter === 'all' || rt.status === statusFilter
  )

  const pending = visibleTasks.filter(r => r.status === 'pending').length
  const inProgress = visibleTasks.filter(r => r.status === 'in_progress').length
  const approved = visibleTasks.filter(r => r.status === 'approved').length
  const rejected = visibleTasks.filter(r => r.status === 'rejected').length

  const now = new Date()
  const overdue = visibleTasks.filter(r =>
    (r.status === 'pending' || r.status === 'in_progress') && new Date(r.dueDate) < now
  ).length

  function handleApprove(rt: typeof reviewTasks[0]) {
    if (!user) return
    approveDocument(rt.documentId, user.id, user.name)
  }

  function handleRejectConfirm() {
    if (!user || !rejectReason.trim()) return
    rejectDocument(rejectModal.docId, user.id, user.name, rejectReason)
    setRejectModal({ open: false, docId: '', docTitle: '' })
    setRejectReason('')
  }

  const statusStyles: Record<ReviewStatus, string> = {
    pending: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    revision_required: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Reviews & Approvals</h2>
        <p className="text-sm text-slate-500">Manage document review workflows</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Pending" value={pending} icon={<Clock className="w-5 h-5" />} color="slate" />
        <StatCard label="In Progress" value={inProgress} icon={<ClipboardCheck className="w-5 h-5" />} color="amber" />
        <StatCard label="Approved" value={approved} icon={<CheckCircle className="w-5 h-5" />} color="green" />
        <StatCard label="Rejected" value={rejected} icon={<XCircle className="w-5 h-5" />} color="red" />
        <StatCard label="Overdue" value={overdue} icon={<AlertTriangle className="w-5 h-5" />} color={overdue > 0 ? 'red' : 'slate'} />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTER_OPTS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              statusFilter === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Review list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-12 h-12" />}
          title="No review tasks"
          description={statusFilter === 'all' ? 'No reviews assigned to you.' : `No ${statusFilter.replace('_', ' ')} reviews.`}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(rt => {
            const isOverdue = (rt.status === 'pending' || rt.status === 'in_progress') && new Date(rt.dueDate) < now
            const doc = documents.find(d => d.id === rt.documentId)
            return (
              <Card key={rt.id} className={cn(isOverdue && 'border-red-200')}>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <button
                          onClick={() => navigate(`/documents/${rt.documentId}`)}
                          className="text-sm font-semibold text-slate-900 hover:text-blue-700 transition-colors text-left"
                        >
                          {rt.documentTitle}
                        </button>
                        <Badge className={statusStyles[rt.status]}>{rt.status.replace('_', ' ')}</Badge>
                        {isOverdue && (
                          <Badge className="bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3 mr-1 inline" />Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-mono text-blue-600">{rt.documentNumber}</p>
                      <p className="text-xs text-slate-500 mt-1">{rt.projectName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Assigned to: <strong className="text-slate-700">{rt.assignedTo}</strong></span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: <strong className={cn('ml-1', isOverdue ? 'text-red-600' : 'text-slate-700')}>{formatDate(rt.dueDate)}</strong>
                        </span>
                        <span>By: {rt.assignedBy}</span>
                      </div>
                      {rt.comments.length > 0 && (
                        <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-600">
                            <strong>{rt.comments[rt.comments.length - 1].author}:</strong>{' '}
                            {rt.comments[rt.comments.length - 1].text}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/documents/${rt.documentId}`)}
                      >
                        View
                      </Button>
                      {isReviewer && (rt.status === 'pending' || rt.status === 'in_progress') && rt.assignedToId === user?.id && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<CheckCircle className="w-3.5 h-3.5" />}
                            onClick={() => handleApprove(rt)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<XCircle className="w-3.5 h-3.5" />}
                            onClick={() => setRejectModal({ open: true, docId: rt.documentId, docTitle: rt.documentTitle })}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {/* Managers can also approve/reject any task */}
                      {hasRole('project_manager', 'director', 'company_admin') && (rt.status === 'pending' || rt.status === 'in_progress') && rt.assignedToId !== user?.id && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<CheckCircle className="w-3.5 h-3.5" />}
                            onClick={() => handleApprove(rt)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<XCircle className="w-3.5 h-3.5" />}
                            onClick={() => setRejectModal({ open: true, docId: rt.documentId, docTitle: rt.documentTitle })}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Reject modal */}
      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, docId: '', docTitle: '' })}
        title="Reject Document"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectModal({ open: false, docId: '', docTitle: '' })}>Cancel</Button>
            <Button variant="danger" onClick={handleRejectConfirm} disabled={!rejectReason.trim()}>Reject</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 font-medium">{rejectModal.docTitle}</p>
          <p className="text-sm text-slate-500">Describe what changes are required. This will be sent to the document author.</p>
          <Textarea
            label="Rejection reason *"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Pile spacing doesn't match geotech report..."
            rows={4}
          />
        </div>
      </Modal>
    </div>
  )
}
