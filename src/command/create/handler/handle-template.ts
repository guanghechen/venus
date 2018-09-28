import fs from 'fs-extra'
import { ensureFileExist } from '@/util/fs-util'


export const handleTemplate = async (filepath: string, encoding: string): Promise<string> => {
  await ensureFileExist(filepath)
  return await fs.readFile(filepath, { encoding })
}
