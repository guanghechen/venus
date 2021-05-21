import { isString } from '@guanghechen/option-helper'
import path from 'path'

/**
 * 获取 absoluteSourcePath 相对于 directory 的路径，
 * 当指定了 rootDirectory 时，当且仅当 absoluteSourcePath 是 rootDirectory 的子路径时，
 * 才返回 absoluteSourcePath 相对于 directory 的路径，否则返回 absoluteSourcePath
 *
 * 当返回的路径不是绝对路径时，会自动将路径分隔符 '\' 替换为 '/'
 *
 * @param directory           参考路径
 * @param absoluteSourcePath  源文件路径
 * @param rootDirectory       根目录
 */
export const relativePath = (
  directory: string,
  absoluteSourcePath: string,
  rootDirectory?: string,
): string => {
  let relativePath: string
  if (isString(rootDirectory)) {
    const isSubDirectory =
      directory.startsWith(rootDirectory) &&
      (directory === rootDirectory ||
        /[/\\]/.test(directory.charAt(rootDirectory.length)))
    relativePath = isSubDirectory
      ? path.relative(directory, absoluteSourcePath)
      : absoluteSourcePath
  } else {
    relativePath = path.relative(directory, absoluteSourcePath)
  }
  if (path.isAbsolute(relativePath)) return relativePath
  return relativePath.replace(/[/\\]+/g, '/')
}
