import fs from 'fs-extra'
import path from 'path'
import { isFile } from '@/util/fs-util'
import { partition } from '@/util/source-handler/partition'
import { merge } from '@/util/source-handler/merge'
import { logger } from '@/util/logger'
import { relativePath } from '@/util/path-util'


const getMainRegex = (flags?: string) => new RegExp(/((?:int|void)\s*main\([\s\S]*?\)\s*{[ \t]*\n)((?:\s*\n)*)([ \t]*)(\S)/, flags)


/**
 * 添加数据文件
 *
 * @param projectRootDirectory  目标工程根目录
 * @param executeDirectory      执行命令时所在路径
 * @param absoluteSourcePath    源文件的绝对路径
 * @param absoluteDataPath      数据文件的绝对路径
 * @param definitionPhase       区分是否使用 CMakeLists.txt 的宏变量
 * @param content 源文件的内容
 */
export const handleData = async (projectRootDirectory: string,
                                 executeDirectory: string,
                                 absoluteSourcePath: string,
                                 absoluteDataPath: string,
                                 definitionPhase: string,
                                 content: string): Promise<string> => {

  // 如果文件不存在，新建文件
  if (!await isFile(absoluteDataPath)) {
    const relativeFilePath = relativePath(executeDirectory, absoluteDataPath, projectRootDirectory)
    await fs.createFile(relativeFilePath)
    logger.info(`create ${relativeFilePath}.`)
  }

  const mainRegex = getMainRegex()
  const sourceItem = partition(content)

  // 要使用 freopen 需要保证引用了 cstdio 包
  sourceItem.dependencies.push('cstdio')

  const relativeFilePath = relativePath(projectRootDirectory, absoluteDataPath)
  const relativeDataPath = relativePath(path.dirname(absoluteSourcePath), absoluteDataPath)
  const replacePhase = `$1#ifdef ${definitionPhase}`
    .concat(`\n$3freopen("${relativeFilePath}", "r", stdin);`)
    .concat('\n#else')
    .concat(`\n$3freopen("${relativeDataPath}", "r", stdin);`)
    .concat('\n#endif')
    .concat(`\n$2$3$4`)
  sourceItem.sources = sourceItem.sources
    .map(({ start, content }) => ({
      start,
      content: content.replace(mainRegex, replacePhase)
    }))

  return merge(sourceItem)
}
