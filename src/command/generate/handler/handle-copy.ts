import copyPaste from 'copy-paste'
import { logger } from '@/util/logger'


// 将内容复制到系统剪切板
export const handleCopy = async (content: string): Promise<void> => {
  try {
    await new Promise(resolve => copyPaste.copy(content, resolve))
    logger.info(`copied to system clipboard.`)
  } catch (error) {
    logger.debug('error:', error)
    logger.fatal(`copied failed.`)
  }
}
