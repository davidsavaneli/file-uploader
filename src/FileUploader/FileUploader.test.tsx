import { createRef, useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUploader, type UploaderFile } from './FileUploader'

const png = (name = 'a.png', size = 10) => new File(['x'.repeat(size)], name, { type: 'image/png' })
const txt = (name = 'a.txt') => new File(['x'], name, { type: 'text/plain' })

const dropData = (files: File[]) => ({
  dataTransfer: {
    files,
    items: files.map((f) => ({ kind: 'file', type: f.type })),
    types: ['Files'],
    dropEffect: 'none',
  },
})

const zone = () => document.querySelector('.sfu-dropzone') as HTMLElement
const input = () => document.querySelector('input[type="file"]') as HTMLInputElement

describe('FileUploader — structure & a11y', () => {
  it('renders the root, forwards the ref and merges className', () => {
    const ref = createRef<HTMLDivElement>()
    render(<FileUploader ref={ref} className="custom" data-testid="root" />)
    const root = screen.getByTestId('root')
    expect(root).toHaveClass('sfu', 'custom')
    expect(ref.current).toBe(root)
  })

  it('has a real browse button, a hidden labelled input and the default texts', () => {
    render(<FileUploader multiple name="attachments" />)
    expect(screen.getByRole('button', { name: 'Choose files' })).toBeInTheDocument()
    expect(screen.getByText('or drag & drop them here')).toBeInTheDocument()
    expect(input()).toHaveAttribute('name', 'attachments')
    expect(input()).toHaveAttribute('multiple')
    expect(input()).toHaveAttribute('aria-label', 'Choose files')
    expect(input()).toHaveClass('sfu-sr-only')
  })

  it('single mode: singular prompt, no multiple attribute', () => {
    render(<FileUploader />)
    expect(screen.getByRole('button', { name: 'Choose a file' })).toBeInTheDocument()
    expect(screen.getByText('or drag & drop it here')).toBeInTheDocument()
    expect(input()).not.toHaveAttribute('multiple')
  })

  it('builds the hint from the constraints and passes accept to the input', () => {
    render(<FileUploader multiple accept="image/png,image/jpeg,.pdf" maxSize="5MB" maxFiles={3} />)
    expect(screen.getByText('PNG, JPG or PDF · up to 5 MB · max 3 files')).toBeInTheDocument()
    expect(input()).toHaveAttribute('accept', 'image/png,image/jpeg,.pdf')
  })

  it('hint can be replaced or hidden', () => {
    const { rerender } = render(<FileUploader maxSize="1MB" hint="Custom hint" />)
    expect(screen.getByText('Custom hint')).toBeInTheDocument()
    rerender(<FileUploader maxSize="1MB" hint={false} />)
    expect(document.querySelector('.sfu-dropzone__hint')).toBeNull()
  })

  it('labels override the texts', () => {
    render(<FileUploader labels={{ browse: 'აირჩიეთ ფაილი', dropText: 'ან ჩააგდეთ აქ' }} />)
    expect(screen.getByRole('button', { name: 'აირჩიეთ ფაილი' })).toBeInTheDocument()
    expect(screen.getByText('ან ჩააგდეთ აქ')).toBeInTheDocument()
  })

  it('label is the dropzone title, required adds the asterisk', () => {
    const { rerender } = render(<FileUploader label="Attachment" />)
    expect(screen.getByText('Attachment')).toHaveClass('sfu-dropzone__title')
    expect(document.querySelector('.sfu-required')).toBeNull()
    rerender(<FileUploader label="Attachment" required />)
    expect(document.querySelector('.sfu-required')).toHaveTextContent('*')
  })

  it('helperText + error wire aria-describedby and the error classes', () => {
    render(<FileUploader error helperText="Required" />)
    const helper = screen.getByText('Required')
    expect(helper).toHaveClass('sfu-helper', 'sfu-helper--error')
    expect(screen.getByRole('button', { name: 'Choose a file' })).toHaveAttribute(
      'aria-describedby',
      helper.id,
    )
    expect(zone()).toHaveClass('sfu-dropzone--error')
  })

  it('disabled inerts the control', async () => {
    const onDrop = vi.fn()
    render(<FileUploader disabled onDrop={onDrop} />)
    expect(zone()).toHaveClass('sfu-dropzone--disabled')
    expect(zone()).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: 'Choose a file' })).toBeDisabled()
    expect(input()).toBeDisabled()
    fireEvent.drop(zone(), dropData([png()]))
    expect(onDrop).not.toHaveBeenCalled()
  })
})

describe('FileUploader — picking', () => {
  it('clicking the panel or the browse button opens the picker exactly once', async () => {
    const user = userEvent.setup()
    render(<FileUploader />)
    const click = vi.spyOn(input(), 'click')
    await user.click(screen.getByText('or drag & drop it here'))
    expect(click).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Choose a file' }))
    expect(click).toHaveBeenCalledTimes(2)
  })

  it('keyboard: Enter on the focused browse button opens the picker', async () => {
    const user = userEvent.setup()
    render(<FileUploader />)
    const click = vi.spyOn(input(), 'click')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Choose a file' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('a pick through the input adds files and reports them via onChange + onDrop', () => {
    const onChange = vi.fn()
    const onDrop = vi.fn()
    render(<FileUploader multiple onChange={onChange} onDrop={onDrop} />)
    const files = [png('a.png'), png('b.png')]
    fireEvent.change(input(), { target: { files } })
    expect(onDrop).toHaveBeenCalledWith(files, [])
    const value = onChange.mock.calls[0][0] as UploaderFile[]
    expect(value.map((v) => v.file.name)).toEqual(['a.png', 'b.png'])
    expect(new Set(value.map((v) => v.id)).size).toBe(2)
    expect(input().value).toBe('')
  })

  it('single mode replaces the current file and refuses the rest of a batch', () => {
    const onChange = vi.fn()
    render(<FileUploader onChange={onChange} />)
    fireEvent.change(input(), { target: { files: [png('first.png')] } })
    fireEvent.change(input(), { target: { files: [png('second.png'), png('third.png')] } })
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0] as UploaderFile[]
    expect(last.map((v) => v.file.name)).toEqual(['second.png'])
    expect(screen.getByText('Only one file can be added')).toBeInTheDocument()
  })

  it('controlled: renders from value and never mutates it', () => {
    function Harness() {
      const [value, setValue] = useState<UploaderFile[]>([])
      return (
        <>
          <FileUploader multiple maxFiles={2} value={value} onChange={setValue} />
          <output>{value.map((v) => v.file.name).join(',')}</output>
        </>
      )
    }
    render(<Harness />)
    fireEvent.change(input(), { target: { files: [png('a.png')] } })
    fireEvent.change(input(), { target: { files: [png('b.png'), png('c.png')] } })
    expect(document.querySelector('.sfu-notice')!.textContent).toContain('Only 2 files')
    expect(document.querySelector('output')!.textContent).toBe('a.png,b.png')
  })
})

describe('FileUploader — drag & drop', () => {
  it('shows the active state while files hover, and resets on leave', () => {
    render(<FileUploader multiple />)
    fireEvent.dragEnter(zone(), dropData([png()]))
    expect(zone()).toHaveClass('sfu-dropzone--active')
    // the prompt stays as it is while dragging
    const prompt = screen.getByText('or drag & drop them here')
    expect(screen.getByRole('button', { name: 'Choose files' })).toBeInTheDocument()
    // crossing a child fires another enter + leave — the depth counter must absorb it
    fireEvent.dragEnter(prompt, dropData([png()]))
    fireEvent.dragLeave(prompt, dropData([png()]))
    expect(zone()).toHaveClass('sfu-dropzone--active')
    fireEvent.dragLeave(zone(), dropData([png()]))
    expect(zone()).not.toHaveClass('sfu-dropzone--active')
  })

  it('shows the reject state when every dragged type is disallowed or there is no room', () => {
    const { rerender } = render(<FileUploader multiple accept="image/*" />)
    fireEvent.dragEnter(zone(), dropData([txt()]))
    expect(zone()).toHaveClass('sfu-dropzone--reject')
    expect(screen.getByText('or drag & drop them here')).toBeInTheDocument()
    fireEvent.dragLeave(zone(), dropData([txt()]))

    rerender(
      <FileUploader multiple maxFiles={1} value={[{ id: '1', file: png() }]} onChange={() => {}} />,
    )
    fireEvent.dragEnter(zone(), dropData([png()]))
    expect(zone()).toHaveClass('sfu-dropzone--reject')
  })

  it('ignores non-file drags', () => {
    render(<FileUploader />)
    fireEvent.dragEnter(zone(), { dataTransfer: { types: ['text/plain'], items: [], files: [] } })
    expect(zone()).not.toHaveClass('sfu-dropzone--active')
  })

  it('a drop validates, adds the good files and lists each distinct rejection once', () => {
    vi.useFakeTimers()
    const onDrop = vi.fn()
    render(<FileUploader multiple accept="image/*" maxSize={100} onDrop={onDrop} />)
    const good = png('ok.png', 10)
    const files = [good, txt('a.txt'), png('big1.png', 200), png('big2.png', 200), txt('a.txt')]
    fireEvent.drop(zone(), dropData(files))

    expect(onDrop).toHaveBeenCalledTimes(1)
    const [accepted, rejected] = onDrop.mock.calls[0]
    expect(accepted).toEqual([good])
    expect(rejected).toHaveLength(4)

    const notice = document.querySelector('.sfu-notice')!
    const lines = Array.from(notice.querySelectorAll('li')).map((li) => li.textContent)
    expect(lines).toEqual([
      'a.txt — not an allowed type (Images)',
      'big1.png — larger than 100 B',
      'big2.png — larger than 100 B',
    ])
    expect(zone()).not.toHaveClass('sfu-dropzone--active')

    act(() => {
      vi.advanceTimersByTime(6000)
    })
    expect(document.querySelector('.sfu-notice')).toBeNull()
    vi.useRealTimers()
  })

  it('the notice can be dismissed', async () => {
    const user = userEvent.setup()
    render(<FileUploader accept="image/*" />)
    fireEvent.drop(zone(), dropData([txt()]))
    expect(document.querySelector('.sfu-notice')).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(document.querySelector('.sfu-notice')).toBeNull()
  })
})
