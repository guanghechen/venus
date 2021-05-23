import logger from '../../../env/logger'
import { copy } from '../../../util/copy-paste'

/**
 * Copy contents into system clipboard.
 * @param content
 */
async function handleCopy(content: string): Promise<void> {
  try {
    await copy(content)
    logger.info(`Copied to system clipboard.`)
  } catch (error) {
    logger.debug(error)
    logger.fatal(`Copied failed.`)
  }
}

export default handleCopy
