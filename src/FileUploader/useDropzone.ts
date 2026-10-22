import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
} from 'react'
import { mayAcceptType } from './utils/accept'

/** `'active'` — files hover over the zone; `'reject'` — and they certainly can't be added. */
export type DragState = 'active' | 'reject' | null

export interface UseDropzoneOptions {
  disabled?: boolean
  /** Normalized accept rules, for the live "reject" verdict while dragging. */
  accept: string[]
  /** How many more files fit — `0` turns every drag into a reject. */
  remaining: number
  /** Receives the raw files of a pick or a drop (validation happens in the caller). */
  onFiles: (files: File[], source: 'drop' | 'input') => void
}

function isFileDrag(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

/**
 * Click-to-browse + OS drag & drop on an element, with no library. A depth counter pairs `dragenter`
 * and `dragleave`, which fire for every child the pointer crosses — without it the zone would flicker.
 */
export function useDropzone({ disabled, accept, remaining, onFiles }: UseDropzoneOptions) {
  const inputRef = useRef<HTMLInputElement>(null)
  const depth = useRef(0)
  const [dragState, setDragState] = useState<DragState>(null)

  const open = useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const onDragEnter = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (disabled || !isFileDrag(event)) return
      event.preventDefault()
      depth.current += 1
      if (depth.current > 1) return
      const items = Array.from(event.dataTransfer.items ?? []).filter((i) => i.kind === 'file')
      const certainlyWrong =
        remaining <= 0 || (items.length > 0 && items.every((i) => !mayAcceptType(i.type, accept)))
      setDragState(certainlyWrong ? 'reject' : 'active')
    },
    [accept, disabled, remaining],
  )

  const onDragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!isFileDrag(event)) return
      // preventDefault is what makes the element a drop target at all
      event.preventDefault()
      event.dataTransfer.dropEffect = disabled || dragState === 'reject' ? 'none' : 'copy'
    },
    [disabled, dragState],
  )

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isFileDrag(event)) return
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) setDragState(null)
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!isFileDrag(event)) return
      event.preventDefault()
      depth.current = 0
      setDragState(null)
      if (disabled) return
      const files = Array.from(event.dataTransfer.files ?? [])
      if (files.length) onFiles(files, 'drop')
    },
    [disabled, onFiles],
  )

  const onClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      // a real control inside the zone (the browse button) opens the picker itself
      if ((event.target as Element).closest('button, a, input, [data-sfu-no-open]')) return
      open()
    },
    [open],
  )

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? [])
      // reset so picking the same file again still fires `change`
      event.target.value = ''
      if (files.length) onFiles(files, 'input')
    },
    [onFiles],
  )

  return {
    inputRef,
    dragState,
    open,
    rootProps: { onDragEnter, onDragOver, onDragLeave, onDrop, onClick },
    inputProps: { ref: inputRef, onChange: onInputChange },
  }
}
