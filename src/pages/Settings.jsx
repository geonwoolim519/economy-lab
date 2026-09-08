import { useState } from 'react'
import { resetProgress } from '../storage/progress.js'

export default function Settings() {
  const [cleared, setCleared] = useState(false)

  return (
    <section>
      <div className="hero">
        <h1 style={{ fontSize: 24 }}>설정</h1>
        <p className="lede">이코노미랩은 회원가입 없이 이 기기에서 학습 기록을 보관합니다.</p>
      </div>
      <div className="card settings-card">
        <button
          className="settings-row"
          type="button"
          onClick={() => {
            resetProgress()
            setCleared(true)
          }}
        >
          <span>학습 기록 초기화</span>
          <span className="muted">{cleared ? '완료' : '삭제'}</span>
        </button>
      </div>
      <p className="tiny" style={{ marginTop: 18, padding: '0 8px' }}>
        용어를 먼저 외우지 않아도 됩니다. 슬라이더를 움직이고, 그래프가 바뀌는 이유를 따라가면 됩니다.
      </p>
    </section>
  )
}
