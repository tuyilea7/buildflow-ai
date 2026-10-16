import { Bell, LogOut, ChevronDown, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { ROLE_LABELS, formatDateTime, cn } from '../../lib/utils'

export function TopBar({ title }: { title: string }) {
  const { user, logout } = useAuth()
  const { notifications, markNotificationRead, markAllRead, unreadCount } = useApp()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)

  const myNotifs = user ? notifications.filter(n => n.userId === user.id) : []
  const unread = user ? unreadCount(user.id) : 0

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(v => !v); setShowUser(false) }}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                {unread > 0 && user && (
                  <button
                    onClick={() => markAllRead(user.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {myNotifs.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">No notifications</p>
                ) : (
                  myNotifs.slice(0, 10).map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id)
                        if (n.documentId) navigate(`/documents/${n.documentId}`)
                        else if (n.projectId) navigate(`/projects/${n.projectId}`)
                        setShowNotifs(false)
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors',
                        !n.read && 'bg-blue-50'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                        <div className={cn(!n.read && 'ml-0', n.read && 'ml-3.5')}>
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{formatDateTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(v => !v); setShowNotifs(false) }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-xs text-slate-400">{user ? ROLE_LABELS[user.role] : ''}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-11 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/profile'); setShowUser(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4" /> My Profile
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showNotifs || showUser) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifs(false); setShowUser(false) }} />
      )}
    </header>
  )
}
