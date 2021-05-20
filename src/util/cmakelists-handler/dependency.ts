import { isFile } from '@/util/fs-util'
import path from 'path'
import { partition } from './partition'

/**
 * 找到本地依赖的实际路径
 *
 * @param dependencies          依赖列表
 * @param absoluteSourcePath    源文件的绝对路径（引用了该依赖的源文件）
 * @param cmakeListsContent     CMakeLists.txt 的内容
 * @param projectRootDirectory  目标工程的根目录（CMakeLists.txt 所在的目录）
 * @return {(string | null)[]} 如果本地存在目标文件，则返回其绝对路径，否则返回 null
 */
export const resolveLocalDependencyPath = async (
  dependencies: string[],
  absoluteSourcePath: string,
  cmakeListsContent: string,
  projectRootDirectory: string,
): Promise<Array<string | null>> => {
  // 源文件所在的目录
  const absoluteSourceDirectory = path.dirname(absoluteSourcePath)

  // 获取 CMakeLists.txt 中定义的依赖的路径
  const { includes } = await partition(cmakeListsContent)
  const resolvedDependencies: Array<string | null> = []

  for (const dependency of dependencies) {
    let resolvedDependency: string | null = null

    // 尝试用 CMakeLists.txt 中定义的依赖的路径为参考路径
    for (let i = 0; i < includes.length; ++i) {
      const absoluteDependencyPath = path.resolve(
        projectRootDirectory,
        includes[i],
        dependency,
      )
      if (await isFile(absoluteDependencyPath)) {
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
      if (await isFile(absoluteDependencyPath)) {
        resolvedDependency = absoluteDependencyPath
      }
    }

    resolvedDependencies.push(resolvedDependency)
  }
  return resolvedDependencies
}
