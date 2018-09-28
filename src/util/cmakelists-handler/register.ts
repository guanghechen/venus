import fs from 'fs-extra'
import path from 'path'
import { relativePath } from '@/util/path-util'
import { parseCmakeLists } from './parse'
import { getAddExecutableRegex } from './regex'


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
 * @param projectRootDirectory
 * @param absoluteSourcePath
 * @param targetName
 */
export const register = async (cmakeListsPath: string,
                               cmakeEncoding: string,
                               projectRootDirectory: string,
                               absoluteSourcePath: string,
                               targetName?: string): Promise<boolean> => {
  const targetPath = relativePath(projectRootDirectory, absoluteSourcePath)

  // 如果 targetPath 已经在 CMakeLists 中了（已注册），则直接返回
  const { addExecutableMap } = await parseCmakeLists(cmakeListsPath, cmakeEncoding)
  const addExecutableSet = new Set(addExecutableMap.values())

  if (!addExecutableSet.has(targetPath)) {
    // 如果 targetName 未指定或未空字符串，则生成一个名字
    if (targetName == null || targetName.length < 0)
      targetName = await generateExecutableTargetName(targetPath)

    // 如果 targetName 已经存在，则在末尾加序号
    if (addExecutableMap.has(targetName)) {
      for (let code = 1; ; ++code) {
        let newTargetName = targetName.indexOf('.') === -1
          ? `${targetName}-${code}`
          : targetName.replace(/\./, `-${code}.`)
        if (addExecutableMap.has(newTargetName)) continue
        targetName = newTargetName
        break
      }
    }

    // 添加条目
    addExecutableMap.set(targetName, targetPath)
  }

  addExecutableSet.clear()
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
  return true
}

