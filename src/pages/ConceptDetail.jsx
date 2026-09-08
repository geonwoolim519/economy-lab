import { Link, useParams } from 'react-router-dom'
import { getConcept } from '../data/concepts.js'

export default function ConceptDetail() {
  const { conceptId } = useParams()
  const concept = getConcept(conceptId)

  if (!concept) {
    return (
      <section>
        <h1 className="question">개념을 찾지 못했어요</h1>
        <Link to="/concepts" className="btn btn-secondary">
          개념 목록으로
        </Link>
      </section>
    )
  }

  return (
    <section>
      <p className="eyebrow">쉽게 읽기</p>
      <h1 className="question">
        {concept.emoji} {concept.title}
      </h1>
      <p className="lede">{concept.summary}</p>
      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <p className="prose">{concept.body}</p>
      </div>
      <Link to={`/experiments/${concept.labId}`} className="btn btn-primary" style={{ marginTop: 16 }}>
        직접 실험해보기
      </Link>
    </section>
  )
}
