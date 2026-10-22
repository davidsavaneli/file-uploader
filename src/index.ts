// Library entry. The stylesheet import is what makes Vite emit `dist/styles.css`; it is stripped from the
// JS output, so consumers add `import 'sava-file-uploader/styles.css'` themselves.
import './styles/index.css'

export { FileUploader } from './FileUploader'
export type { FileUploaderProps } from './FileUploader'
