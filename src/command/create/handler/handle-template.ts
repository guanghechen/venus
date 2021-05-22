import { ensureFileExists } from '@/util/fs'
import fs from 'fs-extra'

export const handleTemplate = async (
  filepath: string,
  encoding: string,
): Promise<string> => {
  ensureFileExists(filepath)
  return await fs.readFile(filepath, { encoding })
}
