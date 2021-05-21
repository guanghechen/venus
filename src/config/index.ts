import { DefaultCleanConfig } from '@/config/clean'
import { isFile } from '@/util/fs-util'
import fs from 'fs-extra'
import yaml from 'js-yaml'
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
const localRawConfig = yaml.load(localConfigContent) as RawPartialConfig

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

/**
 * 获取子命令 'register' 的默认选项
 */
export const getDefaultRegisterConfig = (
  partialRawConfig?: RawDefaultRegisterConfig,
): DefaultRegisterConfig => {
  const { register } = localRawConfig
  return new DefaultRegisterConfig(register, partialRawConfig)
}

/**
 * 获取子命令 'remove' 的默认选项
 */
export const getDefaultRemoveConfig = (
  partialRawConfig?: RawDefaultRemoveConfig,
): DefaultRemoveConfig => {
  const { remove } = localRawConfig
  return new DefaultRemoveConfig(remove, partialRawConfig)
}

/**
 * 获取子命令 'clean' 的默认选项
 */
export const getDefaultCleanConfig = (
  partialRawConfig?: RawDefaultCleanConfig,
): DefaultCleanConfig => {
  const { clean } = localRawConfig
  return new DefaultCleanConfig(clean, partialRawConfig)
}
