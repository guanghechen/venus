import { resolveLocalDependencyPath } from '@/util/cmakelists-handler/dependency'
import { ensureFileExists } from '@/util/fs'
import { resolveDependencies } from '@/util/source-handler/dependency'
import {
  coverBoolean,
  coverString,
  isNonBlankString,
} from '@guanghechen/option-helper'
import fs from 'fs-extra'
import path from 'path'
import type { GlobalConfig } from '@/command'
import type { DefaultGenerateConfig } from '@/config/generate'
import handleCopy from './handle-copy'
import handleRemoveAsserts from './handle-remove-asserts'
import handleRemoveComments from './handle-remove-comments'
import handleRemoveDefinition from './handle-remove-definitions'
import handleRemoveFreopen from './handle-remove-freopens'
import handleRemoveSpaces from './handle-remove-spaces'
import handleSave from './handle-save'
import type { GenerateArgument, GenerateConfig, GenerateOption } from './types'

export class GenerateHandler {
  private readonly config: GenerateConfig
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
    const resolvedConfig = this.config
    const { projectRootDirectory, cmakeLists, encoding } =
      this.resolvedGlobalConfig

    let content: string

    // Resolve dependencies.
    const cmakeListsContent = await fs.readFile(cmakeLists.filepath, encoding)
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

    // Remove freopen statements.
    if (resolvedConfig.removeFreopen) {
      content = handleRemoveFreopen(content)
      content = handleRemoveDefinition(content)
    }

    // Remove assert statements.
    if (resolvedConfig.removeAssert) {
      content = handleRemoveAsserts(content)
    }

    // Uglify / Compress.
    if (resolvedConfig.removeComments) content = handleRemoveComments(content)
    if (resolvedConfig.removeSpaces) content = handleRemoveSpaces(content)
    else content = content.trim().concat('\n')

    // Copy into system clipboard.
    if (resolvedConfig.copy) {
      await handleCopy(content)
    }

    // Save to external file.
    if (resolvedConfig.absoluteOutputPath != null) {
      await handleSave(this.resolvedGlobalConfig, resolvedConfig, content)
    }
  }

  /**
   * Preprocess options.
   *
   * @param argument        props from command line
   * @param option          props from program options
   * @param defaultConfig   props from default config
   */
  protected preprocess(
    argument: GenerateArgument,
    option: GenerateOption,
    defaultConfig: DefaultGenerateConfig,
  ): GenerateConfig {
    const { projectRootDirectory, executeDirectory } = this.resolvedGlobalConfig
    const absoluteSourcePath = path.resolve(
      executeDirectory,
      argument.sourcePath,
    )

    // Ensure the source filepath is existed.
    ensureFileExists(absoluteSourcePath)

    const uglify = coverBoolean(false, option.uglify)

    const config: GenerateConfig = {
      removeComments:
        uglify ||
        coverBoolean(defaultConfig.removeComments, option.removeComments),
      removeSpaces:
        uglify || coverBoolean(defaultConfig.removeSpaces, option.removeSpaces),
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
      absoluteOutputPath: null,
    }

    /**
     * If the `copy` option computed to `true`, and no outputDirectory specified
     * explicitly, then only the `copy to system clipboard` action will
     * be performed.
     */
    if (config.copy && option.outputDirectory == null) return config

    /**
     * If outputDirectory specified, then the root directory of the project will
     * used as a reference path, otherwise, the `cwd` will play this role.
     */
    const outputDirectory: string = option.outputDirectory
      ? path.resolve(projectRootDirectory, option.outputDirectory)
      : path.resolve(executeDirectory)

    const { dir, base, ext } = path.parse(absoluteSourcePath)
    let targetPath = coverString(
      path.resolve(dir, '_venus_' + base),
      argument.targetPath,
      isNonBlankString,
    )

    // Ensure the extname of target file is same with the one of the source file.
    if (!targetPath.endsWith(ext)) targetPath += ext

    const absoluteOutputPath = path.resolve(outputDirectory, targetPath)
    return { ...config, absoluteOutputPath }
  }
}
