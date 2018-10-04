import fs from 'fs-extra'
import { logger } from '@/util/logger'
import { ensureFileExist } from '@/util/fs-util'
import { merge } from './merge'
import { partition } from './partition'


/**
 * 将所有的本地依赖都替换为相应的源码
 *
 * @param resolveDependencyPath   计算本地依赖的绝对路径（标准库则返回 null）
 * @param absoluteSourcePath      源文件的绝对路径
 * @param encoding                源文件的编码格式
 * @return 解决依赖后的源文件内容
 */
export const resolveDependencies = async (resolveDependencyPath: (dependencies: string[],
                                                                  absoluteSourcePath: string) => Promise<(string | null)[]>,
                                          absoluteSourcePath: string,
                                          encoding: string): Promise<string> => {
  const localDependencies: string[] = []                  // 按照依赖的出现顺序添加的本地依赖
  const standardDependencies: string[] = []               // 标准库依赖
  const dependencySet: Set<string> = new Set<string>()    // 用于判重
  const namespaces: string[] = []
  const typedefs: Map<string, string> = new Map<string, string>()

  /**
   * 收集所有的标准库依赖和本地库依赖
   * @param absolutePath 当前解析的源文件的绝对路径
   */
  const collectDependencies = async (absolutePath: string): Promise<void> => {
    await ensureFileExist(absolutePath)
    const content = await fs.readFile(absolutePath, { encoding })
    const dependencies = partition(content).dependencies
      .filter(dependency => {
        // 如果为空，则直接跳过
        if (dependency == null || /^\s*$/.test(dependency)) return false
        // 如果已经处理过，则直接跳过
        if (dependencySet.has(dependency)) return false
        dependencySet.add(dependency)
        return true
      })

    // 获得依赖的绝对路径
    const resolvedDependencies = await resolveDependencyPath(dependencies, absolutePath)

    // dependencies 和 resolvedDependencies 等长
    if (dependencies.length !== resolvedDependencies.length) {
      logger.debug(`dependencies.length(${dependencies.length}) is not equals to resolvedDependencies.length(${resolvedDependencies.length})`)
      logger.fatal('process error.')
      process.exit(-1)
    }

    for (let i=0; i < dependencies.length; ++i) {
      const dependency = dependencies[i]
      const resolvedDependency = resolvedDependencies[i]
      if (resolvedDependency == null) standardDependencies.push(dependency)
      else {
        // 本地依赖，先递归解决依赖，前面 dependenceSet 去重的处理已经保证了拓扑序
        await collectDependencies(resolvedDependency)
        // 保证当前依赖的依赖已全部满足
        localDependencies.push(resolvedDependency)
      }
    }
  }

  // 收集依赖树中的所有依赖
  await collectDependencies(absoluteSourcePath)

  let result: string = ''

  // 按照依赖的拓扑序将代码拼接，并将源文件添加到末尾，使得生成的代码中出现在最下面
  localDependencies.push(absoluteSourcePath)
  for (let dependency of localDependencies) {
    await ensureFileExist(dependency)
    const content = await fs.readFile(dependency, { encoding })
    const sourceItem = partition(content)
    namespaces.push(...sourceItem.namespaces)
    ; [...sourceItem.typedefs.entries()].forEach(([key, val]) => typedefs.set(key, val))
    result += merge({ ...sourceItem, dependencies: [] }).concat('\n')
  }

  const sourceItem = partition(result)
  namespaces.push(...sourceItem.namespaces)
  ; [...sourceItem.typedefs.entries()].forEach(([key, val]) => typedefs.set(key, val))
  return merge({
    ...sourceItem,
    dependencies: standardDependencies,
    namespaces,
    typedefs,
  })
}
