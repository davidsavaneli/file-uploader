import type { ReactNode } from 'react'
import { acceptAttribute } from './utils/accept'
import { cx } from './utils/cx'
import { UploadCloudIcon } from './icons'
import type { FileUploaderLabels } from './labels'
import { useDropzone } from './useDropzone'

export interface DropzoneProps {
  id: string
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

  const headline =
    dragState === 'reject'
      ? labels.dropReject
      : dragState === 'active'
        ? labels.dropActive
        : multiple
          ? labels.dropTitle
          : labels.dropTitleSingle

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
        <UploadCloudIcon />
      </span>

      <div className="sfu-dropzone__body">
        <p className="sfu-dropzone__text">
          <span className="sfu-dropzone__title">{headline}</span>{' '}
          <span className="sfu-dropzone__connector">{labels.browseConnector}</span>{' '}
          <button
            type="button"
            className="sfu-dropzone__browse"
            onClick={open}
            disabled={disabled}
            aria-describedby={describedBy}
          >
            {labels.browse}
          </button>
        </p>
        {hint != null && hint !== false && <p className="sfu-dropzone__hint">{hint}</p>}
      </div>
    </div>
  )
}
