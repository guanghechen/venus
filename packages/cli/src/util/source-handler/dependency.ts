import { isNonBlankString } from '@guanghechen/helper-is'
import {
  ensureCriticalFilepathExistsSync,
  isFileSync,
} from '@guanghechen/helper-path'
import fs from 'fs-extra'
import path from 'node:path'
import { logger } from '../../env/logger'
import { toposort } from '../topo-sort'
import type { ITopoNode } from '../topo-sort'
import merge from './merge'
import parse from './parse'

export function resolveLocalDependencyPath(
  dependencies: string[],
  absoluteSourcePath: string,
  workspace: string,
  includes: string[],
): Array<string | null> {
  const absoluteSourceDirectory = path.dirname(absoluteSourcePath)
  const resolvedDependencies: Array<string | null> = []

  for (const dependency of dependencies) {
    let resolvedDependency: string | null = null

    // 尝试用 CMakeLists.txt 中定义的依赖的路径为参考路径
    for (let i = 0; i < includes.length; ++i) {
      const absoluteDependencyPath = path.resolve(
        workspace,
        includes[i],
        dependency,
      )
      if (isFileSync(absoluteDependencyPath)) {
        resolvedDependency = absoluteDependencyPath
        break
      }
    }

    // 否则尝试以源文件所在路径为参考路径
    if (resolvedDependency == null) {
      const absoluteDependencyPath = path.resolve(
        absoluteSourceDirectory,
        dependency,
      )
      if (isFileSync(absoluteDependencyPath)) {
        resolvedDependency = absoluteDependencyPath
      }
    }

    resolvedDependencies.push(resolvedDependency)
  }
  return resolvedDependencies
}

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
  ) => Array<string | null>,
  absoluteSourcePath: string,
  encoding: BufferEncoding,
): Promise<string> {
  const namespaces: string[] = []
  const standardDependencies: string[] = []
  const typedefs: Map<string, string> = new Map<string, string>()

  // Collect dependencies.
  const o: ITopoNode = await collectDependencies(
    resolveDependencyPath,
    absoluteSourcePath,
    encoding,
    standardDependencies,
  )

  o.value = ''
  const localDependencies: string[] = toposort(o)
    .filter(isNonBlankString)
    .reverse() // 按照依赖的拓扑顺序的逆序添加本地的依赖

  let result = ''

  // 按照依赖的拓扑序将代码拼接，并将源文件添加到末尾，使得生成的代码中出现在最下面
  localDependencies.push(absoluteSourcePath)
  for (const dependency of localDependencies) {
    ensureCriticalFilepathExistsSync(dependency)
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
  ) => Array<string | null>,
  absolutePath: string,
  encoding: BufferEncoding,
  standardDependencies: string[],
): Promise<ITopoNode> {
  const dependencySet: Set<string> = new Set<string>()
  const topoNodeMap: Map<string, ITopoNode> = new Map<string, ITopoNode>()

  async function collect(absolutePath: string): Promise<ITopoNode> {
    ensureCriticalFilepathExistsSync(absolutePath)
    const content = await fs.readFile(absolutePath, { encoding })
    const dependencies = parse(content).dependencies.filter(isNonBlankString)

    // Calc the absolute dependency path
    const resolvedDependencies = resolveDependencyPath(
      dependencies,
      absolutePath,
    )

    // dependencies and resolvedDependencies should be of equal length.
    if (dependencies.length !== resolvedDependencies.length) {
      logger.debug(
        `dependencies.length(${dependencies.length}) is not equals to resolvedDependencies.length(${resolvedDependencies.length})`,
      )
      logger.fatal('process error.')
      process.exit(-1)
    }

    const o: ITopoNode = { value: absolutePath, children: [] }
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

  const o: ITopoNode = await collect(absolutePath)
  return o
}
