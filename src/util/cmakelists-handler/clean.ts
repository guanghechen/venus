import fs from 'fs-extra'
import path from 'path'
import { logger } from '@/util/logger'
import { ensureFileExist, isFile } from '@/util/fs-util'
import { partition } from './partition'
import { merge } from './merge'


/**
 * 清空 CMakeLists.txt 中无效的 add_executable 条目
 *
 * @param cmakeListsPath
 * @param cmakeEncoding
 * @param projectRootDirectory
 */
export const clean = async (cmakeListsPath: string,
                             cmakeEncoding: string,
                             projectRootDirectory: string): Promise<void> => {
  // 确保 CMakeLists.txt 存在
  await ensureFileExist(cmakeListsPath, 'bad cmake-lists file:')
  let content = await fs.readFile(cmakeListsPath, { encoding: cmakeEncoding })

  const cmakeLists = partition(content)
  const { executables } = cmakeLists

  const entries = [...executables.entries()]
  for (let [key, val] of entries) {
    // 如果源文件已经不存在了，则清除条目
    const absoluteSourcePath = path.resolve(projectRootDirectory, val)
    if (!await isFile(absoluteSourcePath)) {
      executables.delete(key)
    }
  }

  // 写进 CMakeLists.txt 中
  content = merge({ ...cmakeLists, executables })
  await fs.writeFile(cmakeListsPath, content, cmakeEncoding)
  logger.verbose(`cleaned from ${path.relative(projectRootDirectory, cmakeListsPath)}.`)
}

