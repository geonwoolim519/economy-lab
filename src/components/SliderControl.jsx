export default function SliderControl({ control, value, onChange, compact = false }) {
  return (
    <div className={`slider-block ${compact ? 'compact' : ''}`}>
      <div className="slider-head">
        <span>{control.label}</span>
        <strong>{control.format(value)}</strong>
      </div>
      <input
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        aria-label={control.label}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
