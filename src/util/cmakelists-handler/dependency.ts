import path from 'path'
import { isFile } from '@/util/fs-util'
import { parseCmakeLists } from './parse'


/**
 * 找到本地依赖的实际路径
 *
 * @param dependencies          依赖列表
 * @param absoluteSourcePath    源文件的绝对路径（引用了该依赖的源文件）
 * @param cmakeListsPath        CMakeLists.txt 的绝对路径
 * @param cmakeListsEncoding    CMakeLists.txt 的文件编码
 * @param projectRootDirectory  目标工程的根目录（CMakeLists.txt 所在的目录）
 * @return {(string | null)[]} 如果本地存在目标文件，则返回其绝对路径，否则返回 null
 */
export const resolveLocalDependencyPath = async (dependencies: string[],
                                                 absoluteSourcePath: string,
                                                 cmakeListsPath: string,
                                                 cmakeListsEncoding: string,
                                                 projectRootDirectory: string): Promise<(string | null)[]> => {
  // 源文件所在的目录
  const absoluteSourceDirectory = path.dirname(absoluteSourcePath)

  // 获取 CMakeLists.txt 中定义的依赖的路径
  const { includeDirectories } = await parseCmakeLists(cmakeListsPath, cmakeListsEncoding)
  const resolvedDependencies: (string | null)[] = []

  for (let dependency of dependencies) {
    let resolvedDependency: string | null = null

    // 检查是否为相对路径引用
    if (dependency.startsWith('.')) {
      // 尝试以源文件所在路径为参考路径
      const absoluteDependencyPath = path.resolve(absoluteSourceDirectory, dependency)
      if (await isFile(absoluteDependencyPath)) {
        resolvedDependency = absoluteDependencyPath
      }
    } else {
      // 否则尝试用 CMakeLists.txt 中定义的依赖的路径为参考路径
      for (let i=0; i < includeDirectories.length; ++i) {
        let absoluteDependencyPath = path.resolve(projectRootDirectory, includeDirectories[i], dependency)
        if (await isFile(absoluteDependencyPath)) {
          resolvedDependency = absoluteDependencyPath
          break
        }
      }
    }
    resolvedDependencies.push(resolvedDependency)
  }
  return resolvedDependencies
}
