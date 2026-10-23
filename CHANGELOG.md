# Changelog

## Unreleased

### Added

- Dropzone: click-to-browse (a real `<button>` + hidden input), OS drag & drop with a live
  active / reject state, keyboard access, `prefers-reduced-motion` support.
- Validation: `accept` (MIME, wildcard, extension), `maxSize` / `minSize` (bytes or `"5MB"`),
  `maxFiles`, `multiple`. Rejections surface in an inline notice and via `onDrop(accepted, rejected)`.
- Value model `UploaderFile { id, file }` with controlled (`value` / `onChange`) and uncontrolled
  (`defaultValue`) modes.
- `label` (the dropzone's title) + `required`, `hint` (auto-generated from the constraints), `helperText`,
  `error`, `disabled`, `name`.
- `labels` — every rendered text is overridable.
- Exports: `formatBytes`, `toBytes`, types `UploaderFile`, `FileRejection`, `FileRejectionCode`,
  `FileUploaderLabels`, `Accept`.

## 0.0.1

### Added

- Project scaffold: Vite library build (ESM + CJS + declarations + a single `styles.css`), Vitest,
  Prettier, publint and a local playground.
- `--sfu-*` design tokens (light + dark) and the themed `.sfu` root component.
