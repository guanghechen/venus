import fs from 'fs-extra'
import minimatch from 'minimatch'
import path from 'path'

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

/**
 * Find the nearest directory path which contains the target file.
 * @param filepath
 * @param target
 */
export function findNearestTarget(
  filepath: string,
  target: string,
): string | null {
  ensureDirectoryExists(filepath)
  const absoluteTarget = path.resolve(filepath, target)
  if (isExists(absoluteTarget)) return absoluteTarget
  const parentDirectory = path.dirname(filepath)
  return parentDirectory === filepath
    ? null
    : findNearestTarget(parentDirectory, target)
}

/**
 * Collect source files matched the given patterns
 * from the directory in recursively.
 *
 * @param dirpath
 * @param shouldRecursively
 * @param patterns
 */
export function collectFiles(
  dirpath: string,
  shouldRecursively: boolean,
  patterns?: string[],
): string[] {
  const filenames = fs.readdirSync(dirpath)
  const result: string[] = []

  for (const filename of filenames) {
    const filepath = path.resolve(dirpath, filename)
    if (isFile(filepath)) {
      // 需要满足特定的 pattern 的文件才将删除
      if (
        patterns == null ||
        patterns.some(pattern =>
          minimatch(filepath, pattern, { matchBase: true }),
        )
      ) {
        result.push(filepath)
      }
    } else if (shouldRecursively && isDirectory(filepath)) {
      result.push(...collectFiles(filepath, shouldRecursively, patterns))
    }
  }

  return result
}
