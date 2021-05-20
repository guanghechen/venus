import { copy as realCopy, paste as realPaste } from 'mini-copy'
import { logger } from './logger'

export const copy = async (content: string): Promise<void> =>
  realCopy(content, { logger: logger as any })
export const paste = async (): Promise<string> =>
  realPaste({ logger: logger as any })
