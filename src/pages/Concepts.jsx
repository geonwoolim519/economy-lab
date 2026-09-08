import { Link } from 'react-router-dom'
import { CONCEPTS } from '../data/concepts.js'

export default function Concepts() {
  return (
    <section>
      <div className="hero">
        <h1 style={{ fontSize: 24 }}>개념</h1>
        <p className="lede">어려운 단어보다, 시장에서 일어나는 일부터 읽습니다.</p>
      </div>
      {CONCEPTS.map((item) => (
        <Link key={item.id} to={`/concepts/${item.id}`} className="concept-item">
          <h3>
            {item.emoji} {item.title}
          </h3>
          <p>{item.summary}</p>
        </Link>
      ))}
    </section>
  )
}
