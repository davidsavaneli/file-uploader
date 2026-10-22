import { describeAccept, matchesAccept, mayAcceptType, normalizeAccept } from './accept'
import { formatBytes, toBytes } from './bytes'
import { defaultLabels } from '../labels'
import { validateFiles } from './validate'

const file = (name: string, type: string, size = 10) => {
  const f = new File(['x'.repeat(size)], name, { type })
  return f
}

describe('bytes', () => {
  it('parses size strings in binary units', () => {
    expect(toBytes(1234)).toBe(1234)
    expect(toBytes('1024')).toBe(1024)
    expect(toBytes('5MB')).toBe(5 * 1024 ** 2)
    expect(toBytes('500 kb')).toBe(500 * 1024)
    expect(toBytes('1.5GB')).toBe(Math.round(1.5 * 1024 ** 3))
    expect(toBytes('2 M')).toBe(2 * 1024 ** 2)
    expect(() => toBytes('big')).toThrow(/cannot parse size/)
  })

  it('formats bytes for humans', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5 * 1024 ** 2)).toBe('5 MB')
    expect(formatBytes(700 * 1024 ** 2)).toBe('700 MB')
    expect(formatBytes(-1)).toBe('0 B')
  })
})

describe('accept', () => {
  it('normalizes strings and arrays', () => {
    expect(normalizeAccept(undefined)).toEqual([])
    expect(normalizeAccept(' image/*, .PDF ,')).toEqual(['image/*', '.pdf'])
    expect(normalizeAccept(['Image/PNG'])).toEqual(['image/png'])
  })

  it('matches by MIME, wildcard and extension', () => {
    const rules = normalizeAccept('image/*,.pdf,application/json')
    expect(matchesAccept(file('a.png', 'image/png'), rules)).toBe(true)
    expect(matchesAccept(file('a.PDF', ''), rules)).toBe(true)
    expect(matchesAccept(file('a.json', 'application/json'), rules)).toBe(true)
    expect(matchesAccept(file('a.txt', 'text/plain'), rules)).toBe(false)
    expect(matchesAccept(file('a.txt', 'text/plain'), [])).toBe(true)
  })

  it('stays optimistic about a drag it cannot judge', () => {
    expect(mayAcceptType('text/plain', ['image/*'])).toBe(false)
    expect(mayAcceptType('image/png', ['image/*'])).toBe(true)
    expect(mayAcceptType('', ['image/*'])).toBe(true)
    expect(mayAcceptType('application/pdf', ['image/*', '.pdf'])).toBe(true)
  })

  it('describes rules for the hint', () => {
    expect(describeAccept(normalizeAccept('image/*,.pdf,image/png,image/jpeg,.png'))).toEqual([
      'Images',
      'PDF',
      'PNG',
      'JPG',
    ])
    expect(describeAccept(['application/x-rar', 'application/vnd.rar'])).toEqual(['RAR'])
  })
})

describe('validateFiles', () => {
  const base = { accept: [], remaining: Infinity, labels: defaultLabels }

  it('rejects by type, then size, then count — keeping the valid ones', () => {
    const files = [
      file('ok.png', 'image/png', 10),
      file('bad.txt', 'text/plain', 10),
      file('huge.png', 'image/png', 2000),
      file('tiny.png', 'image/png', 1),
      file('extra.png', 'image/png', 10),
    ]
    const { accepted, rejected } = validateFiles(files, {
      ...base,
      accept: ['image/*'],
      maxSize: 1000,
      minSize: 2,
      remaining: 1,
      maxFiles: 3,
    })
    expect(accepted.map((f) => f.name)).toEqual(['ok.png'])
    expect(rejected.map((r) => r.code)).toEqual([
      'file-invalid-type',
      'file-too-large',
      'file-too-small',
      'too-many-files',
    ])
    expect(rejected[0].message).toContain('bad.txt')
    expect(rejected[0].message).toContain('Images')
    expect(rejected[1].message).toContain('1000 B')
    expect(rejected[3].message).toBe('Only 3 files can be added')
  })

  it('accepts everything with no constraints', () => {
    const { accepted, rejected } = validateFiles([file('a', ''), file('b', '')], base)
    expect(accepted).toHaveLength(2)
    expect(rejected).toHaveLength(0)
  })
})
