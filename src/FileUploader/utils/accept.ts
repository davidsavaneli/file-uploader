/**
 * Accepted file types, in the native `<input accept>` grammar: MIME types (`"image/png"`), MIME
 * wildcards (`"image/*"`) and extensions (`".pdf"`), as one comma-separated string or an array.
 */
export type Accept = string | string[]

/** Normalize `accept` into a lower-cased, trimmed rule list (`[]` = everything is allowed). */
export function normalizeAccept(accept?: Accept): string[] {
  if (!accept) return []
  const rules = Array.isArray(accept) ? accept : accept.split(',')
  return rules.map((rule) => rule.trim().toLowerCase()).filter(Boolean)
}

/** The value for the hidden `<input accept>` so the OS picker pre-filters the same way we validate. */
export function acceptAttribute(rules: string[]): string | undefined {
  return rules.length ? rules.join(',') : undefined
}

/** Does a picked/dropped file satisfy the accept rules? Extensions match by name, MIME rules by type. */
export function matchesAccept(file: { name: string; type: string }, rules: string[]): boolean {
  if (!rules.length) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule)
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

/**
 * Best-effort check while a drag is still hovering — the browser exposes only the MIME type then,
 * never the name. Unknown is treated as acceptable, so the "reject" styling only shows when every
 * dragged item is *certainly* not allowed (a wrong verdict here would be worse than none).
 */
export function mayAcceptType(type: string, rules: string[]): boolean {
  if (!rules.length || !type) return true
  // an extension rule can match a file whose type we cannot see yet — stay optimistic
  if (rules.some((rule) => rule.startsWith('.'))) return true
  return matchesAccept({ name: '', type }, rules)
}

const KNOWN_TYPES: Record<string, string> = {
  'image/*': 'Images',
  'video/*': 'Videos',
  'audio/*': 'Audio',
  'text/*': 'Text',
  'image/jpeg': 'JPG',
  'image/svg+xml': 'SVG',
  'text/plain': 'TXT',
  'application/pdf': 'PDF',
  'application/zip': 'ZIP',
  'application/json': 'JSON',
  'application/msword': 'DOC',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
}

/**
 * Short labels for the hint line — `['image/*', '.pdf', 'image/png']` → `['Images', 'PDF', 'PNG']`
 * (de-duplicated, in rule order). Unknown MIME types fall back to their upper-cased subtype.
 */
export function describeAccept(rules: string[]): string[] {
  const labels: string[] = []
  for (const rule of rules) {
    const label = rule.startsWith('.')
      ? rule.slice(1).toUpperCase()
      : (KNOWN_TYPES[rule] ??
        rule
          .split('/')[1]
          ?.replace(/^(x-|vnd\.)/, '')
          .toUpperCase() ??
        rule)
    if (label && !labels.includes(label)) labels.push(label)
  }
  return labels
}
