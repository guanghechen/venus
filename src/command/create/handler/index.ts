import { yesOrNo } from '@/util/cli'
import { logger } from '@/util/logger'
import { relativePath } from '@/util/path'
import { coverBoolean, coverString } from '@guanghechen/option-helper'
import fs from 'fs-extra'
import path from 'path'
import type { GlobalConfig } from '@/command'
import type { DefaultCreateConfig } from '@/config/create'
import { handleData } from './handle-data'
import { handleTemplate } from './handle-template'

interface CreateArgument {
  readonly absoluteSourcePath: string
}

interface CreateOption {
  readonly template?: boolean
  readonly templatePath?: string
  readonly data?: boolean
  readonly dataPath?: string
}

export interface CreateConfig {
  readonly absoluteSourcePath: string
  readonly template: {
    readonly active: boolean
    readonly encoding: string
    readonly filepath: string
  }
  readonly data: {
    readonly active: boolean
    readonly encoding: string
    readonly filename: string
  }
}

export class CreateHandler {
  private readonly config: Promise<CreateConfig>
  private readonly resolvedGlobalConfig: GlobalConfig

  constructor(
    argument: CreateArgument,
    option: CreateOption,
    resolvedGlobalConfig: GlobalConfig,
    defaultConfig: DefaultCreateConfig,
  ) {
    this.resolvedGlobalConfig = resolvedGlobalConfig
    this.config = this.preprocess(argument, option, defaultConfig)
  }

  public async handle(): Promise<void> {
    const {
      executeDirectory,
      projectRootDirectory,
      definitionPhase,
      encoding,
    } = this.resolvedGlobalConfig
    const resolvedConfig = await this.config

    const absoluteSourcePath = resolvedConfig.absoluteSourcePath
    const relativeSourcePath = relativePath(
      executeDirectory,
      absoluteSourcePath,
      projectRootDirectory,
    )

    // 确保源文件不存在
    if (fs.existsSync(absoluteSourcePath)) {
      const confirm: boolean = await yesOrNo(`overwrite ${relativeSourcePath}`)
      if (!confirm) return
    }

    let content = ''

    // 获取模板
    if (resolvedConfig.template.active) {
      content = await handleTemplate(
        resolvedConfig.template.filepath,
        resolvedConfig.template.encoding,
      )
    }

    // 插入数据
    if (resolvedConfig.data.active) {
      const prefix = path.parse(absoluteSourcePath).name.split('-')[0]
      const absoluteDataPath = path.resolve(
        path.dirname(absoluteSourcePath),
        `${prefix}-${resolvedConfig.data.filename}`,
      )
      content = await handleData(
        projectRootDirectory,
        executeDirectory,
        absoluteSourcePath,
        absoluteDataPath,
        definitionPhase,
        content,
      )
    }

    // 写入文件
    await fs.writeFile(absoluteSourcePath, content, encoding)
    logger.info(`written into ${relativeSourcePath}.`)
  }

  /**
   * 预处理，通过命令的参数、选项、默认配置得到最终需要的配置
   *
   * @param argument        命令的参数
   * @param option          命令的选项
   * @param defaultConfig   默认配置
   */
  private async preprocess(
    argument: CreateArgument,
    option: CreateOption,
    defaultConfig: DefaultCreateConfig,
  ): Promise<CreateConfig> {
    const { projectRootDirectory } = this.resolvedGlobalConfig
    return {
      absoluteSourcePath: argument.absoluteSourcePath,
      template: {
        active: coverBoolean(defaultConfig.template.active, option.template),
        filepath: path.resolve(
          projectRootDirectory,
          coverString(defaultConfig.template.filename, option.templatePath),
        ),
        encoding: defaultConfig.template.encoding,
      },
      data: {
        active: coverBoolean(defaultConfig.data.active, option.data),
        filename: path.relative(
          projectRootDirectory,
          path.resolve(
            projectRootDirectory,
            coverString(defaultConfig.data.filename, option.dataPath),
          ),
        ),
        encoding: defaultConfig.data.encoding,
      },
    }
  }
}
