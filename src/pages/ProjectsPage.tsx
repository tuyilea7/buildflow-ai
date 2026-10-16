import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Building2, Users, FileText, Calendar, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Card, CardBody } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PROJECT_STATUS_COLORS, formatDate, cn } from '../lib/utils'
import type { ProjectStatus } from '../types'
import { USERS } from '../data/mockData'

const STATUS_OPTS: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export function ProjectsPage() {
  const { projects, addProject } = useApp()
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)

  // Create form state
  const [form, setForm] = useState({
    name: '', code: '', description: '', location: '',
    client: '', projectManagerId: '', startDate: '', endDate: '', status: 'planning' as ProjectStatus
  })
  const [creating, setCreating] = useState(false)

  const managers = USERS.filter(u => u.role === 'project_manager')

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      || p.code.toLowerCase().includes(search.toLowerCase())
      || p.location.toLowerCase().includes(search.toLowerCase())
      || p.client.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    await new Promise(r => setTimeout(r, 400))
    const pm = USERS.find(u => u.id === form.projectManagerId)
    addProject({
      id: `p_${Date.now()}`,
      ...form,
      projectManager: pm?.name ?? 'Unassigned',
      totalDocuments: 0,
      pendingReviews: 0,
      teamSize: 1,
      disciplines: [],
      createdAt: new Date().toISOString(),
    })
    setCreating(false)
    setShowCreate(false)
    setForm({ name: '', code: '', description: '', location: '', client: '', projectManagerId: '', startDate: '', endDate: '', status: 'planning' })
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Construction Projects</h2>
          <p className="text-sm text-slate-500">{projects.length} total projects</p>
        </div>
        {hasRole('company_admin', 'director', 'super_admin') && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
            New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="w-64"
        />
        <div className="flex gap-1.5">
          {STATUS_OPTS.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value as ProjectStatus | 'all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                statusFilter === s.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-12 h-12" />}
          title={projects.length === 0
            ? hasRole('company_admin', 'director', 'super_admin')
              ? 'No projects yet'
              : 'No projects available'
            : 'No projects match your search'
          }
          description={projects.length === 0
            ? hasRole('company_admin', 'director', 'super_admin')
              ? 'Create the first project. Your team will then be able to upload and manage documents.'
              : 'No projects have been created yet. Ask your Company Admin or Director to create a project.'
            : 'Try adjusting your search or filters.'
          }
          action={hasRole('company_admin', 'director', 'super_admin') && projects.length === 0
            ? { label: 'Create First Project', onClick: () => setShowCreate(true) }
            : undefined
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Card
              key={p.id}
              hoverable
              onClick={() => navigate(`/projects/${p.id}`)}
              className="flex flex-col"
            >
              <CardBody className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge className={PROJECT_STATUS_COLORS[p.status]}>
                    {p.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1">{p.name}</h3>
                <p className="text-xs text-blue-600 font-mono mb-2">{p.code}</p>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{p.description}</p>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 shrink-0" />
                    <span>PM: {p.projectManager}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>{formatDate(p.startDate)} → {formatDate(p.endDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="font-semibold">{p.totalDocuments}</span>
                    <span className="text-slate-400">docs</span>
                  </div>
                  {p.pendingReviews > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                      <span className="font-semibold">{p.pendingReviews}</span>
                      <span>pending</span>
                    </div>
                  )}
                  <div className="ml-auto text-xs text-slate-400">
                    {p.teamSize} members
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create project modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Project"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button form="create-project-form" type="submit" loading={creating}>Create Project</Button>
          </div>
        }
      >
        <form id="create-project-form" onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Project Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Kigali Heights" required className="col-span-2" />
            <Input label="Project Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. KGL-RES-2024-005" required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <Input label="Client / Owner" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Client name" required className="col-span-2" />
            <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Kiyovu, Kigali" required className="col-span-2" />
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-sm font-medium text-slate-700">Project Manager</label>
              <select value={form.projectManagerId} onChange={e => setForm(f => ({ ...f, projectManagerId: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Select PM...</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Project description..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
