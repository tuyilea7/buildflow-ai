import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Sparkles, FileText, ArrowRight,
  Lightbulb, Clock, X, CornerDownLeft
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import {
  STATUS_COLORS, STATUS_LABELS, CATEGORY_LABELS, DISCIPLINE_LABELS,
  formatDate, formatFileSize, getFileIcon, cn
} from '../lib/utils'
import type { Document } from '../types'

// Simulated AI responses keyed to common construction queries
const AI_RESPONSES: Record<string, string> = {
  foundation: 'Found documents related to foundation work. The Foundation Layout (KGL-RES-STR-DRW-001) is currently in review. Revision A was rejected due to pile spacing issues; Revision B addresses the geotech report requirements and awaits approval.',
  electrical: 'The Electrical Single Line Diagram (KGL-RES-MEP-ELEC-001) is currently in draft status, uploaded by David Bizimana. It covers the HV/LV configuration including the standby generator.',
  architectural: 'Multiple approved architectural drawings are available. The Ground Floor Plan (KGL-RES-ARCH-DRW-001, Rev C) is fully approved. The Typical Floor Plan for Remera Commercial Hub is also approved.',
  approved: 'There are 5 approved or published documents across all projects. These include the Ground Floor Plan, Bill of Quantities, Master Construction Programme, Monthly Progress Report, and Typical Floor Plan.',
  overdue: 'The Foundation Layout review (RT1) assigned to Grace Ingabire was due on 15 Oct 2024 and is still in progress. You may want to follow up.',
  structural: 'Two structural documents exist: the Foundation Layout Drawing (in review) and the Structural Steel Specification for Remera Commercial Hub (also in review). Both require action from the document controller.',
  bq: 'The Bill of Quantities for the Substructure (KGL-RES-QS-BOQ-001) is at Revision B and has been approved by Alice Uwimana on 10 Sep 2024.',
  default: "I searched through all project documents and found relevant results below. You can click any document to view full details, revision history, and review status.",
}

const SUGGESTED_QUERIES = [
  'Show me all approved drawings',
  'Foundation layout documents',
  'What documents are pending review?',
  'Structural engineering documents',
  'Overdue document reviews',
  'Electrical drawings for Kigali Heights',
  'Bill of Quantities',
  'Documents uploaded this month',
]

interface SearchResult {
  doc: Document
  relevance: number
  matchReason: string
}

function scoreDocument(doc: Document, query: string): SearchResult | null {
  const q = query.toLowerCase()
  const words = q.split(/\s+/).filter(Boolean)
  let score = 0
  const reasons: string[] = []

  const fields = [
    doc.title.toLowerCase(),
    doc.description.toLowerCase(),
    doc.documentNumber.toLowerCase(),
    doc.category,
    doc.discipline,
    doc.status,
    doc.projectName.toLowerCase(),
    doc.tags.join(' ').toLowerCase(),
    doc.fileName.toLowerCase(),
    doc.uploadedBy.toLowerCase(),
    (doc.drawingNumber ?? '').toLowerCase(),
    (doc.zone ?? '').toLowerCase(),
    (doc.floor ?? '').toLowerCase(),
  ]

  for (const word of words) {
    if (doc.title.toLowerCase().includes(word)) { score += 5; reasons.push('title match') }
    if (doc.documentNumber.toLowerCase().includes(word)) { score += 4; reasons.push('document number') }
    if (doc.tags.some(t => t.toLowerCase().includes(word))) { score += 3; reasons.push('tag match') }
    if (doc.discipline.includes(word)) { score += 3; reasons.push('discipline') }
    if (doc.category.includes(word)) { score += 3; reasons.push('category') }
    if (doc.status.includes(word)) { score += 2; reasons.push('status') }
    if (doc.projectName.toLowerCase().includes(word)) { score += 2; reasons.push('project') }
    if (doc.description.toLowerCase().includes(word)) { score += 1; reasons.push('description') }
    if (doc.uploadedBy.toLowerCase().includes(word)) { score += 1; reasons.push('uploader') }
    if (fields.some(f => f.includes(word))) score += 1
  }

  // Special tokens
  if ((q.includes('approved') || q.includes('approval')) && (doc.status === 'approved' || doc.status === 'published')) score += 4
  if (q.includes('review') && doc.status === 'in_review') score += 4
  if (q.includes('draft') && doc.status === 'draft') score += 4
  if (q.includes('drawing') && doc.category === 'drawing') score += 3
  if ((q.includes('spec') || q.includes('specification')) && doc.category === 'specification') score += 3
  if (q.includes('bq') || q.includes('bill')) { if (doc.category === 'bq') score += 4 }

  if (score === 0) return null
  return {
    doc,
    relevance: score,
    matchReason: [...new Set(reasons)].slice(0, 2).join(', ')
  }
}

export function AISearchPage() {
  const { documents } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiResponse, setAiResponse] = useState('')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  async function doSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setSearched(false)

    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 700))

    const scored = documents
      .map(doc => scoreDocument(doc, q))
      .filter((r): r is SearchResult => r !== null)
      .sort((a, b) => b.relevance - a.relevance)

    setResults(scored)

    // Pick AI response
    const lower = q.toLowerCase()
    const key = Object.keys(AI_RESPONSES).find(k => lower.includes(k)) ?? 'default'
    setAiResponse(AI_RESPONSES[key])

    setSearched(true)
    setLoading(false)
    setHistory(prev => [q, ...prev.filter(h => h !== q)].slice(0, 5))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doSearch(query)
  }

  function handleSuggestion(s: string) {
    setQuery(s)
    doSearch(s)
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center pt-4 pb-2">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">AI Document Search</h2>
        </div>
        <p className="text-sm text-slate-500">Ask anything about your construction documents in plain language</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 bg-white shadow-sm transition-colors',
          loading ? 'border-blue-400' : 'border-slate-200 focus-within:border-blue-400'
        )}>
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Try "Show all approved drawings" or "Foundation layout documents"'
            className="flex-1 text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setSearched(false); setResults([]) }}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>Search <CornerDownLeft className="w-3 h-3" /></>
            )}
          </button>
        </div>
      </form>

      {/* Suggestions */}
      {!searched && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" /> Suggested queries
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {history.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Recent searches
              </p>
              <div className="flex flex-wrap gap-2">
                {history.map(h => (
                  <button
                    key={h}
                    onClick={() => handleSuggestion(h)}
                    className="px-3 py-1.5 rounded-full text-sm bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-colors"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Response */}
      {searched && aiResponse && (
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-800 mb-1">AI Analysis</p>
                <p className="text-sm text-slate-700 leading-relaxed">{aiResponse}</p>
                <p className="text-xs text-slate-400 mt-2">{results.length} document{results.length !== 1 ? 's' : ''} matched your query</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium">No documents found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try different keywords or browse All Documents</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/documents')}>
                Browse All Documents
              </Button>
            </div>
          ) : (
            results.map(({ doc, relevance, matchReason }) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0">{getFileIcon(doc.fileType)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {doc.title}
                      </span>
                      <Badge className={STATUS_COLORS[doc.status]}>{STATUS_LABELS[doc.status]}</Badge>
                      <span className="text-xs text-slate-400">Rev {doc.currentRevision}</span>
                    </div>
                    <p className="text-xs font-mono text-blue-600 mt-0.5">{doc.documentNumber}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span>{doc.projectName}</span>
                      <span>·</span>
                      <span>{CATEGORY_LABELS[doc.category]}</span>
                      <span>·</span>
                      <span>{DISCIPLINE_LABELS[doc.discipline]}</span>
                      <span>·</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>·</span>
                      <span>{formatDate(doc.updatedAt)}</span>
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {doc.tags.map(tag => (
                          <Badge key={tag} className="bg-slate-100 text-slate-500 text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-1.5 italic">Matched by: {matchReason}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
