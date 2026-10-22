import { forwardRef, type HTMLAttributes } from 'react'

export interface FileUploaderProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Root of the uploader. Part 1 renders only the themed shell (`.sfu`) so the build, the types and the
 * playground are wired end to end — the dropzone, file list and upload engine arrive in the next parts.
 */
export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(function FileUploader(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('sfu', className)} {...rest}>
      {children}
    </div>
  )
})

FileUploader.displayName = 'FileUploader'

/** Join truthy class names — the library's zero-dependency stand-in for `clsx`. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
