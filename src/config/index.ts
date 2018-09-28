import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { isFile } from '@/util/fs-util'


const absoluteLocaleConfigPath = path.join(__dirname, 'config.yml')
const localConfigContent = fs.readFileSync(absoluteLocaleConfigPath, 'utf-8')
const localRawConfig = yaml.safeLoad(localConfigContent)


/**
 * 配置文件的类型
 */
export interface RawPartialConfig {
}


/**
 * 获取外部的配置文件
 *
 * @param projectDirectory
 * @param configPath
 */
export const getPartialRawConfig = async (projectDirectory: string, configPath?: string): Promise<RawPartialConfig|undefined> => {
  const absoluteConfigPath = path.resolve(projectDirectory, configPath != null? configPath: 'venus.config.yml')
  if (await isFile(absoluteConfigPath)) {
    const configContent = fs.readFileSync(absoluteConfigPath, 'utf-8')
    return yaml.safeLoad(configContent)
  }
}
