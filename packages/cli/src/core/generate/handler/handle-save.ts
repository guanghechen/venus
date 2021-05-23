import fs from 'fs-extra'
import logger from '../../../env/logger'
import { yesOrNo } from '../../../util/cli'
import { isExists } from '../../../util/fs'
import { relativePath } from '../../../util/path'
import type { GenerateContext } from '../context'

/**
 * Save the contents into an external file.
 *
 * @param resolvedConfig
 * @param content
 */
async function handleSave(
  context: GenerateContext,
  content: string,
): Promise<void> {
  const { cwd, workspace, encoding, outputFilepath } = context

  if (outputFilepath == null) return

  // Use relative path for a friendly hint.
  const relativeOutputPath = relativePath(outputFilepath, cwd, workspace)

  if (!context.force && isExists(outputFilepath)) {
    const confirm: boolean = await yesOrNo(`overwrite ${relativeOutputPath}`)
    if (!confirm) return
  }

  await fs.writeFile(outputFilepath, content, encoding)
  logger.info(`written into ${relativeOutputPath}.`)
}

export default handleSave
