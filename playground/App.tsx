import { useEffect, useState } from 'react'
import { FileUploader } from '../src'

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
          <p className="pg-subtitle">Playground — part 1: project scaffold</p>
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

      <section className="pg-section">
        <h2 className="pg-section-title">Placeholder</h2>
        <FileUploader>
          <div className="pg-placeholder">
            The <code>.sfu</code> root renders and picks up the tokens — the dropzone comes next.
          </div>
        </FileUploader>
      </section>
    </main>
  )
}
