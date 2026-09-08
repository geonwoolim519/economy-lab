import { Link } from 'react-router-dom'
import { HOME_QUESTIONS, TODAY_LAB_ID } from '../data/labs.js'

export default function Home() {

  return (
    <section>
      <div className="hero">
        <div className="eyebrow">ECONOMY LAB</div>
        <h1>
          경제를 외우지 말고,
          <br />
          직접 움직여보세요.
        </h1>
        <p className="lede">경제학의 원인과 결과를 직접 실험하고 이해하는 공간</p>
      </div>

      <Link to="/experiments/demand-supply" className="btn btn-primary" style={{ marginTop: 20 }}>
        실험 시작하기
      </Link>

      <div className="section-head">
        <h2>무엇이 궁금한가요?</h2>
      </div>
      <div className="question-grid">
        {HOME_QUESTIONS.map((item) => (
          <Link key={item.to} to={item.to} className="q-card">
            <span className="emoji">{item.emoji}</span>
            <b>{item.title}</b>
          </Link>
        ))}
      </div>

      <div className="section-head">
        <h2>오늘의 실험</h2>
      </div>
      <div className="today-card">
        <div className="kicker">TODAY</div>
        <p>금리가 오르면 어떤 일이 일어날까?</p>
        <Link to={`/experiments/${TODAY_LAB_ID}`} className="btn btn-secondary">
          실험하기
        </Link>
      </div>
    </section>
  )
}
