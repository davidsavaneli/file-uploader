const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const
const PREFIXES = ['', 'K', 'M', 'G', 'T']

/**
 * Parse a size limit: a bytes `number` passes through, a string like `"5MB"`, `"500 kb"` or `"1.5GB"`
 * is converted (binary units — 1 KB = 1024 B). Throws on an unparsable string so a typo in a prop
 * surfaces in development instead of silently accepting every file.
 */
export function toBytes(value: number | string): number {
  if (typeof value === 'number') return value
  const match = /^\s*(\d+(?:\.\d+)?)\s*([kmgt]?)b?\s*$/i.exec(value)
  if (!match) throw new Error(`sava-file-uploader: cannot parse size "${value}"`)
  const amount = parseFloat(match[1])
  const exponent = PREFIXES.indexOf(match[2].toUpperCase())
  return Math.round(amount * 1024 ** exponent)
}

/** Human-readable size — `1536` → `"1.5 KB"`, `5242880` → `"5 MB"`, `734003200` → `"700 MB"`. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${Math.round(bytes)} B`
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1)
  const value = bytes / 1024 ** index
  const rounded = Number(value.toFixed(decimals))
  return `${Number.isInteger(rounded) || rounded >= 100 ? Math.round(rounded) : rounded} ${UNITS[index]}`
}
