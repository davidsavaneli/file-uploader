import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { FileUploader, cx } from './FileUploader'

describe('FileUploader', () => {
  it('renders the themed root, merges className and forwards the ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<FileUploader ref={ref} className="custom" data-testid="root" />)

    const root = screen.getByTestId('root')
    expect(root).toHaveClass('sfu', 'custom')
    expect(ref.current).toBe(root)
  })
})

describe('cx', () => {
  it('joins truthy class names only', () => {
    expect(cx('a', false, null, undefined, 'b')).toBe('a b')
    expect(cx()).toBe('')
  })
})
