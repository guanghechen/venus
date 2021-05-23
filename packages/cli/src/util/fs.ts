import fs from 'fs-extra'

/**
 * Check whether if the given filepath exists.
 * @param filepath
 */
export function isExists(filepath: string | null): filepath is string {
  return filepath !== null && fs.existsSync(filepath)
}

/**
 * Check whether if the given filepath exists and that it is a file path.
 * @param filepath
 */
export function isFile(filepath: string | null): filepath is string {
  return isExists(filepath) && fs.statSync(filepath).isFile()
}

/**
 * Check whether if the given filepath exists and that it is a directory path.
 * @param filepath
 */
export function isDirectory(filepath: string | null): boolean {
  return isExists(filepath) && fs.statSync(filepath).isDirectory()
}

/**
 * Ensure the given filepath exists, otherwise, an exception will be thrown.
 * @param filepath
 * @param message
 */
export function ensureExists(
  filepath: string | null,
  message?: string,
): void | never {
  if (isExists(filepath)) return
  throw new ReferenceError(message ?? `Cannot find '${filepath}'.`)
}

/**
 * Ensure the given filepath exists and it is a file path.
 * Otherwise, an exception will be thrown.
 * @param filepath
 * @param message
 */
export function ensureFileExists(
  filepath: string | null,
  message?: string,
): void | never {
  ensureExists(filepath, message)
  if (fs.statSync(filepath!).isFile()) return
  throw new ReferenceError(message ?? `${filepath} is not a file path.`)
}

/**
 * Ensure the given filepath exists and it is a directory path.
 * Otherwise, an exception will be thrown.
 * @param filepath
 * @param message
 */
export function ensureDirectoryExists(
  filepath: string | null,
  message?: string,
): void | never {
  ensureExists(filepath, message)
  if (fs.statSync(filepath!).isDirectory()) return
  throw new ReferenceError(message ?? `${filepath} is not a directory path.`)
}
