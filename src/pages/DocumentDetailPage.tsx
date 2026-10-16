import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Download, Send, MessageSquare, CheckCircle,
  XCircle, Clock, Eye, Tag, User, Calendar, FileText, Upload,
  AlertCircle, Info
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Textarea } from '../components/ui/Input'
import { DocumentViewer } from '../components/ui/DocumentViewer'
import {
  STATUS_COLORS, STATUS_LABELS, CATEGORY_LABELS, DISCIPLINE_LABELS,
  formatDate, formatFileSize, getFileIcon, timeAgo, cn
} from '../lib/utils'

// ─── Role rules ────────────────────────────────────────────────────────────
// Who can SUBMIT for review: engineers, architects, QS, document controller, PM
// Who can REVIEW (add comments): document controller, PM, engineers
// Who can APPROVE (final sign-off): Director/Boss, Company Admin, PM
// Who can REJECT: Director/Boss, Company Admin, PM, Document Controller

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { documents, reviewTasks, approveDocument, rejectDocument, updateDocument, fileStore } = useApp()
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()

  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showSubmitReview, setShowSubmitReview] = useState(false)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'details' | 'revisions' | 'reviews'>('preview')

  const doc = documents.find(d => d.id === id)
  const uploadedFile = id ? (fileStore[id] ?? null) : null

  if (!doc) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-slate-500">Document not found.</p>
      <Button variant="ghost" onClick={() => navigate('/documents')} className="mt-3">Back to Documents</Button>
    </div>
  )

  const docReviews = reviewTasks.filter(r => r.documentId === doc.id)

  // Role checks
  const canSubmitForReview = hasRole(
    'architect', 'structural_engineer', 'civil_engineer', 'mep_engineer',
    'quantity_surveyor', 'document_controller', 'project_manager'
  )
  const canApprove = hasRole('director', 'company_admin', 'project_manager')
  const canReject  = hasRole('director', 'company_admin', 'project_manager', 'document_controller')

  function handleApprove() {
    if (!user || !doc) return
    approveDocument(doc.id, user.id, user.name)
    setShowApproveConfirm(false)
  }

  function handleReject() {
    if (!user || !doc || !rejectReason.trim()) return
    rejectDocument(doc.id, user.id, user.name, rejectReason)
    setShowReject(false)
    setRejectReason('')
  }

  function handleSubmitForReview() {
    if (!doc) return
    updateDocument(doc.id, { status: 'in_review', updatedAt: new Date().toISOString() })
    setShowSubmitReview(false)
  }

  function handleDownload() {
    if (!uploadedFile) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(uploadedFile)
    a.download = uploadedFile.name
    a.click()
  }

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Back + header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
            <h2 className="text-lg font-bold text-slate-900">{doc.title}</h2>
            <Badge className={STATUS_COLORS[doc.status]}>{STATUS_LABELS[doc.status]}</Badge>
          </div>
          <p className="text-xs font-mono text-blue-600 mt-0.5">{doc.documentNumber} · Rev {doc.currentRevision}</p>
        </div>

        {/* Action buttons — role gated */}
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {/* Submit for review: only when Draft */}
          {doc.status === 'draft' && canSubmitForReview && (
            <Button size="sm" variant="outline" icon={<Send className="w-4 h-4" />} onClick={() => setShowSubmitReview(true)}>
              Submit for Review
            </Button>
          )}

          {/* Approve: Director, Admin, PM — only when In Review */}
          {doc.status === 'in_review' && canApprove && (
            <Button size="sm" variant="primary" icon={<CheckCircle className="w-4 h-4" />} onClick={() => setShowApproveConfirm(true)}>
              Approve
            </Button>
          )}

          {/* Reject: Director, Admin, PM, Document Controller — only when In Review */}
          {doc.status === 'in_review' && canReject && (
            <Button size="sm" variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={() => setShowReject(true)}>
              Reject
            </Button>
          )}

          {/* Download — only if file exists */}
          {uploadedFile && (
            <Button size="sm" variant="outline" icon={<Download className="w-4 h-4" />} onClick={handleDownload}>
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Role info banner — show who can act on this document */}
      {doc.status === 'draft' && !canSubmitForReview && (
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
          <Info className="w-4 h-4 shrink-0 text-slate-400" />
          <span>This document is a draft. It can be submitted for review by the uploader or document controller.</span>
        </div>
      )}
      {doc.status === 'in_review' && !canApprove && !canReject && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <Clock className="w-4 h-4 shrink-0" />
          <span>This document is awaiting approval from the <strong>Project Manager</strong>, <strong>Director</strong>, or <strong>Company Admin</strong>.</span>
        </div>
      )}
      {doc.status === 'approved' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Approved by <strong>{doc.approvedBy}</strong> on {formatDate(doc.approvedAt ?? '')}. This document is cleared for use.</span>
        </div>
      )}
      {doc.status === 'rejected' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>This document has been rejected. See the Reviews tab for the rejection reason. Upload a new revision to resubmit.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['preview', 'details', 'revisions', 'reviews'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
              activeTab === tab
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab === 'preview' && '👁 '}
            {tab}
            {tab === 'revisions' && ` (${doc.revisions.length})`}
            {tab === 'reviews' && docReviews.length > 0 && ` (${docReviews.length})`}
          </button>
        ))}
      </div>

      {/* ── Preview ── */}
      {activeTab === 'preview' && (
        <div className="space-y-3">
          {!uploadedFile && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>No file available to preview. Upload a new revision to enable the inline viewer.</span>
            </div>
          )}
          <DocumentViewer file={uploadedFile} fileName={doc.fileName} fileType={doc.fileType} />
        </div>
      )}

      {/* ── Details ── */}
      {activeTab === 'details' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><h3 className="text-sm font-semibold text-slate-800">Document Information</h3></CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-slate-600">{doc.description || 'No description provided.'}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Project</span>
                  <p className="font-medium text-slate-800 mt-0.5">{doc.projectName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Category</span>
                  <p className="font-medium text-slate-800 mt-0.5">{CATEGORY_LABELS[doc.category]}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Discipline</span>
                  <p className="font-medium text-slate-800 mt-0.5">{DISCIPLINE_LABELS[doc.discipline]}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wide">File</span>
                  <p className="font-medium text-slate-800 mt-0.5 truncate">{doc.fileName}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(doc.fileSize)}</p>
                </div>
                {doc.drawingNumber && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Drawing No.</span>
                    <p className="font-medium text-slate-800 mt-0.5">{doc.drawingNumber}</p>
                  </div>
                )}
                {doc.zone && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Zone / Block</span>
                    <p className="font-medium text-slate-800 mt-0.5">{doc.zone}</p>
                  </div>
                )}
                {doc.floor && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Floor / Level</span>
                    <p className="font-medium text-slate-800 mt-0.5">{doc.floor}</p>
                  </div>
                )}
              </div>
              {doc.tags.length > 0 && (
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-2">
                    <Tag className="w-3 h-3" /> Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map(tag => (
                      <Badge key={tag} className="bg-slate-100 text-slate-600">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Uploaded by</p>
                    <p className="font-medium text-slate-800">{doc.uploadedBy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Upload date</p>
                    <p className="font-medium text-slate-800">{formatDate(doc.uploadedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Last updated</p>
                    <p className="font-medium text-slate-800">{formatDate(doc.updatedAt)}</p>
                  </div>
                </div>
                {doc.reviewerName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Reviewer</p>
                      <p className="font-medium text-slate-800">{doc.reviewerName}</p>
                    </div>
                  </div>
                )}
                {doc.approvedBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-slate-400">Approved by</p>
                      <p className="font-medium text-slate-800">{doc.approvedBy}</p>
                      {doc.approvedAt && <p className="text-xs text-slate-400">{formatDate(doc.approvedAt)}</p>}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Approval workflow guide */}
            <Card className="border-blue-100 bg-blue-50">
              <CardBody>
                <p className="text-xs font-semibold text-blue-800 mb-2">Approval Workflow</p>
                <div className="space-y-1.5 text-xs text-blue-700">
                  <div className={cn('flex items-center gap-2', doc.status !== 'draft' && 'opacity-40 line-through')}>
                    <span className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold shrink-0">1</span>
                    Draft — uploaded by engineer/architect
                  </div>
                  <div className={cn('flex items-center gap-2', doc.status !== 'in_review' && doc.status === 'draft' ? '' : doc.status === 'in_review' ? 'font-semibold' : 'opacity-40 line-through')}>
                    <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-white font-bold shrink-0', doc.status === 'in_review' ? 'bg-amber-400' : 'bg-slate-300')}>2</span>
                    In Review — submitted for checking
                  </div>
                  <div className={cn('flex items-center gap-2', doc.status === 'approved' ? 'font-semibold' : '')}>
                    <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-white font-bold shrink-0', doc.status === 'approved' ? 'bg-green-500' : 'bg-slate-300')}>3</span>
                    Approved — PM / Director / Admin
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ── Revisions ── */}
      {activeTab === 'revisions' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Revision History</h3>
              <Button size="sm" variant="outline" icon={<Upload className="w-4 h-4" />}>
                Upload New Revision
              </Button>
            </div>
          </CardHeader>
          {doc.revisions.length === 0 ? (
            <CardBody>
              <p className="text-sm text-slate-400 text-center py-4">No revisions recorded.</p>
            </CardBody>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...doc.revisions].reverse().map((rev, i) => (
                <div key={rev.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  )}>
                    {rev.revisionNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{rev.description}</p>
                    <p className="text-xs text-slate-400">
                      {rev.uploadedBy} · {formatDate(rev.uploadedAt)} · {formatFileSize(rev.fileSize)}
                    </p>
                    {rev.comments && (
                      <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1">{rev.comments}</p>
                    )}
                  </div>
                  <Badge className={STATUS_COLORS[rev.status]}>{STATUS_LABELS[rev.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Reviews ── */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {docReviews.length === 0 ? (
            <Card>
              <CardBody>
                <div className="flex flex-col items-center py-8 text-center gap-2">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                  <p className="text-sm text-slate-500">No review history yet.</p>
                  <p className="text-xs text-slate-400">Submit this document for review to start the workflow.</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            docReviews.map(rt => (
              <Card key={rt.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Review — {rt.assignedTo}</p>
                      <p className="text-xs text-slate-400">Assigned by {rt.assignedBy} · Due {formatDate(rt.dueDate)}</p>
                    </div>
                    <Badge className={cn(
                      rt.status === 'approved' ? 'bg-green-100 text-green-700' :
                      rt.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      rt.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    )}>
                      {rt.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                {rt.comments.length > 0 && (
                  <CardBody className="space-y-3">
                    {rt.comments.map(c => (
                      <div key={c.id} className={cn(
                        'flex gap-3 p-3 rounded-lg',
                        c.type === 'rejection' ? 'bg-red-50 border border-red-100' :
                        c.type === 'approval' ? 'bg-green-50 border border-green-100' :
                        'bg-slate-50'
                      )}>
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                          {c.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-800">
                            {c.author}
                            <span className="text-slate-400 font-normal ml-1">{timeAgo(c.createdAt)}</span>
                            {c.type === 'rejection' && <span className="ml-2 text-red-600">· Rejected</span>}
                            {c.type === 'approval' && <span className="ml-2 text-green-600">· Approved</span>}
                          </p>
                          <p className="text-sm text-slate-700 mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </CardBody>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Approve confirm modal ── */}
      <Modal
        open={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title="Approve Document"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApproveConfirm(false)}>Cancel</Button>
            <Button variant="primary" icon={<CheckCircle className="w-4 h-4" />} onClick={handleApprove}>
              Confirm Approval
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">{doc.title}</p>
            <p className="text-xs text-green-600 mt-0.5">{doc.documentNumber} · Rev {doc.currentRevision}</p>
          </div>
          <p className="text-sm text-slate-600">
            You are approving this document as <strong>{user?.name}</strong>. This will mark it as
            <strong> Approved</strong> and make it available to the full team.
          </p>
          <p className="text-xs text-slate-400">
            Only Directors, Company Admins, and Project Managers can approve documents.
          </p>
        </div>
      </Modal>

      {/* ── Reject modal ── */}
      <Modal
        open={showReject}
        onClose={() => setShowReject(false)}
        title="Reject Document"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject Document
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm font-medium text-slate-800">{doc.title}</p>
            <p className="text-xs text-slate-500">{doc.documentNumber} · Rev {doc.currentRevision}</p>
          </div>
          <p className="text-sm text-slate-600">State clearly why this document is being rejected. The uploader will see this reason and must upload a new revision.</p>
          <Textarea
            label="Rejection reason *"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Pile spacing does not match the geotech report requirements. Please revise and resubmit."
            rows={4}
          />
        </div>
      </Modal>

      {/* ── Submit for review modal ── */}
      <Modal
        open={showSubmitReview}
        onClose={() => setShowSubmitReview(false)}
        title="Submit for Review"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSubmitReview(false)}>Cancel</Button>
            <Button icon={<Send className="w-4 h-4" />} onClick={handleSubmitForReview}>Submit for Review</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Submitting this document will change its status to <strong>In Review</strong>.
            The Project Manager, Director, or Company Admin will then be able to approve or reject it.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
            <p>✅ <strong>Can approve:</strong> Director, Company Admin, Project Manager</p>
            <p>↩️ <strong>Can reject:</strong> Director, Company Admin, Project Manager, Document Controller</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
