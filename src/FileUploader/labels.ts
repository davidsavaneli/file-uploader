/**
 * Every piece of text the uploader renders, so an app can translate or reword it via the `labels`
 * prop (a partial object — unspecified keys keep these English defaults).
 */
export interface FileUploaderLabels {
  /** The browse button text, single-file mode — "**Choose a file** or drag & drop it here". */
  browse: string
  /** The browse button text, `multiple` mode. */
  browseMultiple: string
  /** The rest of the prompt after the browse button, single-file mode. */
  dropText: string
  /** The rest of the prompt after the browse button, `multiple` mode. */
  dropTextMultiple: string
  /** Accessible name of the hidden file input. */
  inputLabel: string
  /** Accessible name of the notice's dismiss button. */
  dismiss: string
  /** Hint fragment listing the allowed types, e.g. `"PNG, JPG or PDF"`. */
  hintTypes: (types: string[]) => string
  /** Hint fragment for the size limit, e.g. `"up to 5 MB"`. */
  hintMaxSize: (size: string) => string
  /** Hint fragment for the file count limit, e.g. `"max 3 files"`. */
  hintMaxFiles: (count: number) => string
  errorInvalidType: (file: File, types: string[]) => string
  errorTooLarge: (file: File, maxSize: string) => string
  errorTooSmall: (file: File, minSize: string) => string
  errorTooMany: (file: File, maxFiles: number) => string
}

/** Join `["A", "B", "C"]` as `"A, B or C"`. */
function listOr(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`
}

export const defaultLabels: FileUploaderLabels = {
  browse: 'Choose a file',
  browseMultiple: 'Choose files',
  dropText: 'or drag & drop it here',
  dropTextMultiple: 'or drag & drop them here',
  inputLabel: 'Choose files',
  dismiss: 'Dismiss',
  hintTypes: listOr,
  hintMaxSize: (size) => `up to ${size}`,
  hintMaxFiles: (count) => (count === 1 ? '1 file' : `max ${count} files`),
  errorInvalidType: (file, types) =>
    `${file.name} — not an allowed type${types.length ? ` (${listOr(types)})` : ''}`,
  errorTooLarge: (file, maxSize) => `${file.name} — larger than ${maxSize}`,
  errorTooSmall: (file, minSize) => `${file.name} — smaller than ${minSize}`,
  errorTooMany: (_file, maxFiles) =>
    maxFiles === 1 ? 'Only one file can be added' : `Only ${maxFiles} files can be added`,
}
