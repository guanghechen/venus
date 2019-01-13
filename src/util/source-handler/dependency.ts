import fs from 'fs-extra'
import { logger } from '@/util/logger'
import { ensureFileExist } from '@/util/fs-util'
import { merge } from './merge'
import { partition } from './partition'
import { TopoNode, toposort } from '@/util/topo-sort'


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
  const standardDependencies: string[] = []               // 标准库依赖
  const dependencySet: Set<string> = new Set<string>()    // 用于判重
  const namespaces: string[] = []
  const typedefs: Map<string, string> = new Map<string, string>()
  const topoNodeMap: Map<string, TopoNode> = new Map<string, TopoNode>()

  /**
   * 收集所有的标准库依赖和本地库依赖
   * @param absolutePath 当前解析的源文件的绝对路径
   */
  const collectDependencies = async (absolutePath: string): Promise<TopoNode> => {
    await ensureFileExist(absolutePath)
    const content = await fs.readFile(absolutePath, { encoding })
    const dependencies = partition(content).dependencies
      .filter(dependency => {
        // 如果为空，则直接跳过
        if (dependency == null || /^\s*$/.test(dependency)) return false
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

    const o: TopoNode = { value: absolutePath, children: [] }
    topoNodeMap.set(o.value, o)
    for (let i=0; i < dependencies.length; ++i) {
      const dependency = dependencies[i]
      const resolvedDependency = resolvedDependencies[i]

      // 如果已经处理过，则不再处理
      if (dependencySet.has(dependency)) {
        if (resolvedDependency != null) o.children.push(topoNodeMap.get(resolvedDependency)!)
        continue
      }

      dependencySet.add(dependency)

      // 标准库
      if (resolvedDependency == null) {
        standardDependencies.push(dependency)
        continue
      }

      // 本地依赖，先递归解决依赖
      const c = await collectDependencies(resolvedDependency)
      o.children.push(c)
    }
    return o
  }

  // 收集依赖树中的所有依赖
  const o = await collectDependencies(absoluteSourcePath)
  o.value = ''
  const localDependencies: string[] = toposort(o).filter(u => u != '').reverse()   // 按照依赖的拓扑顺序的逆序添加的本地依赖

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
