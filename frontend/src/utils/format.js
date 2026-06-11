export function formatCurrency(value, currency = 'EUR') {
  if (value == null || isNaN(value)) return '—'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value) {
  if (value == null || isNaN(value)) return '—'
  return `${Math.round(value)}%`
}

export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function truncate(str, maxLen = 60) {
  if (!str) return ''
  return str.length <= maxLen ? str : `${str.slice(0, maxLen)}...`
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural
}
