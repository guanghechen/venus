import { logger } from '@/util/logger'
import fs from 'fs-extra'
import minimatch from 'minimatch'
import path from 'path'

/**
 * 判断路径 p 是否为文件
 *
 * @param p   文件的路径
 * @return 路径 p 是否为文件
 */
export async function isFile(p: string | null): Promise<boolean> {
  if (p == null) return false
  if (!fs.existsSync(p)) return false
  const stat = await fs.stat(p)
  return stat.isFile()
}

/**
 * 判断路径 p 是否为文件夹
 *
 * @param p   文件的路径
 * @return 路径 p 是否为文件
 */
export async function isDirectory(p: string | null): Promise<boolean> {
  if (p == null) return false
  if (!fs.existsSync(p)) return false
  const stat = await fs.stat(p)
  return stat.isDirectory()
}

/**
 * 检查路径是否存在，若不存在则结束程序
 *
 * @param p               待检查的路径
 * @param checkDirectory  是否检查其是否为目录
 * @param checkFile       是否检查其是否为文件
 * @param message         提示信息
 */
export async function ensureExist(
  p: string | null,
  checkDirectory: boolean,
  checkFile: boolean,
  message?: string,
): Promise<void> {
  if (p == null) {
    logger.error(message == null ? 'the path is null.' : message)
    process.exit(-1)
  }
  if (!fs.existsSync(p!)) {
    logger.error(message == null ? `${p} is not found.` : message)
    process.exit(-1)
  }
  if (checkDirectory) {
    if (await isDirectory(p)) return
    logger.error(message == null ? `${p} is not a directory.` : message)
    process.exit(-1)
  }
  if (checkFile) {
    if (await isFile(p)) return
    logger.error(message == null ? `${p} is not a file.` : message)
    process.exit(-1)
  }
}

/**
 * 检查文件是否存在
 *
 * @param p
 * @param message
 * @see ensureExist(string, boolean, boolean, string)
 */
export const ensureFileExist = async (
  p: string | null,
  message?: string,
): Promise<void> => ensureExist(p, false, true, message)

/**
 * 检查文件夹是否存在
 *
 * @param p
 * @param message
 * @see ensureExist(string, boolean, boolean, string)
 */
export const ensureDirectoryExist = async (
  p: string | null,
  message?: string,
): Promise<void> => ensureExist(p, true, false, message)

/**
 * 找到最近包含目标文件的路径（不断往祖先目录回溯）
 *
 * @param p       搜索的路径
 * @param target  目标文件名
 */
export async function findNearestTarget(
  p: string,
  target: string,
): Promise<string | null> {
  if (!(await isDirectory(p)))
    throw new Error(`\`${p}\` isn't a valid directory.`)
  const absoluteTarget = path.resolve(p, target)
  if (fs.existsSync(absoluteTarget)) return absoluteTarget
  const parentDirectory = path.dirname(p)
  if (parentDirectory != p)
    return await findNearestTarget(parentDirectory, target)
  return null
}

/**
 * 收集某个目录下的文件
 *
 * @param p           目录路径
 * @param recursive   是否递归收集
 * @param patterns    匹配模式
 * @return 该目录下的路径列表
 */
export async function collectFiles(
  p: string,
  recursive: boolean,
  patterns?: string[],
): Promise<string[]> {
  const files = await fs.readdir(p)
  const result: string[] = []
  for (let file of files) {
    file = path.resolve(p, file)
    if (await isFile(file)) {
      // 需要满足特定的 pattern 的文件才将删除
      if (
        patterns == null ||
        patterns.some(pattern => minimatch(file, pattern, { matchBase: true }))
      )
        result.push(file)
    } else if (recursive && (await isDirectory(file))) {
      result.push(...(await collectFiles(file, recursive, patterns)))
    }
  }
  return result
}
