import fs from 'fs-extra'
import { relativePath } from '@/util/path-util'
import { parseCmakeLists } from './parse'
import { getAddExecutableRegex } from './regex'


/**
 * 往 CMakeLists.txt 中删除 target
 *
 * @param cmakeListsPath
 * @param cmakeEncoding
 * @param projectRootDirectory
 * @param absoluteSourcePath
 */
export const remove = async (cmakeListsPath: string,
                             cmakeEncoding: string,
                             projectRootDirectory: string,
                             absoluteSourcePath: string): Promise<boolean> => {
  const targetPath = relativePath(projectRootDirectory, absoluteSourcePath)

  // 如果 targetPath 已经在 CMakeLists 中了（已注册），则直接返回
  const { addExecutableMap } = await parseCmakeLists(cmakeListsPath, cmakeEncoding)

  let flag: boolean = false
  for (let [key, val] of addExecutableMap.entries()) {
    // 删除条目
    if (val === targetPath) {
      addExecutableMap.delete(key)
      flag = true
      break
    }
  }

  const addExecutableSet = new Set()
  const executableItems = [...addExecutableMap.entries()]
    .sort((alpha, beta) => {
      if (alpha[1] === beta[1]) return alpha[0].localeCompare(beta[0])
      return alpha[1].localeCompare(beta[1])
    })
    .filter(([key, val]) => {
      if (addExecutableSet.has(val)) return false
      addExecutableSet.add(val)
      return true
    })

  // add_executable 的左侧填充到等长
  let maxLength = executableItems.reduce((m, c) => Math.max(m, c[0].length), 0)
  maxLength += (maxLength&1)
  const fillSpaces = (text: string) => text + ' '.repeat(maxLength - text.length)

  const executables = executableItems
    .map(item => `add_executable(${fillSpaces(item[0])} ${item[1]})`)
    .join('\n')

  // 删除 executable
  const addExecutableRegex = getAddExecutableRegex()
  let content: string = await fs.readFile(cmakeListsPath, { encoding: cmakeEncoding })
  content = content
    .split(/\n/g)
    .filter(text => !addExecutableRegex.test(text))
    .join('\n')
    .concat('\n' + executables + '\n')
    .replace(/(\n\s*){2,}/g, '\n\n')

  // 写进 CMakeLists.txt 中
  await fs.writeFile(cmakeListsPath, content, cmakeEncoding)
  return flag
}

