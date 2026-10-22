# sava-file-uploader

A dependency-free, themeable file uploader for React — drag & drop, previews, upload progress and
reordering, written from scratch with plain CSS you can override.

> **Status:** early development (0.x — the API may still change). Part 2 ships the dropzone:
> picking, drag & drop and validation. The file list, previews and the upload engine follow.

## Install

```bash
npm install sava-file-uploader
```

`react` and `react-dom` (18 or newer) are peer dependencies. There are **no runtime dependencies**.

## Usage

```tsx
import { useState } from 'react'
import { FileUploader, type UploaderFile } from 'sava-file-uploader'
import 'sava-file-uploader/styles.css'

export function Form() {
  const [files, setFiles] = useState<UploaderFile[]>([])
  return (
    <FileUploader
      multiple
      accept="image/*,.pdf"
      maxSize="5MB"
      maxFiles={5}
      value={files}
      onChange={setFiles}
    />
  )
}
```

Import the stylesheet once, anywhere in your app. The component works controlled (`value` +
`onChange`) or uncontrolled (`defaultValue`).

## Props

| Prop           | Type                                                    | Default | Description                                                                                                                            |
| -------------- | ------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `accept`       | `string \| string[]`                                    | —       | Allowed types in the native `<input accept>` grammar: `"image/*"`, `"image/png,.pdf"`, `['image/*', '.pdf']`. Omit to accept anything. |
| `multiple`     | `boolean`                                               | `false` | Accept more than one file. In single mode a new pick replaces the current file.                                                        |
| `maxFiles`     | `number`                                                | —       | Maximum number of files (`multiple` only).                                                                                             |
| `maxSize`      | `number \| string`                                      | —       | Maximum size per file — bytes or `"5MB"` / `"500KB"`.                                                                                  |
| `minSize`      | `number \| string`                                      | —       | Minimum size per file.                                                                                                                 |
| `disabled`     | `boolean`                                               | `false` | Dims and inerts the control.                                                                                                           |
| `error`        | `boolean`                                               | `false` | Marks the field invalid (red border, `helperText` in the error color).                                                                 |
| `helperText`   | `ReactNode`                                             | —       | Helper / validation text under the control.                                                                                            |
| `hint`         | `ReactNode \| false`                                    | auto    | The constraints line in the dropzone. Generated from `accept` / `maxSize` / `maxFiles`; pass a node to replace it, `false` to hide it. |
| `labels`       | `Partial<FileUploaderLabels>`                           | English | Override any rendered text — for translation or tone.                                                                                  |
| `name`         | `string`                                                | —       | `name` of the underlying `<input type="file">`.                                                                                        |
| `value`        | `UploaderFile[]`                                        | —       | Controlled value.                                                                                                                      |
| `defaultValue` | `UploaderFile[]`                                        | `[]`    | Initial value for uncontrolled use.                                                                                                    |
| `onChange`     | `(files: UploaderFile[]) => void`                       | —       | Fires with the next value whenever files are added.                                                                                    |
| `onDrop`       | `(accepted: File[], rejected: FileRejection[]) => void` | —       | Raw result of every pick or drop: the files that passed validation and the ones that did not (`code` + `message`).                     |

Any other prop is forwarded to the root `<div>`; the component forwards its `ref` to it.

### Validation

Files are checked in order — type (`accept`), size (`maxSize` / `minSize`), then count (`maxFiles`).
A batch that is too big still adds as many valid files as there is room for. Rejections are listed in an
inline notice under the dropzone (auto-dismissed after 6 s) and reported through `onDrop` with a
`FileRejectionCode`: `file-invalid-type`, `file-too-large`, `file-too-small`, `too-many-files`.

While a drag hovers the dropzone, it turns red when the dragged items _certainly_ cannot be added (every
type disallowed, or no room left). The browser exposes only MIME types mid-drag, so extension rules are
treated optimistically until the drop.

### Accessibility

The browse control is a real `<button>` (Tab reaches it, Enter / Space open the picker); the whole panel
is clickable. Rejections render in a polite `aria-live` region and the button is `aria-describedby` the
helper text and the notice. Motion respects `prefers-reduced-motion`.

## Theming

Every color, radius, spacing and motion value is a CSS custom property prefixed `--sfu-`. Override
them globally or scoped to one uploader:

```css
:root {
  --sfu-color-accent: #7c3aed;
  --sfu-radius-lg: 8px;
}

.checkout .sfu {
  --sfu-color-surface: #fff;
}
```

Class names are stable and prefixed (`.sfu`, `.sfu-dropzone`, `.sfu-item`, …) and are part of the
public API, so you can also write your own rules against them.

**Dark mode** — set `data-sfu-theme="dark"` on `<html>` (or any ancestor) to force it,
`data-sfu-theme="light"` to opt out, or set nothing and the OS preference decides.

The full token list lives in [`src/styles/tokens.css`](./src/styles/tokens.css).

## Development

```bash
npm install
npm run dev        # playground at http://localhost:5173
npm test           # vitest
npm run build      # dist/ — ESM + CJS + types + styles.css
```

## Roadmap

1. ~~Project scaffold~~
2. ~~Dropzone + file picking, validation (accept / size / count)~~
3. File list with previews, status and remove
4. Upload engine (XHR progress, abort, retry, server adapter)
5. Reorder, image previews / lightbox, polish

## License

MIT © David Savaneli
