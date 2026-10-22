// Post-build, run after `vite build` + `tsc -p tsconfig.build.json`:
//  1. strip the side-effect CSS import from the entry declaration — it exists in src/index.ts only so Vite
//     emits dist/styles.css, and a consumer's tsc (TS 6 `TS2882`, no `vite/client` types) would choke on it;
//  2. duplicate every `.d.ts` as `.d.cts` so the package's CJS ("require") condition resolves CJS-flavored
//     types under `moduleResolution: node16/nodenext` (ESM consumers keep `.d.ts`).
import { cpSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const entry = 'dist/index.d.ts'
writeFileSync(entry, readFileSync(entry, 'utf8').replace(/^import '[^']*\.css';?\n/gm, ''))

function duplicateDeclarations(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) duplicateDeclarations(path)
    else if (entry.name.endsWith('.d.ts')) cpSync(path, path.replace(/\.d\.ts$/, '.d.cts'))
  }
}
duplicateDeclarations('dist')
