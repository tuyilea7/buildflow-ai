import { useState } from 'react'
import {
  Users, Plus, Search, Shield, UserCheck,
  UserX, Mail, Phone, Building2, Edit
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Card, CardBody } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { ROLE_LABELS, formatDate, cn } from '../lib/utils'
import type { User, UserRole } from '../types'
import { USERS as INITIAL_USERS } from '../data/mockData'

const ROLE_OPTS = [
  { value: 'all', label: 'All Roles' },
  ...Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))
]

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-red-100 text-red-700',
  company_admin: 'bg-purple-100 text-purple-700',
  director: 'bg-indigo-100 text-indigo-700',
  project_manager: 'bg-blue-100 text-blue-700',
  architect: 'bg-sky-100 text-sky-700',
  civil_engineer: 'bg-teal-100 text-teal-700',
  structural_engineer: 'bg-cyan-100 text-cyan-700',
  mep_engineer: 'bg-emerald-100 text-emerald-700',
  quantity_surveyor: 'bg-lime-100 text-lime-700',
  document_controller: 'bg-amber-100 text-amber-700',
  contractor: 'bg-orange-100 text-orange-700',
  readonly: 'bg-slate-100 text-slate-600',
}

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', role: 'readonly' as UserRole,
    department: '', phone: '',
  })

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || u.department.toLowerCase().includes(q)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const active = users.filter(u => u.active).length
  const inactive = users.filter(u => !u.active).length

  function resetForm() {
    setForm({ name: '', email: '', role: 'readonly', department: '', phone: '' })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    await new Promise(r => setTimeout(r, 400))
    const newUser: User = {
      id: `u_${Date.now()}`,
      ...form,
      active: true,
      createdAt: new Date().toISOString(),
    }
    setUsers(prev => [...prev, newUser])
    setCreating(false)
    setShowCreate(false)
    resetForm()
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setCreating(true)
    await new Promise(r => setTimeout(r, 400))
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u))
    setCreating(false)
    setEditUser(null)
    resetForm()
  }

  function openEdit(u: User) {
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department, phone: u.phone ?? '' })
    setEditUser(u)
  }

  function toggleActive(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))
  }

  const roleOptsForForm = Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">
            {active} active · {inactive} inactive · {users.length} total
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="w-64"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ROLE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* User grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="No users found"
          description="Try adjusting your search or role filter."
        />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(u => (
            <Card key={u.id} className={cn(!u.active && 'opacity-60')}>
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0',
                    u.active ? 'bg-blue-500' : 'bg-slate-400'
                  )}>
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                        <Badge className={cn('mt-0.5', ROLE_COLORS[u.role])}>{ROLE_LABELS[u.role]}</Badge>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => toggleActive(u.id)}
                            className={cn(
                              'p-1 rounded transition-colors',
                              u.active
                                ? 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                                : 'hover:bg-green-50 text-slate-400 hover:text-green-500'
                            )}
                            title={u.active ? 'Deactivate' : 'Activate'}
                          >
                            {u.active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span>{u.department}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className={cn(
                        'text-xs font-medium',
                        u.active ? 'text-green-600' : 'text-red-500'
                      )}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                      {u.lastLogin && (
                        <span className="text-xs text-slate-400">Last seen {formatDate(u.lastLogin)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {[{ open: showCreate, isEdit: false }, { open: !!editUser, isEdit: true }].map(({ open, isEdit }) => (
        <Modal
          key={isEdit ? 'edit' : 'create'}
          open={open}
          onClose={() => { isEdit ? setEditUser(null) : setShowCreate(false); resetForm() }}
          title={isEdit ? `Edit User — ${editUser?.name}` : 'Add New User'}
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { isEdit ? setEditUser(null) : setShowCreate(false); resetForm() }}>
                Cancel
              </Button>
              <Button form={isEdit ? 'edit-user-form' : 'create-user-form'} type="submit" loading={creating}>
                {isEdit ? 'Save Changes' : 'Add User'}
              </Button>
            </div>
          }
        >
          <form
            id={isEdit ? 'edit-user-form' : 'create-user-form'}
            onSubmit={isEdit ? handleEdit : handleCreate}
            className="space-y-4"
          >
            <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Alice Uwimana" required />
            <Input label="Email Address *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="alice@buildflow.rw" required />
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Role *</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roleOptsForForm.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <Input label="Department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Architecture" />
            <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+250 788 000 000" />
            {!isEdit && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <Shield className="w-3.5 h-3.5 inline mr-1" />
                  A temporary password will be generated and sent to the user's email address.
                  (Demo: use <code className="bg-blue-100 px-1 rounded">password</code>)
                </p>
              </div>
            )}
          </form>
        </Modal>
      ))}
    </div>
  )
}
