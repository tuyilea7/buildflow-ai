import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Eye, EyeOff, Wrench, Lock, Mail } from 'lucide-react'
import { USERS } from '../data/mockData'
import { ROLE_LABELS } from '../lib/utils'

const QUICK_LOGINS = [
  { email: 'edgar@buildflow.rw', label: 'Boss / Director' },
  { email: 'alice@buildflow.rw', label: 'Project Manager' },
  { email: 'jeanpaul@buildflow.rw', label: 'Architect' },
  { email: 'marie@buildflow.rw', label: 'Structural Engineer' },
  { email: 'grace@buildflow.rw', label: 'Document Controller' },
  { email: 'admin@buildflow.rw', label: 'Company Admin' },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.ok) navigate('/dashboard')
    else setError(result.error ?? 'Login failed.')
  }

  async function quickLogin(email: string) {
    setEmail(email)
    setLoading(true)
    const result = await login(email, 'password')
    setLoading(false)
    if (result.ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl">

        {/* Left panel */}
        <div className="bg-blue-600 p-10 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-lg leading-tight">BuildFlow AI</div>
                <div className="text-blue-200 text-xs">Construction Document Management</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold leading-tight mb-3">
              One platform for all your construction documents
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Manage drawings, specifications, BIM models, contracts, schedules, and more.
              Powered by AI search and ISO 19650-inspired workflows.
            </p>
          </div>
          <div className="space-y-3 text-sm text-blue-100">
            <div className="flex items-center gap-2">✓ Role-based access for your entire team</div>
            <div className="flex items-center gap-2">✓ Document review & approval workflows</div>
            <div className="flex items-center gap-2">✓ AI-powered document search</div>
            <div className="flex items-center gap-2">✓ Full revision history & audit trail</div>
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Sign in</h3>
          <p className="text-sm text-slate-400 mb-6">Enter your credentials to access the platform.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@buildflow.rw"
              autoComplete="username"
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          {/* Quick login for demo */}
          <div className="mt-6">
            <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Demo accounts (password: <code className="bg-slate-100 px-1 rounded">password</code>)</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_LOGINS.map(ql => (
                <button
                  key={ql.email}
                  onClick={() => quickLogin(ql.email)}
                  className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-all"
                >
                  <div className="text-xs font-medium text-slate-700 hover:text-blue-700 truncate">{ql.label}</div>
                  <div className="text-xs text-slate-400 truncate">{ql.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
