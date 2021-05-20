import { yesOrNo } from '@/util/cli-util'
import { clean } from '@/util/cmakelists-handler/clean'
import {
  collectFiles,
  ensureDirectoryExist,
  ensureFileExist,
} from '@/util/fs-util'
import { logger } from '@/util/logger'
import { relativePath } from '@/util/path-util'
import { coverBoolean, coverString } from '@guanghechen/option-helper'
import fs from 'fs-extra'
import _ from 'lodash'
import type { GlobalConfig } from '@/command'
import type { DefaultCleanConfig } from '@/config/clean'

interface CleanArgument {
  directory?: string
}

interface CleanOption {
  readonly force?: boolean
  readonly recursive?: boolean
  readonly pattern?: string[]
}

export interface CleanConfig {
  readonly force: boolean
  readonly recursive: boolean
  readonly cleanDirectory: string
  readonly patterns: string[]
}

export class CleanHandler {
  private readonly config: Promise<CleanConfig>
  private readonly resolvedGlobalConfig: GlobalConfig

  constructor(
    argument: CleanArgument,
    option: CleanOption,
    resolvedGlobalConfig: GlobalConfig,
    defaultConfig: DefaultCleanConfig,
  ) {
    this.resolvedGlobalConfig = resolvedGlobalConfig
    this.config = this.preprocess(argument, option, defaultConfig)
  }

  public async handle(): Promise<void> {
    const { executeDirectory, projectRootDirectory, cmakeLists } =
      this.resolvedGlobalConfig
    const resolvedConfig = await this.config
    const relativeSourcePath = relativePath(
      executeDirectory,
      resolvedConfig.cleanDirectory,
      projectRootDirectory,
    )

    // 确保文件夹存在
    await ensureDirectoryExist(
      resolvedConfig.cleanDirectory,
      `${relativeSourcePath} is not found.`,
    )

    const absoluteSourcePaths = await collectFiles(
      resolvedConfig.cleanDirectory,
      resolvedConfig.recursive,
      resolvedConfig.patterns,
    )
    for (const file of absoluteSourcePaths)
      await this.doRemove(file, resolvedConfig.force)

    // 如果文件夹中已经不存在文件了，则删除文件夹
    const files = await collectFiles(
      resolvedConfig.cleanDirectory,
      resolvedConfig.recursive,
    )
    if (files.length <= 0) {
      await fs.remove(resolvedConfig.cleanDirectory)
      logger.info(`removed ${relativeSourcePath}`)
    }

    // 清空 CMakeLists.txt 中的无效的 add_executable
    await clean(cmakeLists.filepath, cmakeLists.encoding, projectRootDirectory)
  }

  /**
   * 删除源文件
   * @param absoluteSourcePath  源文件路径
   * @param force               暴力删除，无需经过用户同意
   */
  private async doRemove(
    absoluteSourcePath: string,
    force: boolean,
  ): Promise<void> {
    const { projectRootDirectory, executeDirectory } = this.resolvedGlobalConfig

    // 相对于执行命令所在的路径的相对路径，用于友好的提示
    const relativeSourcePath = relativePath(
      executeDirectory,
      absoluteSourcePath,
      projectRootDirectory,
    )

    // 确保待删除的源文件存在
    await ensureFileExist(
      absoluteSourcePath,
      `${relativeSourcePath} is not found.`,
    )
    if (!force) {
      const confirm: boolean = await yesOrNo(`remove ${relativeSourcePath}`)
      if (!confirm) return
    }

    // 将源文件删除
    await fs.unlink(absoluteSourcePath)
    logger.info(`removed ${relativeSourcePath}`)
  }

  /**
   * 预处理，通过命令的参数、选项、默认配置得到最终需要的配置
   *
   * @param argument        命令的参数
   * @param option          命令的选项
   * @param defaultConfig   默认配置
   */
  private async preprocess(
    argument: CleanArgument,
    option: CleanOption,
    defaultConfig: DefaultCleanConfig,
  ): Promise<CleanConfig> {
    return {
      force: coverBoolean(defaultConfig.force, option.force),
      recursive: coverBoolean(defaultConfig.recursive, option.recursive),
      cleanDirectory: coverString(
        this.resolvedGlobalConfig.executeDirectory,
        argument.directory,
      ),
      patterns: [
        ...defaultConfig.patterns,
        ...(_.isArray(option.pattern) ? option.pattern : []),
      ],
    }
  }
}
