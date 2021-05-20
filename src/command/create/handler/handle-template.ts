import { ensureFileExist } from '@/util/fs-util'
import fs from 'fs-extra'

export const handleTemplate = async (
  filepath: string,
  encoding: string,
): Promise<string> => {
  await ensureFileExist(filepath)
  return await fs.readFile(filepath, { encoding })
}
