import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  FileText, Building2, ClipboardCheck, AlertTriangle,
  CheckCircle, Clock, TrendingUp, Users, Upload
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import {
  STATUS_COLORS, STATUS_LABELS, PROJECT_STATUS_COLORS,
  formatDate, timeAgo, ROLE_LABELS
} from '../lib/utils'

const DOC_STATUS_CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#64748b', '#0ea5e9']

export function DashboardPage() {
  const { user } = useAuth()
  const { documents, projects, reviewTasks, activity } = useApp()
  const navigate = useNavigate()

  // Derived stats
  const myProjects = projects.filter(p => p.status !== 'archived')
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalDocs = documents.length
  const pendingReviews = reviewTasks.filter(r => r.status === 'pending' || r.status === 'in_progress').length
  const approvedDocs = documents.filter(d => d.status === 'approved' || d.status === 'published').length
  const draftDocs = documents.filter(d => d.status === 'draft').length

  // Doc status distribution for pie chart
  const statusGroups = ['draft', 'in_review', 'approved', 'published', 'rejected', 'superseded', 'archived'] as const
  const pieData = statusGroups
    .map(s => ({ name: STATUS_LABELS[s], value: documents.filter(d => d.status === s).length }))
    .filter(d => d.value > 0)

  // Documents per project bar chart
  const barData = projects.map(p => ({
    name: p.code.split('-').slice(0, 2).join('-'),
    docs: documents.filter(d => d.projectId === p.id).length,
    reviews: reviewTasks.filter(r => r.projectId === p.id && (r.status === 'pending' || r.status === 'in_progress')).length,
  }))

  // Discipline breakdown
  const disciplines = ['architectural', 'structural', 'civil', 'electrical', 'mechanical', 'cost', 'general'] as const
  const discData = disciplines.map(d => ({
    name: d.charAt(0).toUpperCase() + d.slice(1),
    value: documents.filter(doc => doc.discipline === d).length
  })).filter(d => d.value > 0)

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome back, {user?.name.split(' ')[0]} 👋</h2>
          <p className="text-sm text-slate-500 mt-0.5">{ROLE_LABELS[user?.role ?? 'readonly']} — {formatDate(new Date().toISOString())}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/documents', { state: { openUpload: true } })}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
          <button
            onClick={() => navigate('/documents')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Browse Documents
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Projects"
          value={activeProjects}
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
          subtitle={`${projects.length} total projects`}
        />
        <StatCard
          label="Total Documents"
          value={totalDocs}
          icon={<FileText className="w-5 h-5" />}
          color="purple"
          subtitle={`${approvedDocs} approved`}
        />
        <StatCard
          label="Pending Reviews"
          value={pendingReviews}
          icon={<ClipboardCheck className="w-5 h-5" />}
          color={pendingReviews > 5 ? 'red' : 'amber'}
          subtitle="Awaiting action"
        />
        <StatCard
          label="Drafts"
          value={draftDocs}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="slate"
          subtitle="Not yet submitted"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">Documents by Project</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="docs" name="Documents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reviews" name="Pending Reviews" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">Document Status</h3>
          </CardHeader>
          <CardBody className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" outerRadius={65} dataKey="value" label={({ name, value }) => `${value}`} labelLine={false}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={DOC_STATUS_CHART_COLORS[i % DOC_STATUS_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Projects</h3>
              <button onClick={() => navigate('/projects')} className="text-xs text-blue-600 hover:underline">View all</button>
            </div>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {myProjects.slice(0, 4).map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.code} · {p.location}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-500">{p.totalDocuments} docs</span>
                  <Badge className={PROJECT_STATUS_COLORS[p.status]}>
                    {p.status.replace('_', ' ')}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
          </CardHeader>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto scrollbar-thin">
            {activity.slice(0, 8).map(ev => (
              <div key={ev.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                  {ev.userName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-800">
                    <span className="font-medium">{ev.userName}</span>
                    {' '}<span className="text-slate-500">{ev.action}</span>
                    {' '}<span className="font-medium truncate">{ev.target}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(ev.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending reviews (if any) */}
      {pendingReviews > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Documents Awaiting Review
              </h3>
              <button onClick={() => navigate('/reviews')} className="text-xs text-blue-600 hover:underline">View all</button>
            </div>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {reviewTasks.filter(r => r.status === 'pending' || r.status === 'in_progress').slice(0, 3).map(rt => (
              <button
                key={rt.id}
                onClick={() => navigate(`/reviews`)}
                className="w-full text-left px-5 py-3 hover:bg-slate-50 flex items-center gap-4"
              >
                <ClipboardCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{rt.documentTitle}</p>
                  <p className="text-xs text-slate-400">{rt.projectName} · Due {formatDate(rt.dueDate)}</p>
                </div>
                <Badge className={rt.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}>
                  {rt.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </Badge>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
