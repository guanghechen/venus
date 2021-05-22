import { isFile } from '@/util/fs'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'
import { DefaultCreateConfig } from './create'
import { DefaultGenerateConfig } from './generate'
import type { RawDefaultCreateConfig } from './create'
import type { RawDefaultGenerateConfig } from './generate'

const absoluteLocaleConfigPath = path.join(__dirname, 'config.yml')
const localConfigContent = fs.readFileSync(absoluteLocaleConfigPath, 'utf-8')
const localRawConfig = yaml.load(localConfigContent) as RawPartialConfig

/**
 * 配置文件的类型
 */
export interface RawPartialConfig {
  generate: RawDefaultGenerateConfig
  create: RawDefaultCreateConfig
}

/**
 * 获取外部的配置文件
 *
 * @param projectDirectory
 * @param configPath
 */
export const getPartialRawConfig = async (
  projectDirectory: string,
  configPath?: string,
): Promise<RawPartialConfig | undefined> => {
  const absoluteConfigPath = path.resolve(
    projectDirectory,
    configPath != null ? configPath : 'venus.config.yml',
  )
  if (isFile(absoluteConfigPath)) {
    const configContent = fs.readFileSync(absoluteConfigPath, 'utf-8')
    return yaml.load(configContent) as unknown as RawPartialConfig
  }
}

/**
 * 获取子命令 'generate' 的默认选项
 */
export const getDefaultGenerateConfig = (
  partialRawConfig?: RawDefaultGenerateConfig,
): DefaultGenerateConfig => {
  const { generate } = localRawConfig
  return new DefaultGenerateConfig(generate, partialRawConfig)
}

/**
 * 获取子命令 'create/new' 的默认选项
 */
export const getDefaultCreateConfig = (
  partialRawConfig?: RawDefaultCreateConfig,
): DefaultCreateConfig => {
  const { create } = localRawConfig
  return new DefaultCreateConfig(create, partialRawConfig)
}
