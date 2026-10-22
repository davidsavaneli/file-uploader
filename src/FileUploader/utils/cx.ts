/** Join truthy class names — the library's zero-dependency stand-in for `clsx`. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
