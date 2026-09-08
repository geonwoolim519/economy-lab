import { useNavigate } from 'react-router-dom'
import { LEVEL_META, LABS } from '../data/labs.js'
import { loadProgress } from '../storage/progress.js'

export default function Experiments() {
  const navigate = useNavigate()
  const progress = loadProgress()

  return (
    <section>
      <div className="hero">
        <h1 style={{ fontSize: 24 }}>실험실</h1>
        <p className="lede">한 번에 하나의 질문만 만져 보세요. 기초부터 차근히 열립니다.</p>
      </div>

      {LEVEL_META.map((level) => (
        <div key={level.level} className="level-block">
          <div className="level-label">
            <div className="code">{level.code}</div>
            <strong>{level.title}</strong>
            <span>{level.subtitle}</span>
          </div>
          {LABS.filter((lab) => lab.level === level.level).map((lab) => {
            const done = progress.completedLabs.includes(lab.id)
            return (
              <button
                key={lab.id}
                type="button"
                className={`lab-row ${lab.available ? '' : 'locked'}`}
                onClick={() => navigate(`/experiments/${lab.id}`)}
              >
                <span className="emoji">{lab.emoji}</span>
                <span className="copy">
                  <h3>{lab.title}</h3>
                  <p>{lab.blurb}</p>
                </span>
                {lab.available ? done && <span className="badge">완료</span> : <span className="lock-chip">곧 만나요</span>}
              </button>
            )
          })}
        </div>
      ))}
    </section>
  )
}
