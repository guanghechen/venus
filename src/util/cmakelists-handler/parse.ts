import fs from 'fs-extra'
import { ensureFileExist } from '@/util/fs-util'
import { getAddExecutableRegex, getIncludeDirectoriesRegex } from './regex'


interface CMakeLists {
  includeDirectories: string[]
  addExecutableMap: Map<string, string>
}


/**
 * 解析 CmakeLists.txt，获取需要的数据
 *
 * @param cmakeListsPath
 * @param encoding
 */
export const parseCmakeLists = async (cmakeListsPath: string, encoding: string): Promise<CMakeLists> => {
  // 确保 CMakeLists.txt 存在
  await ensureFileExist(cmakeListsPath, 'bad cmake-lists file:')

  const cmakeLists = await fs.readFile(cmakeListsPath, { encoding })
  const items = cmakeLists.split(/\n+/g)

  // parse include_directories
  const includeDirectoriesRegex: RegExp = getIncludeDirectoriesRegex()
  const includeDirectories: string[] = items
    .filter(item => includeDirectoriesRegex.test(item))
    .map(item => includeDirectoriesRegex.exec(item)![1])

  // parse add_executable
  const addExecutableRegex: RegExp = getAddExecutableRegex()
  const addExecutableMap: Map<string, string> = items
    .filter(item => addExecutableRegex.test(item))
    .map(item => addExecutableRegex.exec(item)!)
    .reduce((mp, [, target, source]) => mp.set(target, source), new Map<string, string>())

  return {
    includeDirectories,
    addExecutableMap,
  }
}
