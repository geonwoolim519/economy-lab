const KEY = 'economy-lab-v1'

const EMPTY = {
  completedLabs: [],
  savedPrinciples: [],
  lastLabId: null,
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadProgress() {
  if (!canUseStorage()) return { ...EMPTY, completedLabs: [], savedPrinciples: [] }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY, completedLabs: [], savedPrinciples: [] }
    const parsed = JSON.parse(raw)
    return {
      completedLabs: Array.isArray(parsed.completedLabs) ? parsed.completedLabs : [],
      savedPrinciples: Array.isArray(parsed.savedPrinciples) ? parsed.savedPrinciples : [],
      lastLabId: parsed.lastLabId ?? null,
    }
  } catch {
    return { ...EMPTY, completedLabs: [], savedPrinciples: [] }
  }
}

function writeProgress(next) {
  if (!canUseStorage()) return next
  window.localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function markLabComplete(labId) {
  const current = loadProgress()
  const completedLabs = [...current.completedLabs.filter((id) => id !== labId), labId]
  return writeProgress({ ...current, completedLabs, lastLabId: labId })
}

export function savePrinciple(principle) {
  const current = loadProgress()
  const item = {
    id: `${principle.labId}-${Date.now()}`,
    labId: principle.labId,
    title: principle.title,
    text: principle.text,
    savedAt: new Date().toISOString(),
  }
  return writeProgress({
    ...current,
    lastLabId: principle.labId,
    savedPrinciples: [item, ...current.savedPrinciples].slice(0, 40),
  })
}

export function removePrinciple(id) {
  const current = loadProgress()
  return writeProgress({
    ...current,
    savedPrinciples: current.savedPrinciples.filter((item) => item.id !== id),
  })
}

export function resetProgress() {
  if (!canUseStorage()) return { ...EMPTY, completedLabs: [], savedPrinciples: [] }
  window.localStorage.removeItem(KEY)
  return { ...EMPTY, completedLabs: [], savedPrinciples: [] }
}
