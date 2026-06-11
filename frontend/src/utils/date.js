export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelative(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  const now = new Date()
  const diffMs = date - now
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Scaduta da ${Math.abs(diffDays)} giorni`
  if (diffDays === 0) return 'Scade oggi'
  if (diffDays === 1) return 'Scade domani'
  if (diffDays <= 7) return `Tra ${diffDays} giorni`
  return formatDate(dateStr)
}

export function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  const target = new Date(dateStr)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}
