import { useEffect, useState } from 'react'
import { FileUploader, formatBytes, type FileRejection, type UploaderFile } from '../src'
import type { FileUploaderProps } from '../src'

type Theme = 'light' | 'dark'

/** Local demo shell: a centered column with a theme switch. Each part adds its demo sections here. */
export function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.sfuTheme = theme
  }, [theme])

  return (
    <main className="pg">
      <header className="pg-header">
        <div>
          <h1 className="pg-title">sava-file-uploader</h1>
          <p className="pg-subtitle">Playground — part 2: dropzone, picking, validation</p>
        </div>
        <button
          type="button"
          className="pg-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <Demo title="Multiple" description="Any type, no limits. Drop several files at once.">
        <FileUploader multiple />
      </Demo>

      <Demo
        title="Images up to 2 MB, max 3"
        description="The hint is generated from accept / maxSize / maxFiles. Drag a text file to see the reject state; drop an oversized image to see the notice."
      >
        <FileUploader multiple accept="image/*" maxSize="2MB" maxFiles={3} />
      </Demo>

      <Demo title="Single file" description="A new pick replaces the current one.">
        <FileUploader accept=".pdf,.docx" />
      </Demo>

      <Demo
        title="Custom hint, helper text"
        description="`hint` replaces the generated line; `helperText` sits under the control."
      >
        <FileUploader
          multiple
          accept="image/*"
          hint="Square images look best"
          helperText="Shown in your public profile"
        />
      </Demo>

      <Demo
        title="Error state"
        description="`error` + `helperText` — a validation message from your form."
      >
        <FileUploader multiple error helperText="Add at least one file" />
      </Demo>

      <Demo title="Disabled">
        <FileUploader multiple disabled />
      </Demo>

      <Demo title="Translated labels (ka-GE)" description="Every text comes from `labels`.">
        <FileUploader
          multiple
          accept="image/*"
          maxSize="5MB"
          labels={{
            dropTitle: 'ჩააგდეთ ფაილები აქ',
            browseConnector: 'ან',
            browse: 'აირჩიეთ',
            dropActive: 'გაუშვით დასამატებლად',
            dropReject: 'ეს ფაილები ვერ დაემატება',
            inputLabel: 'ფაილების არჩევა',
            dismiss: 'დახურვა',
            hintTypes: (types) => types.join(', '),
            hintMaxSize: (size) => `მაქს. ${size}`,
            errorInvalidType: (file) => `${file.name} — ტიპი დაუშვებელია`,
            errorTooLarge: (file, max) => `${file.name} — აღემატება ${max}-ს`,
          }}
        />
      </Demo>

      <Demo
        title="Re-themed"
        description="Tokens overridden on a wrapper — no library code involved."
      >
        <div className="pg-theme-violet">
          <FileUploader multiple accept="image/*" />
        </div>
      </Demo>
    </main>
  )
}

/** A demo block: the uploader (controlled) plus a live readout of its value and the last rejections. */
function Demo({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactElement<FileUploaderProps>
}) {
  const [files, setFiles] = useState<UploaderFile[]>([])
  const [rejected, setRejected] = useState<FileRejection[]>([])

  const uploader = {
    ...children,
    props: {
      ...children.props,
      value: files,
      onChange: setFiles,
      onDrop: (_accepted: File[], rejections: FileRejection[]) => setRejected(rejections),
    },
  }

  return (
    <section className="pg-section">
      <div>
        <h2 className="pg-section-title">{title}</h2>
        {description && <p className="pg-section-desc">{description}</p>}
      </div>
      {uploader}
      {(files.length > 0 || rejected.length > 0) && (
        <div className="pg-readout">
          {files.length > 0 && (
            <ul className="pg-chips">
              {files.map((f) => (
                <li key={f.id} className="pg-chip">
                  <span className="pg-chip__name">{f.file.name}</span>
                  <span className="pg-chip__size">{formatBytes(f.file.size)}</span>
                  <button
                    type="button"
                    className="pg-chip__remove"
                    aria-label={`Remove ${f.file.name}`}
                    onClick={() => setFiles(files.filter((x) => x.id !== f.id))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {rejected.length > 0 && (
            <p className="pg-rejected">
              last drop rejected: {rejected.map((r) => `${r.file.name} (${r.code})`).join(', ')}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
