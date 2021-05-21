import { getPartialRawConfig } from '@/config'
import { projectConfig } from '@/config/immutable'
import { ensureFileExists, findNearestTarget } from '@/util/fs-util'
import { logger } from '@/util/logger'
import { coverString } from '@guanghechen/option-helper'
import path from 'path'
import type { RawPartialConfig } from '@/config'
import loadCreateCommand from './create'
import loadGenerateCommand from './generate'
import type commander from 'commander'

export interface GlobalConfig {
  readonly executeDirectory: string
  readonly projectRootDirectory: string
  readonly definitionPhase: string
  readonly encoding: string
  readonly cmakeLists: {
    readonly encoding: string
    readonly filepath: string
  }
}

export default (program: commander.Command & any): void => {
  program
    .option(
      '--cmake-lists <cmakeLists-name>',
      'index cmakeLists name. (default is CMakeLists.txt)',
    )
    .option('--encoding <encoding>', 'index encoding of all files.')
    .option(
      '--config-path <config-path>',
      'index config path, related with the project root directory where the CMakeLists.txt exists.',
    )
    .option('--no-config', "don't use config.")

  // 挂载 generate 子命令
  loadGenerateCommand(program, getRawPartialConfig('generate'), getGlobalConfig)

  // 挂载 create/new 子命令
  loadCreateCommand(program, getRawPartialConfig('create'), getGlobalConfig)

  program.command('*').action(() => {
    logger.error('unknown command.')
    process.exit(-1)
  })

  /**
   * 获取外部配置文件
   * @param key
   */
  function getRawPartialConfig(
    key: 'generate' | 'create' | 'register' | 'remove' | 'clean',
  ): () => Promise<RawPartialConfig | any | undefined> {
    return async (
      specifiedProjectLocatedPath?: string,
    ): Promise<RawPartialConfig | any | undefined> => {
      const globalConfig: GlobalConfig = await getGlobalConfig(
        specifiedProjectLocatedPath,
      )
      if (program.config === false) return
      const partialRawConfig: RawPartialConfig | undefined =
        await getPartialRawConfig(
          globalConfig.projectRootDirectory,
          program.configPath,
        )
      if (partialRawConfig == null) return
      return partialRawConfig[key]
    }
  }

  /**
   * 生成全局选项
   *
   * @param specifiedProjectLocatedPath   该值为绝对路径时才生效，从指定的地方搜索 CMakeLists.txt
   */
  async function getGlobalConfig(
    specifiedProjectLocatedPath?: string,
  ): Promise<GlobalConfig> {
    const { definitionPhase, cmakeLists, encoding } = projectConfig
    const cmakeListsFileName = coverString(
      cmakeLists.filename,
      program.cmakeLists,
    )
    const cmakeListsEncoding = coverString(
      cmakeLists.encoding,
      program.encoding,
    )

    const executeDirectory = path.resolve()
    if (specifiedProjectLocatedPath != null)
      // eslint-disable-next-line no-param-reassign
      specifiedProjectLocatedPath = path.resolve(
        executeDirectory,
        specifiedProjectLocatedPath,
      )
    const absoluteCmakeListsPath =
      specifiedProjectLocatedPath != null
        ? await findNearestTarget(
            specifiedProjectLocatedPath,
            cmakeListsFileName,
          )
        : await findNearestTarget(executeDirectory, cmakeListsFileName)

    // 确保 CMakeLists.txt 存在
    ensureFileExists(
      absoluteCmakeListsPath,
      `'${cmakeListsFileName}' is not found.`,
    )

    const projectRootDirectory: string = path.dirname(absoluteCmakeListsPath!)
    return {
      executeDirectory,
      projectRootDirectory,
      definitionPhase,
      encoding,
      cmakeLists: {
        filepath: absoluteCmakeListsPath!,
        encoding: cmakeListsEncoding,
      },
    }
  }
}
