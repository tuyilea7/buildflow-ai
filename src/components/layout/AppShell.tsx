import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/documents': 'Documents',
  '/reviews': 'Reviews & Approvals',
  '/search': 'AI Document Search',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/settings': 'Settings',
  '/profile': 'My Profile',
}

export function AppShell() {
  const location = useLocation()
  // Resolve title — exact match first, then prefix match
  const title = PAGE_TITLES[location.pathname]
    ?? Object.entries(PAGE_TITLES).find(([k]) => location.pathname.startsWith(k))?.[1]
    ?? 'BuildFlow AI'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
