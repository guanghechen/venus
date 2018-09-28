import fs from 'fs-extra'
import path from 'path'
import { logger } from '@/util/logger'
import { yesOrNo } from '@/util/cli-util'
import { GlobalConfig } from '@/command'
import { GenerateConfig } from './index'


// 将内容复制到输出到文件
export const handleSave = async (globalConfig: GlobalConfig,
                                 resolvedConfig: GenerateConfig,
                                 content: string): Promise<void> => {
  const { executeDirectory, projectRootDirectory, encoding } = globalConfig

  // 相对于执行命令所在的路径的相对路径，用于友好的提示
  const relativeOutputPath = executeDirectory.startsWith(projectRootDirectory)
    ? path.relative(executeDirectory, resolvedConfig.absoluteOutputPath)
    : resolvedConfig.absoluteOutputPath

  if (fs.existsSync(resolvedConfig.absoluteOutputPath!) && !resolvedConfig.force) {
    let confirm: boolean = await yesOrNo(`overwrite ${relativeOutputPath}`)
    if (!confirm) return
  }
  await fs.writeFile(resolvedConfig.absoluteOutputPath, content, encoding)
  logger.info(`written into ${relativeOutputPath}.`)
}
