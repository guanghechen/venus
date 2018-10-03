import fs from 'fs-extra'
import path from 'path'
import { logger } from '@/util/logger'
import { relativePath } from '@/util/path-util'
import { ensureFileExist } from '@/util/fs-util'
import { merge } from './merge'
import { partition } from './partition'


/**
 * 生成一个目标文件的文件名
 *
 * @param relativeSourcePath 相对于工程根目录的路径
 */
const generateExecutableTargetName = (relativeSourcePath: string): string => {
  const { dir: dirname, name: filename } = path.parse(relativeSourcePath)
  const name: string = dirname.split(/[\\/]+/g)
    .filter(p => !/^\s*$/.test(p))
    .slice(1)
    .join('-')
  if (name == null || name.length <= 0) return `P${filename}`
  if (/^\d+/.test(filename)) return `${name}${filename}`
  return `${name}-${filename}`
}


/**
 * 往 CMakeLists.txt 中添加 target
 *
 * @param cmakeListsPath
 * @param cmakeEncoding
 * @param executeDirectory
 * @param projectRootDirectory
 * @param absoluteSourcePath
 * @param targetName
 */
export const register = async (cmakeListsPath: string,
                               cmakeEncoding: string,
                               executeDirectory: string,
                               projectRootDirectory: string,
                               absoluteSourcePath: string,
                               targetName?: string): Promise<boolean> => {
  // 确保 CMakeLists.txt 存在
  await ensureFileExist(cmakeListsPath, 'bad cmake-lists file:')
  let content = await fs.readFile(cmakeListsPath, { encoding: cmakeEncoding })

  const cmakeLists = partition(content)
  const targetPath = relativePath(projectRootDirectory, absoluteSourcePath)
  const { executables } = cmakeLists

  if (!executables.has(targetPath)) {
    // 如果 targetName 未指定或未空字符串，则生成一个名字
    if (targetName == null || targetName.length < 0)
      targetName = await generateExecutableTargetName(targetPath)

    // 如果 targetName 已经存在，则在末尾加序号
    if (executables.has(targetName)) {
      for (let code = 1; ; ++code) {
        let newTargetName = targetName.indexOf('.') === -1
          ? `${targetName}-${code}`
          : targetName.replace(/\./, `-${code}.`)
        if (executables.has(newTargetName)) continue
        targetName = newTargetName
        break
      }
    }

    // 添加条目
    executables.set(targetName, targetPath)
  }

  // 写进 CMakeLists.txt 中
  content = merge({ ...cmakeLists, executables })
  await fs.writeFile(cmakeListsPath, content, cmakeEncoding)

  // 相对于执行命令所在的路径的相对路径，用于友好的提示
  const relativeCMakeListsPath = relativePath(projectRootDirectory, cmakeListsPath)
  const relativeSourcePath = relativePath(executeDirectory, absoluteSourcePath, projectRootDirectory)
  logger.debug(`registered ${relativeSourcePath} to ${relativeCMakeListsPath}.`)
  return true
}
