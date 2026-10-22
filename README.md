# sava-file-uploader

A dependency-free, themeable file uploader for React — drag & drop, previews, upload progress and
reordering, written from scratch with plain CSS you can override.

> **Status:** early development. Part 1 ships the project scaffold and the themed root; the
> component arrives in the next releases.

## Install

```bash
npm install sava-file-uploader
```

`react` and `react-dom` (18 or newer) are peer dependencies. There are **no runtime dependencies**.

## Usage

```tsx
import { FileUploader } from 'sava-file-uploader'
import 'sava-file-uploader/styles.css'

export function Form() {
  return <FileUploader />
}
```

Import the stylesheet once, anywhere in your app.

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
2. Dropzone + file picking, validation (accept / size / count)
3. File list with previews, status and remove
4. Upload engine (XHR progress, abort, retry, server adapter)
5. Reorder, image previews / lightbox, polish

## License

MIT © David Savaneli
