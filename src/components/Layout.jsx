import { matchPath, Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'
import TopBar from './TopBar.jsx'

export default function Layout() {
  const { pathname } = useLocation()
  const isLab = Boolean(matchPath('/experiments/:labId', pathname))
  const isConcept = Boolean(matchPath('/concepts/:conceptId', pathname))

  return (
    <div className="device">
      <div className="app">
        <TopBar compact={isLab || isConcept} />
        <main className={`main ${isLab ? 'main--lab' : ''}`}>
          <Outlet />
        </main>
        {!isLab && <BottomNav />}
      </div>
    </div>
  )
}
