import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BarsPanel,
  ComparePanel,
  CyclePanel,
  ElasticityPanel,
  HeroPanel,
  MarketPanel,
  PeoplePanel,
  TradePanel,
} from '../components/LabVisuals.jsx'
import SliderControl from '../components/SliderControl.jsx'
import WhySheet from '../components/WhySheet.jsx'
import { DEFAULT_STATE, LEVEL_META, getLab } from '../data/labs.js'
import { markLabComplete, savePrinciple } from '../storage/progress.js'

export default function ExperimentPlay() {
  const { labId } = useParams()
  const navigate = useNavigate()
  const lab = getLab(labId)
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [whyOpen, setWhyOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [state, setState] = useState({ ...DEFAULT_STATE, ...(lab?.steps?.[0]?.seed || {}) })

  useEffect(() => {
    setStepIndex(0)
    setDone(false)
    setWhyOpen(false)
    setSaved(false)
    setState({ ...DEFAULT_STATE, ...(lab?.steps?.[0]?.seed || {}) })
  }, [labId])

  const step = lab?.steps?.[stepIndex]
  const view = useMemo(() => (step ? step.evaluate(state) : null), [lab, step, state])
  const levelMeta = LEVEL_META.find((item) => item.level === lab?.level)

  if (!lab) {
    return (
      <section>
        <h1 className="question">이 실험을 찾지 못했어요</h1>
        <Link to="/experiments" className="btn btn-secondary">
          실험 목록으로
        </Link>
      </section>
    )
  }

  if (!lab.available) {
    return (
      <section>
        <p className="eyebrow">{`LEVEL 0${lab.level}`}</p>
        <h1 className="question">{lab.title}</h1>
        <p className="lede">{lab.blurb}</p>
        <div className="notice" style={{ margin: '18px 0' }}>
          이 실험은 곧 열려요. 지금은 기초 실험부터 조작해 보면 연결이 훨씬 잘 보입니다.
        </div>
        <button className="btn btn-primary" type="button" onClick={() => navigate('/experiments/demand-supply')}>
          수요와 공급부터 시작하기
        </button>
      </section>
    )
  }

  if (done) {
    return (
      <Summary
        lab={lab}
        saved={saved}
        onSave={() => {
          lab.principles.forEach((text) => {
            savePrinciple({ labId: lab.id, title: lab.title, text })
          })
          markLabComplete(lab.id)
          setSaved(true)
        }}
        onReplay={() => {
          setDone(false)
          setStepIndex(0)
          setState({ ...DEFAULT_STATE, ...(lab.steps[0].seed || {}) })
        }}
      />
    )
  }

  const last = stepIndex === lab.steps.length - 1

  return (
    <section>
      <div className="step-dots" aria-label={`단계 ${stepIndex + 1} / ${lab.steps.length}`}>
        {lab.steps.map((item, index) => (
          <div key={item.id} className={`step-dot ${index <= stepIndex ? 'on' : ''}`} />
        ))}
      </div>
      {lab.level >= 3 && levelMeta && (
        <p className="eyebrow">
          {levelMeta.code} {levelMeta.title}
        </p>
      )}
      <h1 className="question">{step.question}</h1>
      <p className="hint">{step.hint}</p>

      {view.kind === 'market' && <MarketPanel view={view} />}
      {view.kind === 'bars' && <BarsPanel view={view} />}
      {view.kind === 'elasticity' && <ElasticityPanel view={view} />}
      {view.kind === 'hero' && <HeroPanel view={view} />}
      {view.kind === 'people' && <PeoplePanel view={view} />}
      {view.kind === 'cycle' && <CyclePanel view={view} />}
      {view.kind === 'trade' && <TradePanel view={view} />}
      {view.kind === 'compare' && <ComparePanel view={view} />}

      {step.controls.map((control) => (
        <SliderControl
          key={control.key}
          control={control}
          value={state[control.key]}
          compact={step.controls.length > 3}
          onChange={(value) => setState((prev) => ({ ...prev, [control.key]: value }))}
        />
      ))}

      <div className="result-list">
        {view.stats.map((item) => (
          <div key={item.text} className={`pill ${item.tone}`}>
            {item.text}
          </div>
        ))}
      </div>

      {view.footnote && <p className="footnote">{view.footnote}</p>}

      <div className="lab-actions">
        <button className="btn btn-secondary" type="button" onClick={() => setWhyOpen(true)}>
          🤔 왜 이렇게 됐나요?
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            if (last) {
              markLabComplete(lab.id)
              setDone(true)
              return
            }
            const next = lab.steps[stepIndex + 1]
            setStepIndex((i) => i + 1)
            setState((prev) => ({ ...prev, ...(next.seed || {}) }))
          }}
        >
          {last ? '오늘 발견한 원리 보기' : '다음 질문'}
        </button>
      </div>

      <WhySheet open={whyOpen} onClose={() => setWhyOpen(false)} why={view.why} />
    </section>
  )
}

function Summary({ lab, saved, onSave, onReplay }) {
  const next = lab.nextLabId ? getLab(lab.nextLabId) : null

  return (
    <section>
      <p className="eyebrow">실험 완료</p>
      <h1 className="question">오늘 발견한 경제 원리</h1>
      <div className="card summary-card">
        <h2>🧠 {lab.title}</h2>
        <ol className="principle-list">
          {lab.principles.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>
        <button className="btn btn-primary" type="button" onClick={onSave} disabled={saved}>
          {saved ? '저장했어요' : '이 원리 저장하기'}
        </button>
        {next?.available && (
          <Link to={`/experiments/${next.id}`} className="btn btn-primary">
            이어서 {next.title} 실험하기
          </Link>
        )}
        <button className="btn btn-ghost" type="button" onClick={onReplay}>
          다시 실험하기
        </button>
        <Link to="/experiments" className="btn btn-ghost">
          다른 실험 보기
        </Link>
      </div>
    </section>
  )
}
