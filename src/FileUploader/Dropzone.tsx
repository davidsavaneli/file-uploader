import type { ReactNode } from 'react'
import { acceptAttribute } from './utils/accept'
import { cx } from './utils/cx'
import { UploadBlockedIcon, UploadIcon } from './icons'
import type { FileUploaderLabels } from './labels'
import { useDropzone } from './useDropzone'

export interface DropzoneProps {
  id: string
  /** The field label, rendered as the dropzone's title. */
  label?: ReactNode
  required: boolean
  name?: string
  accept: string[]
  multiple: boolean
  remaining: number
  disabled: boolean
  error: boolean
  labels: FileUploaderLabels
  /** The constraints line under the headline; `null` hides it. */
  hint: ReactNode
  describedBy?: string
  onFiles: (files: File[], source: 'drop' | 'input') => void
}

/**
 * The drop target: a dashed panel with an icon, a headline and a real browse `<button>` (so keyboard
 * users get native button semantics instead of a `role="button"` div). The whole panel is clickable;
 * the hidden `<input type="file">` is what actually opens the OS picker.
 */
export function Dropzone({
  id,
  label,
  required,
  name,
  accept,
  multiple,
  remaining,
  disabled,
  error,
  labels,
  hint,
  describedBy,
  onFiles,
}: DropzoneProps) {
  const { dragState, open, rootProps, inputProps } = useDropzone({
    disabled,
    accept,
    remaining,
    onFiles,
  })

  return (
    <div
      {...rootProps}
      className={cx(
        'sfu-dropzone',
        dragState === 'active' && 'sfu-dropzone--active',
        dragState === 'reject' && 'sfu-dropzone--reject',
        disabled && 'sfu-dropzone--disabled',
        error && 'sfu-dropzone--error',
      )}
      data-state={dragState ?? undefined}
      aria-disabled={disabled || undefined}
    >
      {/* the dashed edge — an SVG stroke (round caps, even dashes) that marches while files hover */}
      <svg className="sfu-dropzone__outline" aria-hidden="true" focusable="false">
        <rect />
      </svg>

      <input
        {...inputProps}
        id={id}
        name={name}
        type="file"
        className="sfu-sr-only"
        tabIndex={-1}
        accept={acceptAttribute(accept)}
        multiple={multiple}
        disabled={disabled}
        aria-label={labels.inputLabel}
      />

      <span className="sfu-dropzone__icon">
        {dragState === 'reject' ? <UploadBlockedIcon /> : <UploadIcon />}
      </span>

      <div className="sfu-dropzone__body">
        {label != null && (
          <span className="sfu-dropzone__title">
            {label}
            {required && (
              <span className="sfu-required" aria-hidden="true">
                *
              </span>
            )}
          </span>
        )}
        {/* the prompt stays put while dragging — the edge, grid and icon carry the drag state */}
        <p className="sfu-dropzone__text">
          <button
            type="button"
            className="sfu-dropzone__browse"
            onClick={open}
            disabled={disabled}
            aria-describedby={describedBy}
          >
            {multiple ? labels.browseMultiple : labels.browse}
          </button>{' '}
          <span className="sfu-dropzone__prompt">
            {multiple ? labels.dropTextMultiple : labels.dropText}
          </span>
        </p>
        {hint != null && hint !== false && <p className="sfu-dropzone__hint">{hint}</p>}
      </div>
    </div>
  )
}
