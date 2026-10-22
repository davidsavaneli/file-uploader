# sava-file-uploader

A React file uploader published to npm as `sava-file-uploader`. Built from scratch; the reference
for UX is FilePond, the owner's earlier `@techzyapp/ui-library` FileUploader is what this one
deliberately differs from.

## Hard rules

- **Zero runtime dependencies.** Only `react` / `react-dom` as peers. No `clsx`, no dnd library, no
  dropzone library — drag & drop, reorder, previews, XHR progress are all written here.
- **Plain CSS only.** No CSS Modules, no Tailwind, no CSS-in-JS. Consumers must be able to re-theme
  and write their own rules, so:
  - every class name is stable and prefixed `sfu-` (root is `.sfu`); class names are public API —
    rename only with a changelog entry;
  - every color / radius / spacing / motion value comes from a `--sfu-*` token in
    `src/styles/tokens.css` — no literal colors in component CSS (black/white scrims over images are
    the one justified exception);
  - dark mode = `[data-sfu-theme='dark']` + `prefers-color-scheme` fallback, both defined in tokens.css.
- **Accessibility is not optional**: keyboard-operable dropzone and item actions, `aria-label`s on
  icon buttons, live region for status, focus-visible rings via `--sfu-color-accent-ring`,
  `prefers-reduced-motion` respected.

## Layout

- `src/index.ts` — public entry; imports `styles/index.css` (that import is what emits `dist/styles.css`).
- `src/FileUploader/` — the component; one folder per sub-piece as it grows (`Dropzone/`, `FileItem/`, …),
  each with its own `*.test.tsx`.
- `src/styles/` — `tokens.css` (design tokens), one CSS file per component piece, all `@import`ed from `index.css`.
- `playground/` — local demo (`npm run dev`), never published. Add a `<section className="pg-section">` per feature.
- `scripts/post-build.mjs` — duplicates `.d.ts` → `.d.cts` for the CJS condition.

## Conventions

- Prettier: no semicolons, single quotes, width 100, trailing commas. Run `npm run format` before finishing.
- Components are `forwardRef` function components with a `displayName`; props extend the matching HTML
  attributes and are documented with JSDoc (they end up in the `.d.ts`).
- Tests: Vitest + Testing Library in jsdom. Test behavior and markup, not computed styles.
- Pre-flight before any publish: `npm run format:check && npm run typecheck && npm test && npm run build && npm run lint:pkg`.
- See `PUBLISH.md` for the release steps; the owner commits, tags and publishes manually.
