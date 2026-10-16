import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts'
import {
  BarChart3, FileText, CheckCircle, Clock,
  TrendingUp, Download, Calendar, Building2, Users
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import {
  STATUS_LABELS, STATUS_COLORS, DISCIPLINE_LABELS, CATEGORY_LABELS,
  PROJECT_STATUS_COLORS, formatDate, cn
} from '../lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#84cc16']

export function ReportsPage() {
  const { documents, projects, reviewTasks, activity } = useApp()
  const [activeReport, setActiveReport] = useState<'overview' | 'documents' | 'projects' | 'activity'>('overview')

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalDocs = documents.length
  const approvedDocs = documents.filter(d => d.status === 'approved' || d.status === 'published').length
  const inReviewDocs = documents.filter(d => d.status === 'in_review').length
  const draftDocs = documents.filter(d => d.status === 'draft').length
  const approvalRate = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0
  const pendingReviews = reviewTasks.filter(r => r.status === 'pending' || r.status === 'in_progress').length
  const overdueReviews = reviewTasks.filter(r =>
    (r.status === 'pending' || r.status === 'in_progress') && new Date(r.dueDate) < new Date()
  ).length

  // ── Chart data ─────────────────────────────────────────────────────────────
  const statusData = [
    { name: 'Draft', value: draftDocs, fill: '#64748b' },
    { name: 'In Review', value: inReviewDocs, fill: '#f59e0b' },
    { name: 'Approved', value: approvedDocs, fill: '#10b981' },
    { name: 'Rejected', value: documents.filter(d => d.status === 'rejected').length, fill: '#ef4444' },
    { name: 'Published', value: documents.filter(d => d.status === 'published').length, fill: '#3b82f6' },
    { name: 'Archived', value: documents.filter(d => d.status === 'archived').length, fill: '#cbd5e1' },
  ].filter(d => d.value > 0)

  const disciplineData = Object.keys(DISCIPLINE_LABELS).map((d, i) => ({
    name: DISCIPLINE_LABELS[d as keyof typeof DISCIPLINE_LABELS],
    value: documents.filter(doc => doc.discipline === d).length,
    fill: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0)

  const categoryData = Object.keys(CATEGORY_LABELS).map((c, i) => ({
    name: CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS],
    value: documents.filter(doc => doc.category === c).length,
    fill: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0)

  const projectData = projects.map(p => ({
    name: p.code.split('-').slice(0, 2).join('-'),
    fullName: p.name,
    docs: documents.filter(d => d.projectId === p.id).length,
    approved: documents.filter(d => d.projectId === p.id && (d.status === 'approved' || d.status === 'published')).length,
    pending: reviewTasks.filter(r => r.projectId === p.id && (r.status === 'pending' || r.status === 'in_progress')).length,
  }))

  // Simulated monthly upload trend (last 8 months)
  const monthlyTrend = [
    { month: 'Mar', docs: 5 }, { month: 'Apr', docs: 8 }, { month: 'May', docs: 12 },
    { month: 'Jun', docs: 7 }, { month: 'Jul', docs: 15 }, { month: 'Aug', docs: 11 },
    { month: 'Sep', docs: 18 }, { month: 'Oct', docs: totalDocs - 76 < 0 ? 9 : totalDocs - 76 },
  ]

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'documents', label: 'Documents' },
    { key: 'projects', label: 'Projects' },
    { key: 'activity', label: 'Activity' },
  ] as const

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-500">Company-wide document management insights</p>
        </div>
        <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
          Export Report
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Documents" value={totalDocs} icon={<FileText className="w-5 h-5" />} color="blue" subtitle={`${approvalRate}% approval rate`} />
        <StatCard label="Approved / Published" value={approvedDocs} icon={<CheckCircle className="w-5 h-5" />} color="green" subtitle="Ready for use" />
        <StatCard label="Pending Reviews" value={pendingReviews} icon={<Clock className="w-5 h-5" />} color={pendingReviews > 3 ? 'amber' : 'slate'} subtitle={`${overdueReviews} overdue`} />
        <StatCard label="Active Projects" value={projects.filter(p => p.status === 'active').length} icon={<Building2 className="w-5 h-5" />} color="purple" subtitle={`${projects.length} total`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeReport === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeReport === 'overview' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Status pie */}
            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Documents by Status</h3></CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="45%" outerRadius={70} dataKey="value" label={({ value }) => value} labelLine={false}>
                      {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Discipline bar */}
            <Card className="lg:col-span-2">
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Documents by Discipline</h3></CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={disciplineData} margin={{ top: 4, right: 4, left: -24, bottom: 40 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Documents" radius={[4, 4, 0, 0]}>
                      {disciplineData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Monthly trend */}
          <Card>
            <CardHeader><h3 className="text-sm font-semibold text-slate-800">Monthly Upload Trend (2024)</h3></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={monthlyTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="docs" name="Documents Uploaded" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Documents tab */}
      {activeReport === 'documents' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Documents by Category</h3></CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 60, right: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="value" name="Documents" radius={[0, 4, 4, 0]}>
                      {categoryData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Document Status Summary</h3></CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {statusData.map(s => (
                    <div key={s.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.fill }} />
                      <span className="text-sm text-slate-700 flex-1">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-slate-100 w-24 overflow-hidden">
                          <div className="h-2 rounded-full" style={{ width: `${(s.value / totalDocs) * 100}%`, background: s.fill }} />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 w-8 text-right">{s.value}</span>
                        <span className="text-xs text-slate-400 w-8">{Math.round((s.value / totalDocs) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Projects tab */}
      {activeReport === 'projects' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><h3 className="text-sm font-semibold text-slate-800">Documents per Project</h3></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={projectData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="docs" name="Total Documents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <div className="grid gap-3">
            {projects.map(p => {
              const pDocs = documents.filter(d => d.projectId === p.id)
              const pApproved = pDocs.filter(d => d.status === 'approved' || d.status === 'published').length
              const pRate = pDocs.length > 0 ? Math.round((pApproved / pDocs.length) * 100) : 0
              return (
                <Card key={p.id}>
                  <CardBody>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                          <Badge className={PROJECT_STATUS_COLORS[p.status]}>{p.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-xs font-mono text-blue-600">{p.code}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span><strong className="text-slate-800">{pDocs.length}</strong> docs</span>
                          <span><strong className="text-green-700">{pApproved}</strong> approved</span>
                          <span><strong className="text-amber-700">{p.pendingReviews}</strong> pending</span>
                          <span>{pRate}% approval rate</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-bold text-slate-900">{pRate}%</div>
                        <div className="text-xs text-slate-400">approval rate</div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${pRate}%` }} />
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Activity tab */}
      {activeReport === 'activity' && (
        <Card>
          <CardHeader><h3 className="text-sm font-semibold text-slate-800">Full Activity Log</h3></CardHeader>
          <div className="divide-y divide-slate-100">
            {activity.map(ev => (
              <div key={ev.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                  {ev.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">
                    <strong>{ev.userName}</strong> {ev.action} <strong>{ev.target}</strong>
                  </p>
                  <p className="text-xs text-slate-400">{ev.createdAt ? new Date(ev.createdAt).toLocaleString('en-GB') : ''}</p>
                </div>
                {ev.projectId && (
                  <span className="text-xs text-slate-400 shrink-0">{ev.projectId}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
