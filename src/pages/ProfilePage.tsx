import { useState } from 'react'
import {
  User, Mail, Phone, Building2, Calendar,
  Shield, Key, Save, CheckCircle, Bell,
  FileText, Activity, Eye, EyeOff
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { Input, Textarea } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StatCard } from '../components/ui/StatCard'
import { ROLE_LABELS, formatDate, timeAgo, cn } from '../lib/utils'

export function ProfilePage() {
  const { user } = useAuth()
  const { documents, reviewTasks, activity, notifications } = useApp()

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile')
  const [saved, setSaved] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    department: user?.department ?? '',
    bio: '',
  })

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')

  if (!user) return null

  // User-specific stats
  const myDocs = documents.filter(d => d.uploadedById === user.id)
  const myReviews = reviewTasks.filter(r => r.assignedToId === user.id)
  const myActivity = activity.filter(a => a.userId === user.id)
  const myNotifs = notifications.filter(n => n.userId === user.id)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    await new Promise(r => setTimeout(r, 400))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (pwForm.current !== 'password') { setPwError('Current password is incorrect.'); return }
    if (pwForm.newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    await new Promise(r => setTimeout(r, 400))
    setPwForm({ current: '', newPw: '', confirm: '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'security', label: 'Security' },
    { key: 'activity', label: 'My Activity' },
  ] as const

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Profile header */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="bg-blue-100 text-blue-700">{ROLE_LABELS[user.role]}</Badge>
                <span className="text-sm text-slate-500">{user.department}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-sm text-slate-500">{user.email}</span>
              </div>
              {user.lastLogin && (
                <p className="text-xs text-slate-400 mt-1">Last login: {formatDate(user.lastLogin)}</p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="My Documents" value={myDocs.length} icon={<FileText className="w-5 h-5" />} color="blue" />
        <StatCard label="Reviews Assigned" value={myReviews.length} icon={<Shield className="w-5 h-5" />} color="amber" />
        <StatCard label="My Actions" value={myActivity.length} icon={<Activity className="w-5 h-5" />} color="purple" />
        <StatCard label="Notifications" value={myNotifs.filter(n => !n.read).length} icon={<Bell className="w-5 h-5" />} color={myNotifs.filter(n => !n.read).length > 0 ? 'red' : 'slate'} subtitle="unread" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Personal Information</h3>
              {saved && <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 inline mr-1" />Saved</Badge>}
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  icon={<User className="w-4 h-4" />}
                  className="col-span-2"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                  icon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Phone"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  icon={<Phone className="w-4 h-4" />}
                />
                <Input
                  label="Department"
                  value={profileForm.department}
                  onChange={e => setProfileForm(f => ({ ...f, department: e.target.value }))}
                  icon={<Building2 className="w-4 h-4" />}
                  className="col-span-2"
                />
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Role</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{ROLE_LABELS[user.role]}</span>
                    <span className="text-xs text-slate-400 ml-auto">Contact admin to change</span>
                  </div>
                </div>
                <Textarea
                  label="Bio"
                  value={profileForm.bio}
                  onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="A short description about yourself..."
                  rows={3}
                  className="col-span-2"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" icon={<Save className="w-4 h-4" />}>Save Changes</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><h3 className="text-sm font-semibold text-slate-800">Change Password</h3></CardHeader>
            <CardBody>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                {pwError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{pwError}</div>
                )}
                {saved && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Password updated successfully.
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={pwForm.current}
                      onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={pwForm.newPw}
                      onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  required
                />
                <Button type="submit" icon={<Key className="w-4 h-4" />}>Update Password</Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="text-sm font-semibold text-slate-800">Account Information</h3></CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Account created</span>
                <span className="font-medium text-slate-800">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last login</span>
                <span className="font-medium text-slate-800">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account status</span>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-xs text-slate-400">{user.id}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Activity tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><h3 className="text-sm font-semibold text-slate-800">My Recent Activity</h3></CardHeader>
            {myActivity.length === 0 ? (
              <CardBody>
                <p className="text-sm text-slate-400 text-center py-4">No activity recorded yet.</p>
              </CardBody>
            ) : (
              <div className="divide-y divide-slate-100">
                {myActivity.map(ev => (
                  <div key={ev.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800">
                        <span className="text-slate-500">{ev.action}</span>{' '}
                        <strong>{ev.target}</strong>
                      </p>
                      <p className="text-xs text-slate-400">{timeAgo(ev.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader><h3 className="text-sm font-semibold text-slate-800">My Notifications</h3></CardHeader>
            {myNotifs.length === 0 ? (
              <CardBody>
                <p className="text-sm text-slate-400 text-center py-4">No notifications.</p>
              </CardBody>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {myNotifs.map(n => (
                  <div key={n.id} className={cn('px-5 py-3', !n.read && 'bg-blue-50')}>
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                      <div className={cn(!n.read ? '' : 'ml-3.5')}>
                        <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
