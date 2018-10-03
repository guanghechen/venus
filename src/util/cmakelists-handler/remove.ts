import fs from 'fs-extra'
import { logger } from '@/util/logger'
import { ensureFileExist } from '@/util/fs-util'
import { relativePath } from '@/util/path-util'
import { partition } from './partition'
import { merge } from './merge'


/**
 * 往 CMakeLists.txt 中删除 target
 *
 * @param cmakeListsPath
 * @param cmakeEncoding
 * @param executeDirectory
 * @param projectRootDirectory
 * @param absoluteSourcePath
 */
export const remove = async (cmakeListsPath: string,
                             cmakeEncoding: string,
                             executeDirectory: string,
                             projectRootDirectory: string,
                             absoluteSourcePath: string): Promise<boolean> => {
  // 确保 CMakeLists.txt 存在
  await ensureFileExist(cmakeListsPath, 'bad cmake-lists file:')
  let content = await fs.readFile(cmakeListsPath, { encoding: cmakeEncoding })

  const cmakeLists = partition(content)
  const targetPath = relativePath(projectRootDirectory, absoluteSourcePath)
  const { executables } = cmakeLists

  let flag: boolean = false
  for (let [key, val] of executables.entries()) {
    // 删除条目
    if (val === targetPath) {
      executables.delete(key)
      flag = true
      break
    }
  }

  // 写进 CMakeLists.txt 中
  content = merge({ ...cmakeLists, executables })
  await fs.writeFile(cmakeListsPath, content, cmakeEncoding)

  // 相对于执行命令所在的路径的相对路径，用于友好的提示
  const relativeCMakeListsPath = relativePath(projectRootDirectory, cmakeListsPath)
  const relativeSourcePath = relativePath(executeDirectory, absoluteSourcePath, projectRootDirectory)
  flag
    ? logger.debug(`removed ${relativeSourcePath} from ${relativeCMakeListsPath}.`)
    : logger.warn(`${relativeSourcePath} is not found in ${relativeCMakeListsPath}.`)
  return flag
}

