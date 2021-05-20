import { DefaultCleanConfig } from '@/config/clean'
import { isFile } from '@/util/fs-util'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import _ from 'lodash'
import path from 'path'
import type { RawDefaultCleanConfig } from '@/config/clean'
import { DefaultCreateConfig } from './create'
import { DefaultGenerateConfig } from './generate'
import { DefaultRegisterConfig } from './register'
import { DefaultRemoveConfig } from './remove'
import type { RawDefaultCreateConfig } from './create'
import type { RawDefaultGenerateConfig } from './generate'
import type { RawDefaultRegisterConfig } from './register'
import type { RawDefaultRemoveConfig } from './remove'

const absoluteLocaleConfigPath = path.join(__dirname, 'config.yml')
const localConfigContent = fs.readFileSync(absoluteLocaleConfigPath, 'utf-8')
const localRawConfig = yaml.safeLoad(localConfigContent)

/**
 * 配置文件的类型
 */
export interface RawPartialConfig {
  generate: RawDefaultGenerateConfig
  create: RawDefaultCreateConfig
  register: RawDefaultRegisterConfig
  remove: RawDefaultRemoveConfig
  clean: RawDefaultCleanConfig
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
  if (await isFile(absoluteConfigPath)) {
    const configContent = fs.readFileSync(absoluteConfigPath, 'utf-8')
    return yaml.safeLoad(configContent)
  }
}

/**
 * 获取子命令 'generate' 的默认选项
 */
export const getDefaultGenerateConfig = (
  partialRawConfig?: RawDefaultGenerateConfig,
): DefaultGenerateConfig => {
  const rawConfig = _.cloneDeep(localRawConfig)
  return new DefaultGenerateConfig(rawConfig.generate, partialRawConfig)
}

/**
 * 获取子命令 'create/new' 的默认选项
 */
export const getDefaultCreateConfig = (
  partialRawConfig?: RawDefaultCreateConfig,
): DefaultCreateConfig => {
  const rawConfig = _.cloneDeep(localRawConfig)
  return new DefaultCreateConfig(rawConfig.create, partialRawConfig)
}

/**
 * 获取子命令 'register' 的默认选项
 */
export const getDefaultRegisterConfig = (
  partialRawConfig?: RawDefaultRegisterConfig,
): DefaultRegisterConfig => {
  const rawConfig = _.cloneDeep(localRawConfig)
  return new DefaultRegisterConfig(rawConfig.register, partialRawConfig)
}

/**
 * 获取子命令 'remove' 的默认选项
 */
export const getDefaultRemoveConfig = (
  partialRawConfig?: RawDefaultRemoveConfig,
): DefaultRemoveConfig => {
  const rawConfig = _.cloneDeep(localRawConfig)
  return new DefaultRemoveConfig(rawConfig.remove, partialRawConfig)
}

/**
 * 获取子命令 'clean' 的默认选项
 */
export const getDefaultCleanConfig = (
  partialRawConfig?: RawDefaultCleanConfig,
): DefaultCleanConfig => {
  const rawConfig = _.cloneDeep(localRawConfig)
  return new DefaultCleanConfig(rawConfig.clean, partialRawConfig)
}
