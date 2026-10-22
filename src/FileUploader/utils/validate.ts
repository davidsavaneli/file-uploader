import type { FileUploaderLabels } from '../labels'
import { formatBytes } from './bytes'
import { describeAccept, matchesAccept } from './accept'

export type FileRejectionCode =
  'file-invalid-type' | 'file-too-large' | 'file-too-small' | 'too-many-files'

/** A picked or dropped file the uploader refused, with a machine code and the rendered message. */
export interface FileRejection {
  file: File
  code: FileRejectionCode
  message: string
}

export interface ValidateOptions {
  /** Normalized accept rules (see `normalizeAccept`). */
  accept: string[]
  /** Size limits in bytes. */
  maxSize?: number
  minSize?: number
  /** How many more files fit — `Infinity` when there is no `maxFiles`. Single mode caps it at 1. */
  remaining: number
  /** The `maxFiles` value, only used for the message. */
  maxFiles?: number
  labels: FileUploaderLabels
}

/**
 * Split a batch of files into the ones to add and the ones to refuse. Type and size are checked per
 * file first; the count limit is then applied to the survivors in order, so a batch that is too big
 * still adds as many valid files as there is room for.
 */
export function validateFiles(
  files: File[],
  options: ValidateOptions,
): { accepted: File[]; rejected: FileRejection[] } {
  const { accept, maxSize, minSize, remaining, maxFiles, labels } = options
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  const typeLabels = describeAccept(accept)

  for (const file of files) {
    if (!matchesAccept(file, accept)) {
      rejected.push({
        file,
        code: 'file-invalid-type',
        message: labels.errorInvalidType(file, typeLabels),
      })
    } else if (maxSize != null && file.size > maxSize) {
      rejected.push({
        file,
        code: 'file-too-large',
        message: labels.errorTooLarge(file, formatBytes(maxSize)),
      })
    } else if (minSize != null && file.size < minSize) {
      rejected.push({
        file,
        code: 'file-too-small',
        message: labels.errorTooSmall(file, formatBytes(minSize)),
      })
    } else if (accepted.length >= remaining) {
      rejected.push({
        file,
        code: 'too-many-files',
        message: labels.errorTooMany(file, maxFiles ?? 1),
      })
    } else {
      accepted.push(file)
    }
  }

  return { accepted, rejected }
}
