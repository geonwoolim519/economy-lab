import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLab } from '../data/labs.js'
import { loadProgress, removePrinciple } from '../storage/progress.js'

export default function Record() {
  const [tick, setTick] = useState(0)
  const progress = useMemo(() => loadProgress(), [tick])
  const recent = progress.completedLabs
    .slice()
    .reverse()
    .map((id) => getLab(id))
    .filter(Boolean)

  return (
    <section>
      <div className="hero">
        <h1 style={{ fontSize: 24 }}>기록</h1>
        <p className="lede">직접 움직여 보고 저장한 원리가 여기에 쌓입니다.</p>
      </div>

      <div className="section-head">
        <h2>최근 실험</h2>
      </div>
      {recent.length === 0 && <div className="empty">아직 완료한 실험이 없어요. 첫 실험을 시작해 보세요.</div>}
      {recent.map((lab) => (
        <Link key={lab.id} to={`/experiments/${lab.id}`} className="record-item">
          <h3>
            {lab.emoji} {lab.title}
          </h3>
          <p>{lab.blurb}</p>
        </Link>
      ))}

      <div className="section-head">
        <h2>저장한 원리</h2>
      </div>
      {progress.savedPrinciples.length === 0 && (
        <div className="empty">실험이 끝나면 “이 원리 저장하기”를 눌러 보세요.</div>
      )}
      {progress.savedPrinciples.map((item) => (
        <article key={item.id} className="record-item">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <button
            className="btn btn-ghost"
            type="button"
            style={{ minHeight: 40, marginTop: 8 }}
            onClick={() => {
              removePrinciple(item.id)
              setTick((n) => n + 1)
            }}
          >
            삭제
          </button>
        </article>
      ))}
    </section>
  )
}
