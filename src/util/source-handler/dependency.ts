import { ensureFileExists } from '@/util/fs'
import { logger } from '@/util/logger'
import { toposort } from '@/util/topo-sort'
import { isNonBlankString } from '@guanghechen/option-helper'
import fs from 'fs-extra'
import type { TopoNode } from '@/util/topo-sort'
import merge from './merge'
import parse from './parse'

/**
 * Replace the local dependencies with the referenced source contents
 *
 * @param resolveDependencyPath   calc the absolute path of local dependencies
 * @param absoluteSourcePath      absolute path of the source file
 * @param encoding                encoding of the source file
 * @return resolved source code
 */
export async function resolveDependencies(
  resolveDependencyPath: (
    dependencies: string[],
    absoluteSourcePath: string,
  ) => Promise<Array<string | null>>,
  absoluteSourcePath: string,
  encoding: string,
): Promise<string> {
  const namespaces: string[] = []
  const standardDependencies: string[] = []
  const typedefs: Map<string, string> = new Map<string, string>()

  // Collect dependencies.
  const o = await collectDependencies(
    resolveDependencyPath,
    absoluteSourcePath,
    encoding,
    standardDependencies,
  )

  o.value = ''
  const localDependencies: string[] = toposort(o)
    .filter(u => u != '')
    .reverse() // 按照依赖的拓扑顺序的逆序添加本地的依赖

  let result = ''

  // 按照依赖的拓扑序将代码拼接，并将源文件添加到末尾，使得生成的代码中出现在最下面
  localDependencies.push(absoluteSourcePath)
  for (const dependency of localDependencies) {
    ensureFileExists(dependency)
    const content = await fs.readFile(dependency, { encoding })
    const sourceItem = parse(content)
    namespaces.push(...sourceItem.namespaces)
    for (const [key, val] of sourceItem.typedefs.entries()) {
      typedefs.set(key, val)
    }
    result += merge({ ...sourceItem, dependencies: [] }).concat('\n')
  }

  const sourceItem = parse(result)
  namespaces.push(...sourceItem.namespaces)
  for (const [key, val] of sourceItem.typedefs.entries()) {
    typedefs.set(key, val)
  }

  const resolvedContent = merge({
    ...sourceItem,
    dependencies: standardDependencies,
    namespaces,
    typedefs,
  })
  return resolvedContent
}

/**
 *
 * @param resolveDependencyPath
 * @param absolutePath
 * @param encoding
 * @param standardDependencies
 * @returns
 */
async function collectDependencies(
  resolveDependencyPath: (
    dependencies: string[],
    absoluteSourcePath: string,
  ) => Promise<Array<string | null>>,
  absolutePath: string,
  encoding: string,
  standardDependencies: string[],
): Promise<TopoNode> {
  const dependencySet: Set<string> = new Set<string>()
  const topoNodeMap: Map<string, TopoNode> = new Map<string, TopoNode>()

  async function collect(absolutePath: string): Promise<TopoNode> {
    ensureFileExists(absolutePath)
    const content = await fs.readFile(absolutePath, { encoding })
    const dependencies = parse(content).dependencies.filter(isNonBlankString)

    // Calc the absolute dependency path
    const resolvedDependencies = await resolveDependencyPath(
      dependencies,
      absolutePath,
    )

    // dependencies 和 resolvedDependencies 等长
    if (dependencies.length !== resolvedDependencies.length) {
      logger.debug(
        `dependencies.length(${dependencies.length}) is not equals to resolvedDependencies.length(${resolvedDependencies.length})`,
      )
      logger.fatal('process error.')
      process.exit(-1)
    }

    const o: TopoNode = { value: absolutePath, children: [] }
    topoNodeMap.set(o.value, o)
    for (let i = 0; i < dependencies.length; ++i) {
      const dependency = dependencies[i]
      const resolvedDependency = resolvedDependencies[i]

      // Skip the handled dependencies.
      if (dependencySet.has(dependency)) {
        if (resolvedDependency != null)
          o.children.push(topoNodeMap.get(resolvedDependency)!)
        continue
      }
      dependencySet.add(dependency)

      // Handle standard dependency.
      if (resolvedDependency == null) {
        standardDependencies.push(dependency)
        continue
      }

      // Recursively handling.
      const c = await collect(resolvedDependency)
      o.children.push(c)
    }
    return o
  }

  const o: TopoNode = await collect(absolutePath)
  return o
}
