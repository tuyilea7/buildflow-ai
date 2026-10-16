import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Plus, Search, Filter, Upload, FileText, X,
  SortAsc, SortDesc, Camera, Image as ImageIcon
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { Card } from '../components/ui/Card'
import {
  STATUS_COLORS, STATUS_LABELS, CATEGORY_LABELS, DISCIPLINE_LABELS,
  formatDate, formatFileSize, getFileIcon, generateDocumentNumber, cn
} from '../lib/utils'
import type { DocumentCategory, Discipline, DocumentStatus } from '../types'

type SortKey = 'title' | 'uploadedAt' | 'updatedAt' | 'status' | 'category'

const CATEGORY_OPTS = [
  { value: 'all', label: 'All Categories' },
  ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))
]
const DISCIPLINE_OPTS = [
  { value: 'all', label: 'All Disciplines' },
  ...Object.entries(DISCIPLINE_LABELS).map(([v, l]) => ({ value: v, label: l }))
]
const STATUS_OPTS = [
  { value: 'all', label: 'All Statuses' },
  ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))
]

export function DocumentsPage() {
  const { documents, projects, addDocument } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const preselectedProject = searchParams.get('project') ?? ''

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [disciplineFilter, setDisciplineFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState(preselectedProject)
  const [sortKey, setSortKey] = useState<SortKey>('uploadedAt')
  const [sortAsc, setSortAsc] = useState(false)
  const [showUpload, setShowUpload] = useState(
    (location.state as { openUpload?: boolean } | null)?.openUpload === true
  )
  const [showFilters, setShowFilters] = useState(false)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    projectId: preselectedProject,
    title: '',
    description: '',
    category: 'drawing' as DocumentCategory,
    discipline: 'architectural' as Discipline,
    tags: '',
    drawingNumber: '',
    zone: '',
    floor: '',
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setUploadedFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/octet-stream': ['.dwg', '.dxf', '.ifc', '.rvt'],
    },
    maxSize: 100 * 1024 * 1024,
    multiple: false,
  })

  // Filtering
  const filtered = documents
    .filter(d => {
      const q = search.toLowerCase()
      const matchSearch = !q
        || d.title.toLowerCase().includes(q)
        || d.documentNumber.toLowerCase().includes(q)
        || d.description.toLowerCase().includes(q)
        || d.tags.some(t => t.toLowerCase().includes(q))
      const matchCat = categoryFilter === 'all' || d.category === categoryFilter
      const matchDisc = disciplineFilter === 'all' || d.discipline === disciplineFilter
      const matchStatus = statusFilter === 'all' || d.status === statusFilter
      const matchProject = !projectFilter || d.projectId === projectFilter
      return matchSearch && matchCat && matchDisc && matchStatus && matchProject
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title)
      else if (sortKey === 'uploadedAt') cmp = a.uploadedAt.localeCompare(b.uploadedAt)
      else if (sortKey === 'updatedAt') cmp = a.updatedAt.localeCompare(b.updatedAt)
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      else if (sortKey === 'category') cmp = a.category.localeCompare(b.category)
      return sortAsc ? cmp : -cmp
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(true) }
  }

  // ── Camera functions ──────────────────────────────────────────────────────
  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      })
      setCameraStream(stream)
      setShowCamera(true)
      // Attach stream to video element after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch {
      // Fallback: use native file input with camera capture
      cameraInputRef.current?.click()
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setCapturedPreview(dataUrl)
  }

  function retakePhoto() {
    setCapturedPreview(null)
  }

  function usePhoto() {
    if (!capturedPreview) return
    // Convert data URL to File
    const arr = capturedPreview.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg'
    const bstr = atob(arr[1])
    const n = bstr.length
    const u8arr = new Uint8Array(n)
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i)
    const file = new File([u8arr], `photo_${Date.now()}.jpg`, { type: mime })
    setUploadedFile(file)
    closeCamera()
  }

  function closeCamera() {
    cameraStream?.getTracks().forEach(t => t.stop())
    setCameraStream(null)
    setShowCamera(false)
    setCapturedPreview(null)
  }

  // Handle native camera input (fallback for devices that block getUserMedia)
  function handleCameraFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setUploadedFile(file)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadedFile || !uploadForm.projectId || !user) return
    setUploading(true)
    await new Promise(r => setTimeout(r, 600))

    const project = projects.find(p => p.id === uploadForm.projectId)
    const ext = uploadedFile.name.split('.').pop()?.toLowerCase() ?? 'pdf'
    const seq = documents.filter(d => d.projectId === uploadForm.projectId).length + 1
    const docNumber = generateDocumentNumber(project?.code ?? 'GEN', uploadForm.discipline, uploadForm.category, seq)
    const now = new Date().toISOString()
    const docId = `d_${Date.now()}`

    addDocument({
      id: docId,
      projectId: uploadForm.projectId,
      projectName: project?.name ?? '',
      documentNumber: docNumber,
      title: uploadForm.title,
      description: uploadForm.description,
      category: uploadForm.category,
      discipline: uploadForm.discipline,
      status: 'draft',
      currentRevision: 'A',
      fileName: uploadedFile.name,
      fileType: ext,
      fileSize: uploadedFile.size,
      uploadedBy: user.name,
      uploadedById: user.id,
      uploadedAt: now,
      updatedAt: now,
      tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      revisions: [{
        id: `r_${Date.now()}`,
        documentId: docId,
        revisionNumber: 'A',
        uploadedBy: user.name,
        uploadedById: user.id,
        uploadedAt: now,
        status: 'draft',
        description: 'Initial upload',
        fileSize: uploadedFile.size,
        fileName: uploadedFile.name,
      }],
      drawingNumber: uploadForm.drawingNumber || undefined,
      zone: uploadForm.zone || undefined,
      floor: uploadForm.floor || undefined,
    }, uploadedFile)

    setUploading(false)
    setShowUpload(false)
    setUploadedFile(null)
    setUploadForm({ projectId: '', title: '', description: '', category: 'drawing', discipline: 'architectural', tags: '', drawingNumber: '', zone: '', floor: '' })
  }

  const projectOpts = [
    { value: '', label: 'All Projects' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ]

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Documents</h2>
          <p className="text-sm text-slate-500">{filtered.length} of {documents.length} documents</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(v => !v)}
          >
            Filters
          </Button>
          <Button
            icon={<Upload className="w-4 h-4" />}
            size="md"
            onClick={() => setShowUpload(true)}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by title, number, tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="w-80"
        />
        <select
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {projectOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={disciplineFilter}
              onChange={e => setDisciplineFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DISCIPLINE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => { setCategoryFilter('all'); setDisciplineFilter('all'); setStatusFilter('all'); setProjectFilter('') }}
              className="text-xs text-blue-600 hover:underline px-2"
            >
              Clear filters
            </button>
          </div>
        </Card>
      )}

      {/* Document table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title="No documents found"
          description="Try adjusting filters or upload a new document."
          action={{ label: 'Upload Document', onClick: () => setShowUpload(true) }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-0 px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <button className="flex items-center gap-1 text-left" onClick={() => toggleSort('title')}>
              Document {sortKey === 'title' && (sortAsc ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
            </button>
            <button className="flex items-center gap-1" onClick={() => toggleSort('category')}>
              Category {sortKey === 'category' && (sortAsc ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
            </button>
            <span>Discipline</span>
            <button className="flex items-center gap-1" onClick={() => toggleSort('status')}>
              Status {sortKey === 'status' && (sortAsc ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
            </button>
            <button className="flex items-center gap-1" onClick={() => toggleSort('updatedAt')}>
              Updated {sortKey === 'updatedAt' && (sortAsc ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
            </button>
            <span>Rev</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-100">
            {filtered.map(doc => (
              <button
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="w-full grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-0 items-center px-5 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">{getFileIcon(doc.fileType)}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{doc.title}</div>
                    <div className="text-xs text-slate-400 font-mono truncate">{doc.documentNumber}</div>
                    <div className="text-xs text-slate-400 truncate">{doc.projectName}</div>
                  </div>
                </div>
                <span className="text-xs text-slate-600">{CATEGORY_LABELS[doc.category]}</span>
                <span className="text-xs text-slate-600">{DISCIPLINE_LABELS[doc.discipline]}</span>
                <Badge className={STATUS_COLORS[doc.status]}>{STATUS_LABELS[doc.status]}</Badge>
                <span className="text-xs text-slate-400">{formatDate(doc.updatedAt)}</span>
                <span className="text-xs font-mono font-semibold text-slate-600 w-8 text-center">
                  {doc.currentRevision}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={showUpload}
        onClose={() => { setShowUpload(false); setUploadedFile(null) }}
        title="Upload Document"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowUpload(false); setUploadedFile(null) }}>Cancel</Button>
            <Button form="upload-doc-form" type="submit" loading={uploading} disabled={!uploadedFile}>
              Upload Document
            </Button>
          </div>
        }
      >
        <form id="upload-doc-form" onSubmit={handleUpload} className="space-y-5">
          {/* File picker area */}
          {!showCamera ? (
            <>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                  isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                )}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    {uploadedFile.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        alt="preview"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <span className="text-3xl shrink-0">{getFileIcon(uploadedFile.name.split('.').pop() ?? '')}</span>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-800">{uploadedFile.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setUploadedFile(null) }}
                      className="ml-4 p-1 rounded hover:bg-slate-200"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">Drop a file here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, DWG, IFC, PNG, JPG — max 100 MB</p>
                  </div>
                )}
              </div>

              {/* Camera / photo option */}
              {!uploadedFile && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              )}
              {!uploadedFile && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={openCamera}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium text-slate-700 hover:text-blue-700"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo with Camera
                  </button>
                  {/* Hidden native camera input (fallback) */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleCameraFileInput}
                  />
                </div>
              )}
            </>
          ) : (
            /* ── In-modal camera panel ── */
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                {!capturedPreview ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                ) : (
                  <img src={capturedPreview} alt="Captured" className="w-full h-full object-cover" />
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3">
                {!capturedPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={closeCamera}
                      className="flex-1 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> Capture Photo
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="flex-1 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={usePhoto}
                      className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" /> Use This Photo
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Project *</label>
              <select
                value={uploadForm.projectId}
                onChange={e => setUploadForm(f => ({ ...f, projectId: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <Input
              label="Document Title *"
              value={uploadForm.title}
              onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Ground Floor Plan"
              required
              className="col-span-2"
            />
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Category *</label>
              <select
                value={uploadForm.category}
                onChange={e => setUploadForm(f => ({ ...f, category: e.target.value as DocumentCategory }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Discipline *</label>
              <select
                value={uploadForm.discipline}
                onChange={e => setUploadForm(f => ({ ...f, discipline: e.target.value as Discipline }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(DISCIPLINE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <Input label="Drawing Number" value={uploadForm.drawingNumber} onChange={e => setUploadForm(f => ({ ...f, drawingNumber: e.target.value }))} placeholder="e.g. A-101" />
            <Input label="Zone / Block" value={uploadForm.zone} onChange={e => setUploadForm(f => ({ ...f, zone: e.target.value }))} placeholder="e.g. Block A" />
            <Input label="Floor / Level" value={uploadForm.floor} onChange={e => setUploadForm(f => ({ ...f, floor: e.target.value }))} placeholder="e.g. Ground Floor" />
            <Input label="Tags (comma-separated)" value={uploadForm.tags} onChange={e => setUploadForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. structural, foundation" />
            <div className="col-span-2">
              <Textarea
                label="Description"
                value={uploadForm.description}
                onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this document..."
                rows={3}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
