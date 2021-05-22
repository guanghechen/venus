import { isNonBlankString } from '@guanghechen/option-helper'
import path from 'path'

/**
 * Check if filepath1 under the filepath2.
 *
 * @param filepath1
 * @param filepath2
 * @see https://stackoverflow.com/a/45242825/15760674
 */
export function isUnderThePath(filepath1: string, filepath2: string): boolean {
  const p = path.relative(filepath2, filepath1)
  return isNonBlankString(p) && !p.startsWith('..') && !path.isAbsolute(p)
}

/**
 * Calc the path of filepath relative to cwd.
 *
 * @param filepath          target filepath
 * @param cwd               current workspace directory
 * @param rootDirectory     base directory
 */
export function relativePath(
  filepath: string,
  cwd: string,
  rootDirectory?: string,
): string {
  const absoluteFilepath = path.resolve(cwd, filepath)
  if (rootDirectory != null) {
    if (!isUnderThePath(absoluteFilepath, rootDirectory)) {
      return absoluteFilepath
    }
  }
  return path.relative(cwd, filepath)
}
