import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom'
import { getConcept } from '../data/concepts.js'
import { getLab } from '../data/labs.js'

export default function TopBar({ compact }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const labMatch = matchPath('/experiments/:labId', pathname)
  const conceptMatch = matchPath('/concepts/:conceptId', pathname)
  const lab = labMatch ? getLab(labMatch.params.labId) : null
  const concept = conceptMatch ? getConcept(conceptMatch.params.conceptId) : null
  const title = lab?.title || concept?.title || ''

  if (compact) {
    return (
      <header className="topbar">
        <button className="icon-btn" type="button" aria-label="뒤로" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <div className="topbar-title">{title}</div>
        <span style={{ width: 40 }} />
      </header>
    )
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <small>ECONOMY LAB</small>
        <strong>이코노미랩</strong>
      </Link>
      <Link to="/settings" className="icon-btn" aria-label="설정">
        <GearIcon />
      </Link>
    </header>
  )
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 22" fill="none" aria-hidden="true">
      <path d="M15 4 8 11l7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.25 19.1 7.4v9.2L12 20.75 4.9 16.6V7.4L12 3.25Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.05" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
