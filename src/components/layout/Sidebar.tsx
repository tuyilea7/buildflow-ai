import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, FileText, ClipboardCheck, Users,
  Settings, Bell, BarChart3, Building2, ChevronLeft, ChevronRight,
  Search, Wrench, BookOpen
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { ROLE_LABELS } from '../../lib/utils'
import { useState } from 'react'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  roles?: string[]
}

const NAV: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
  { to: '/projects', icon: <Building2 className="w-4 h-4" />, label: 'Projects' },
  { to: '/documents', icon: <FileText className="w-4 h-4" />, label: 'Documents' },
  { to: '/reviews', icon: <ClipboardCheck className="w-4 h-4" />, label: 'Reviews', roles: ['project_manager', 'document_controller', 'director', 'company_admin', 'architect', 'structural_engineer', 'civil_engineer', 'mep_engineer'] },
  { to: '/search', icon: <Search className="w-4 h-4" />, label: 'AI Search' },
  { to: '/reports', icon: <BarChart3 className="w-4 h-4" />, label: 'Reports', roles: ['director', 'company_admin', 'project_manager'] },
  { to: '/users', icon: <Users className="w-4 h-4" />, label: 'Users', roles: ['company_admin', 'super_admin'] },
  { to: '/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings', roles: ['company_admin', 'super_admin'] },
]

export function Sidebar() {
  const { user } = useAuth()
  const { unreadCount } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const unread = user ? unreadCount(user.id) : 0

  const visibleNav = NAV.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <aside className={cn(
      'h-screen bg-slate-900 flex flex-col transition-all duration-200 shrink-0',
      collapsed ? 'w-14' : 'w-56'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-2.5 px-4 py-4 border-b border-slate-800',
        collapsed && 'justify-center px-0'
      )}>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-tight">BuildFlow AI</div>
            <div className="text-slate-400 text-xs">Construction DMS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {visibleNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors relative',
              collapsed && 'justify-center px-0 mx-1',
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {item.to === '/reviews' && unread > 0 && !collapsed && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className={cn(
          'border-t border-slate-800 px-4 py-3 flex items-center gap-2',
          collapsed && 'justify-center px-0'
        )}>
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-medium truncate">{user.name}</div>
              <div className="text-slate-400 text-xs truncate">{ROLE_LABELS[user.role]}</div>
            </div>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center justify-center py-2 border-t border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}
