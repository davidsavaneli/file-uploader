import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { Dropzone } from './Dropzone'
import { AlertCircleIcon, CloseIcon } from './icons'
import { defaultLabels, type FileUploaderLabels } from './labels'
import { describeAccept, normalizeAccept, type Accept } from './utils/accept'
import { formatBytes, toBytes } from './utils/bytes'
import { cx } from './utils/cx'
import { validateFiles, type FileRejection } from './utils/validate'

/**
 * One entry in the uploader's value. Wraps the picked `File` with a stable id so the list can be
 * reordered, removed from and tracked across renders. Later parts add upload status and previews.
 */
export interface UploaderFile {
  id: string
  file: File
}

export interface FileUploaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onDrop' | 'defaultValue'
> {
  /**
   * Allowed types in the native `<input accept>` grammar — `"image/*"`, `"image/png,.pdf"` or
   * `['image/*', '.pdf']`. Pre-filters the OS picker and rejects non-matching drops. Omit to accept anything.
   */
  accept?: Accept
  /** Accept more than one file. Defaults to `false` — a new pick then replaces the current file. */
  multiple?: boolean
  /** Maximum number of files (`multiple` only). Picks beyond it are rejected with `too-many-files`. */
  maxFiles?: number
  /** Maximum size per file — bytes, or a string like `"5MB"` / `"500KB"`. */
  maxSize?: number | string
  /** Minimum size per file — bytes or a size string. Catches empty files. */
  minSize?: number | string
  /** The field label — rendered as the dropzone's title. */
  label?: ReactNode
  /** Adds a red asterisk after the label (visual only — validate in your form). */
  required?: boolean
  /** Dims and inerts the whole control. */
  disabled?: boolean
  /** Marks the field invalid — red dropzone border, `helperText` in the error color. */
  error?: boolean
  /** Helper / validation text under the control. */
  helperText?: ReactNode
  /**
   * The constraints line inside the dropzone. Generated from `accept` / `maxSize` / `maxFiles` by
   * default (`"PNG or JPG · up to 5 MB · max 3 files"`); pass a node to replace it or `false` to hide it.
   */
  hint?: ReactNode | false
  /** Override any of the rendered texts — for translation or tone. Unspecified keys keep the defaults. */
  labels?: Partial<FileUploaderLabels>
  /** `name` of the underlying `<input type="file">`. */
  name?: string
  /** Controlled value. */
  value?: UploaderFile[]
  /** Initial value for uncontrolled use. */
  defaultValue?: UploaderFile[]
  /** Fires with the next value whenever files are added (and, in later parts, removed or reordered). */
  onChange?: (files: UploaderFile[]) => void
  /**
   * Raw result of every pick or drop, before it is merged into the value: the files that passed
   * validation and the ones that did not, each with a reason code and message.
   */
  onDrop?: (accepted: File[], rejected: FileRejection[]) => void
}

/** Stable per-file ids. `crypto.randomUUID` where available (secure contexts), a counter otherwise. */
let counter = 0
function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  counter += 1
  return `sfu-${Date.now().toString(36)}-${counter}`
}

const NOTICE_TIMEOUT = 6000

export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(function FileUploader(
  {
    accept,
    multiple = false,
    maxFiles,
    maxSize,
    minSize,
    label,
    required = false,
    disabled = false,
    error = false,
    helperText,
    hint,
    labels: labelsProp,
    name,
    value,
    defaultValue,
    onChange,
    onDrop,
    className,
    children,
    ...rest
  },
  ref,
) {
  const baseId = useId()
  const inputId = `${baseId}-input`
  const helperId = `${baseId}-helper`
  const noticeId = `${baseId}-notice`

  const labels = useMemo(() => ({ ...defaultLabels, ...labelsProp }), [labelsProp])
  const acceptRules = useMemo(() => normalizeAccept(accept), [accept])
  const maxBytes = maxSize != null ? toBytes(maxSize) : undefined
  const minBytes = minSize != null ? toBytes(minSize) : undefined

  // controlled / uncontrolled value
  const isControlled = value !== undefined
  const [innerValue, setInnerValue] = useState<UploaderFile[]>(() => defaultValue ?? [])
  const files = isControlled ? value : innerValue

  const commit = useCallback(
    (next: UploaderFile[]) => {
      if (!isControlled) setInnerValue(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  // rejection notice — the latest batch's refusals, auto-dismissed
  const [rejections, setRejections] = useState<FileRejection[]>([])
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const dismiss = useCallback(() => {
    clearTimeout(timer.current)
    setRejections([])
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])

  const remaining = multiple ? Math.max(0, (maxFiles ?? Infinity) - files.length) : 1

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const { accepted, rejected } = validateFiles(incoming, {
        accept: acceptRules,
        maxSize: maxBytes,
        minSize: minBytes,
        remaining,
        maxFiles: multiple ? maxFiles : 1,
        labels,
      })
      onDrop?.(accepted, rejected)
      if (accepted.length) {
        const added = accepted.map((file) => ({ id: createId(), file }))
        commit(multiple ? [...files, ...added] : added.slice(0, 1))
      }
      clearTimeout(timer.current)
      setRejections(rejected)
      if (rejected.length) timer.current = setTimeout(() => setRejections([]), NOTICE_TIMEOUT)
    },
    [acceptRules, commit, files, labels, maxBytes, maxFiles, minBytes, multiple, onDrop, remaining],
  )

  // auto hint — "PNG or JPG · up to 5 MB · max 3 files"
  const autoHint = useMemo(() => {
    const parts: string[] = []
    const types = describeAccept(acceptRules)
    if (types.length) parts.push(labels.hintTypes(types))
    if (maxBytes != null) parts.push(labels.hintMaxSize(formatBytes(maxBytes)))
    if (multiple && maxFiles != null) parts.push(labels.hintMaxFiles(maxFiles))
    return parts.length ? parts.join(' · ') : null
  }, [acceptRules, labels, maxBytes, maxFiles, multiple])
  const resolvedHint = hint === false ? null : (hint ?? autoHint)

  // one message per distinct text — ten oversized files should not print ten identical lines
  const messages = useMemo(() => [...new Set(rejections.map((r) => r.message))], [rejections])

  const describedBy =
    [helperText ? helperId : null, messages.length ? noticeId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div
      ref={ref}
      className={cx('sfu', disabled && 'sfu--disabled', error && 'sfu--error', className)}
      {...rest}
    >
      <Dropzone
        id={inputId}
        label={label}
        required={required}
        name={name}
        accept={acceptRules}
        multiple={multiple}
        remaining={remaining}
        disabled={disabled}
        error={error}
        labels={labels}
        hint={resolvedHint}
        describedBy={describedBy}
        onFiles={handleFiles}
      />

      {children}

      {helperText != null && (
        <p id={helperId} className={cx('sfu-helper', error && 'sfu-helper--error')}>
          {helperText}
        </p>
      )}

      <div className="sfu-live" role="status" aria-live="polite" aria-atomic="true">
        {messages.length > 0 && (
          <div id={noticeId} className="sfu-notice sfu-notice--error">
            <AlertCircleIcon className="sfu-notice__icon" width={18} height={18} />
            <ul className="sfu-notice__list">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
            <button
              type="button"
              className="sfu-notice__dismiss"
              onClick={dismiss}
              aria-label={labels.dismiss}
            >
              <CloseIcon width={16} height={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

FileUploader.displayName = 'FileUploader'
