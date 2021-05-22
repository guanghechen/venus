import { yesOrNo } from '@/util/cli'
import { isExists } from '@/util/fs'
import { logger } from '@/util/logger'
import { relativePath } from '@/util/path'
import fs from 'fs-extra'
import type { GlobalConfig } from '@/command'
import type { GenerateConfig } from './types'

/**
 * Save the contents into an external file.
 *
 * @param globalConfig
 * @param resolvedConfig
 * @param content
 */
async function handleSave(
  globalConfig: GlobalConfig,
  resolvedConfig: GenerateConfig,
  content: string,
): Promise<void> {
  if (resolvedConfig.absoluteOutputPath == null) return
  const { executeDirectory, projectRootDirectory, encoding } = globalConfig

  // Use relative path for a friendly hint.
  const relativeOutputPath = relativePath(
    resolvedConfig.absoluteOutputPath,
    executeDirectory,
    projectRootDirectory,
  )

  if (!resolvedConfig.force && isExists(resolvedConfig.absoluteOutputPath)) {
    const confirm: boolean = await yesOrNo(`overwrite ${relativeOutputPath}`)
    if (!confirm) return
  }

  await fs.writeFile(resolvedConfig.absoluteOutputPath, content, encoding)
  logger.info(`written into ${relativeOutputPath}.`)
}

export default handleSave
