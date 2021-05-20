import { projectConfig } from '@/config/immutable'
import type { CMakeLists } from '.'

/**
 * 合并 CMakeLists.txt
 *
 * @param cmakeLists
 * @return 合并后的 CMakeLists.txt 的内容
 */
export const merge = (cmakeLists: CMakeLists): string => {
  const { header } = cmakeLists

  // include_directories
  const includeDirectories: string = cmakeLists.includes
    .map(include => `include_directories(${include})`)
    .join('\n')

  // 添加默认编译选项
  cmakeLists.compileDefinitions.set(projectConfig.definitionPhase, '')

  // add_compile_definitions
  const addCompileDefinitionSet: Set<string> = new Set<string>()
  const addCompileDefinitions: string = [
    ...cmakeLists.compileDefinitions.entries(),
  ]
    .filter(([target]) => {
      if (addCompileDefinitionSet.has(target)) return false
      addCompileDefinitionSet.add(target)
      return true
    })
    .map(([definition, value]) => {
      if (value != null && value.length > 0)
        return `add_compile_definitions(${definition}=${value})`
      return `add_compile_definitions(${definition})`
    })
    .join('\n')

  // add_executables
  const addExecutableSet: Set<string> = new Set<string>()
  const addExecutableEntries = [...cmakeLists.executables.entries()]
    .filter(([target, source]) => {
      if (addExecutableSet.has(source)) return false
      addExecutableSet.add(source)
      return true
    })
    .sort(([, source1], [, source2]) => source1.localeCompare(source2))

  // 获取 add_executables 中 target 最长的长度，并使用空格补齐长度
  const maxTargetLength: number = addExecutableEntries.reduce(
    (m, c) => Math.max(m, c[0].length),
    0,
  )
  const fillSpaces = (text: string): string =>
    text + ' '.repeat(maxTargetLength - text.length)

  // 拼接 add_executables 列表
  const addExecutables = addExecutableEntries
    .map(
      ([target, source]) => `add_executable(${fillSpaces(target)} ${source})`,
    )
    .join('\n')

  return header
    .trim()
    .concat('\n\n')
    .concat(includeDirectories)
    .concat('\n\n')
    .concat(addCompileDefinitions)
    .concat('\n\n')
    .concat(addExecutables)
    .concat('\n')
}
