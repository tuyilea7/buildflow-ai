import { useState, useEffect } from 'react'
import {
  Download, Maximize2, ZoomIn, ZoomOut, RotateCw,
  FileText, FileSpreadsheet, File, Image as ImageIcon, X
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface DocumentViewerProps {
  file: File | null
  fileName: string
  fileType: string
}

function resolveType(file: File | null, fileType: string): string {
  // Prefer MIME type from the actual File object — most reliable
  if (file?.type) {
    const mime = file.type.toLowerCase()
    if (mime === 'application/pdf' || mime.includes('pdf')) return 'pdf'
    if (mime.startsWith('image/')) return 'image'
    if (mime.includes('word') || mime.includes('document')) return 'office'
    if (mime.includes('sheet') || mime.includes('excel')) return 'office'
    if (mime.includes('presentation') || mime.includes('powerpoint')) return 'office'
  }
  // Fall back to extension
  const ext = (file?.name ?? fileType).split('.').pop()?.toLowerCase() ?? fileType.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image'
  if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext)) return 'office'
  if (['dwg', 'dxf', 'ifc', 'rvt'].includes(ext)) return 'cad'
  return 'other'
}

export function DocumentViewer({ file, fileName, fileType }: DocumentViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [imgScale, setImgScale] = useState(1)
  const [imgRotation, setImgRotation] = useState(0)

  const kind = resolveType(file, fileType)

  useEffect(() => {
    if (!file) { setObjectUrl(null); return }
    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleDownload() {
    if (!file || !objectUrl) return
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = file.name || fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // ── No file yet (pre-existing mock documents) ─────────────────────────────
  if (!file || !objectUrl) {
    const Icon = kind === 'pdf' ? FileText
      : kind === 'image' ? ImageIcon
      : kind === 'office' ? FileSpreadsheet
      : File
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-slate-50 rounded-xl border border-dashed border-slate-200 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">{fileName}</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            This is a pre-existing document. Upload a new revision to enable the inline viewer.
          </p>
        </div>
      </div>
    )
  }

  // ── PDF — native browser renderer via <iframe> ────────────────────────────
  if (kind === 'pdf') {
    return (
      <div className={cn(
        'flex flex-col rounded-xl overflow-hidden border border-slate-200 bg-slate-100',
        fullscreen && 'fixed inset-2 z-50 shadow-2xl'
      )}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200">
          <span className="text-sm font-medium text-slate-700 flex-1 truncate">{file.name}</span>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button
            onClick={() => setFullscreen(v => !v)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Browser-native PDF render */}
        <iframe
          src={`${objectUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          title={file.name}
          className="w-full bg-slate-100"
          style={{ height: fullscreen ? 'calc(100vh - 56px)' : '70vh', border: 'none' }}
        />
      </div>
    )
  }

  // ── Image ─────────────────────────────────────────────────────────────────
  if (kind === 'image') {
    return (
      <div className={cn(
        'flex flex-col rounded-xl overflow-hidden border border-slate-200 bg-slate-100',
        fullscreen && 'fixed inset-2 z-50 shadow-2xl'
      )}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200">
          <span className="text-sm font-medium text-slate-700 flex-1 truncate">{file.name}</span>
          <button onClick={() => setImgScale(s => Math.max(0.2, +(s - 0.2).toFixed(1)))} className="p-1.5 rounded hover:bg-slate-100 transition-colors" title="Zoom out">
            <ZoomOut className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-xs text-slate-500 w-10 text-center">{Math.round(imgScale * 100)}%</span>
          <button onClick={() => setImgScale(s => Math.min(5, +(s + 0.2).toFixed(1)))} className="p-1.5 rounded hover:bg-slate-100 transition-colors" title="Zoom in">
            <ZoomIn className="w-4 h-4 text-slate-600" />
          </button>
          <button onClick={() => setImgRotation(r => (r + 90) % 360)} className="p-1.5 rounded hover:bg-slate-100 transition-colors" title="Rotate">
            <RotateCw className="w-4 h-4 text-slate-600" />
          </button>
          <button onClick={() => { setImgScale(1); setImgRotation(0) }} className="text-xs px-2 py-1 rounded hover:bg-slate-100 text-slate-500 transition-colors">
            Reset
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button onClick={() => setFullscreen(v => !v)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            {fullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Image */}
        <div
          className="overflow-auto flex items-center justify-center p-6 bg-slate-100"
          style={{ height: fullscreen ? 'calc(100vh - 56px)' : '70vh' }}
        >
          <img
            src={objectUrl}
            alt={file.name}
            draggable={false}
            style={{
              transform: `scale(${imgScale}) rotate(${imgRotation}deg)`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
          />
        </div>
      </div>
    )
  }

  // ── Office / CAD / other — download prompt ────────────────────────────────
  const Icon = kind === 'office' ? FileSpreadsheet : kind === 'cad' ? FileText : File
  const hint = kind === 'office'
    ? 'Word, Excel, and PowerPoint files cannot render in the browser.'
    : kind === 'cad'
    ? 'CAD/BIM files (.dwg, .ifc, .rvt) need specialist software.'
    : 'This file type cannot be previewed in the browser.'

  return (
    <div className="flex flex-col items-center justify-center h-72 bg-slate-50 rounded-xl border border-dashed border-slate-300 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
        <Icon className="w-8 h-8 text-blue-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">{file.name}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">{hint}</p>
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Download className="w-4 h-4" /> Download to Open
      </button>
    </div>
  )
}
