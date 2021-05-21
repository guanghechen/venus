import { handleRemoveAsserts } from '@/command/generate/handler/handle-remove-asserts'
import { resolveLocalDependencyPath } from '@/util/cmakelists-handler/dependency'
import { ensureFileExists } from '@/util/fs-util'
import { resolveDependencies } from '@/util/source-handler/dependency'
import { coverBoolean } from '@guanghechen/option-helper'
import fs from 'fs-extra'
import path from 'path'
import type { GlobalConfig } from '@/command'
import type { DefaultGenerateConfig } from '@/config/generate'
import { handleCopy } from './handle-copy'
import { handleRemoveComments } from './handle-remove-comments'
import { handleRemoveDefinition } from './handle-remove-definitions'
import { handleRemoveFreopen } from './handle-remove-freopens'
import { handleRemoveSpaces } from './handle-remove-spaces'
import { handleSave } from './handle-save'

interface GenerateArgument {
  readonly sourcePath: string
  readonly targetPath?: string
}

interface GenerateOption {
  readonly removeComments?: boolean
  readonly removeSpaces?: boolean
  readonly removeFreopen?: boolean
  readonly removeAssert?: boolean
  readonly uglify?: boolean
  readonly force?: boolean
  readonly copy?: boolean
  readonly outputDirectory?: string
}

export interface GenerateConfig {
  readonly removeComments: boolean
  readonly removeSpaces: boolean
  readonly removeFreopen: boolean
  readonly removeAssert: boolean
  readonly force: boolean
  readonly copy: boolean
  readonly absoluteSourcePath: string
  readonly absoluteOutputPath: string
}

export class GenerateHandler {
  private readonly config: Promise<GenerateConfig>
  private readonly resolvedGlobalConfig: GlobalConfig

  constructor(
    argument: GenerateArgument,
    option: GenerateOption,
    resolvedGlobalConfig: GlobalConfig,
    defaultConfig: DefaultGenerateConfig,
  ) {
    this.resolvedGlobalConfig = resolvedGlobalConfig
    this.config = this.preprocess(argument, option, defaultConfig)
  }

  public async handle(): Promise<void> {
    const { projectRootDirectory, cmakeLists, encoding } =
      this.resolvedGlobalConfig
    const resolvedConfig = await this.config

    let content: string

    // 解决依赖
    const cmakeListsContent = await fs.readFile(cmakeLists.filepath, {
      encoding,
    })
    content = await resolveDependencies(
      (dependencies: string[], absoluteSourcePath: string) => {
        return resolveLocalDependencyPath(
          dependencies,
          absoluteSourcePath,
          cmakeListsContent,
          projectRootDirectory,
        )
      },
      resolvedConfig.absoluteSourcePath,
      encoding,
    )

    // 移除 freopen
    if (resolvedConfig.removeFreopen) {
      content = handleRemoveFreopen(content)
      content = handleRemoveDefinition(content)
    }

    // 移除 assert
    if (resolvedConfig.removeAssert) {
      content = handleRemoveAsserts(content)
    }

    // 压缩
    if (resolvedConfig.removeComments) content = handleRemoveComments(content)
    if (resolvedConfig.removeSpaces) content = handleRemoveSpaces(content)
    else content = content.trim().concat('\n')

    // 复制到系统剪切板
    if (resolvedConfig.copy) {
      await handleCopy(content)
      return
    }

    // 输出到文件
    await handleSave(this.resolvedGlobalConfig, resolvedConfig, content)
  }

  /**
   * 预处理，通过命令的参数、选项、默认配置得到最终需要的配置
   *
   * @param argument        命令的参数
   * @param option          命令的选项
   * @param defaultConfig   默认配置
   */
  private async preprocess(
    argument: GenerateArgument,
    option: GenerateOption,
    defaultConfig: DefaultGenerateConfig,
  ): Promise<GenerateConfig> {
    const { projectRootDirectory, executeDirectory } = this.resolvedGlobalConfig
    const absoluteSourcePath = path.resolve(
      executeDirectory,
      argument.sourcePath,
    )

    // 确保源文件是否存在
    ensureFileExists(absoluteSourcePath)

    const config: GenerateConfig = {
      removeComments:
        coverBoolean(defaultConfig.removeComments, option.removeComments) ||
        !!option.uglify,
      removeSpaces:
        coverBoolean(defaultConfig.removeSpaces, option.removeSpaces) ||
        !!option.uglify,
      removeFreopen: coverBoolean(
        defaultConfig.removeFreopen,
        option.removeFreopen,
      ),
      removeAssert: coverBoolean(
        defaultConfig.removeAssert,
        option.removeAssert,
      ),
      force: coverBoolean(defaultConfig.force, option.force),
      copy: coverBoolean(defaultConfig.copy, option.copy),
      absoluteSourcePath,
      absoluteOutputPath: '',
    }

    if (config.copy) return config

    // 如果指定了 outputDirectory，则以项目的根目录为参考路径；否则以执行命令所在的路径为参考路径
    const outputDirectory: string = option.outputDirectory
      ? path.resolve(projectRootDirectory, option.outputDirectory)
      : path.resolve(executeDirectory)

    // 添加文件
    let { targetPath } = argument
    const { dir, base, ext } = path.parse(absoluteSourcePath)
    if (!targetPath) targetPath = path.resolve(dir, '_venus_' + base)

    // 保证后缀名和源文件一致
    if (!targetPath.endsWith(ext)) targetPath += ext

    const absoluteOutputPath = path.resolve(outputDirectory, targetPath)
    return { ...config, absoluteOutputPath }
  }
}
