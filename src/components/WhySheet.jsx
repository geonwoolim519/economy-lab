export default function WhySheet({ open, onClose, why }) {
  if (!open || !why) return null

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <aside className="sheet" role="dialog" aria-label="왜 이렇게 됐나요">
        <div className="handle" />
        <h3>{why.headline}</h3>
        <div className="chain">
          {why.chain.map((item, index) => (
            <div key={item}>
              <div className="chain-item" style={{ animationDelay: `${index * 70}ms` }}>
                {item}
              </div>
              {index < why.chain.length - 1 && <div className="chain-arrow">↓</div>}
            </div>
          ))}
        </div>
        {why.termNote && <p className="term-note">{why.termNote}</p>}
        {why.principle && (
          <div className="principle-box">
            <div className="tiny" style={{ marginBottom: 4, color: 'inherit' }}>
              핵심 원리
            </div>
            {why.principle}
          </div>
        )}
        <button className="btn btn-primary" type="button" style={{ marginTop: 18 }} onClick={onClose}>
          이해했어요
        </button>
      </aside>
    </>
  )
}
