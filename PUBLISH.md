# Publishing `sava-file-uploader`

Unscoped public package — a plain `npm publish` works. You publish and push manually; nothing here
pushes to git or publishes on its own.

## 1. Pre-flight — everything must be green

```bash
npm run format:check && npm run typecheck && npm test && npm run build && npm run lint:pkg
```

If `format:check` fails, run `npm run format` and commit the result.

## 2. Bump the version

A published version can never be re-published — always bump first.

```bash
npm version patch --no-git-tag-version   # e.g. 0.0.1 → 0.0.2
```

Check what is published vs. local if unsure:

```bash
npm view sava-file-uploader version
```

## 3. Update the CHANGELOG

Add the new version at the top of [`CHANGELOG.md`](./CHANGELOG.md) (Added / Changed / Fixed).

## 4. Publish

```bash
npm publish
```

`prepublishOnly` rebuilds `dist/` first. Make sure you are logged in (`npm whoami`).

## 5. Git (manual)

```bash
git add -A
git commit -m "0.0.2"
git tag v0.0.2
git push && git push --tags
```

## Notes

- Only `dist/` is published (`files: ["dist"]`), plus `package.json`, `README.md` and `LICENSE`.
  Inspect with `npm pack --dry-run`.
- `react` / `react-dom` are peers and never bundled.
- Subpath exports: `.` and `./styles.css`; `publint` guards that they resolve.
