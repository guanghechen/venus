import fs from 'fs-extra'
import { DefaultRemoveConfig } from '@/config/remove'
import { collectFiles, ensureExist, ensureFileExist, isDirectory, isFile } from '@/util/fs-util'
import { coverBoolean } from '@/util/option-util'
import { remove } from '@/util/cmakelists-handler/remove'
import { logger } from '@/util/logger'
import { yesOrNo } from '@/util/cli-util'
import { relativePath } from '@/util/path-util'
import { GlobalConfig } from '@/command'


interface RemoveArgument {
  readonly absoluteSourcePath: string
}


interface RemoveOption {
  readonly recursive?: boolean
  readonly force?: boolean
}


export interface RemoveConfig {
  readonly absoluteSourcePath: string
  readonly recursive: boolean
  readonly force: boolean
}


export class RemoveHandler {
  private readonly config: Promise<RemoveConfig>
  private readonly resolvedGlobalConfig: GlobalConfig

  constructor(argument: RemoveArgument,
              option: RemoveOption,
              resolvedGlobalConfig: GlobalConfig,
              defaultConfig: DefaultRemoveConfig) {
    this.resolvedGlobalConfig = resolvedGlobalConfig
    this.config = this.preprocess(argument, option, defaultConfig)
  }

  public async handle() {
    const { executeDirectory, projectRootDirectory } = this.resolvedGlobalConfig
    const resolvedConfig = await this.config

    const { absoluteSourcePath } = resolvedConfig
    const relativeSourcePath = relativePath(executeDirectory, absoluteSourcePath, projectRootDirectory)

    // 确保路径存在
    await ensureExist(absoluteSourcePath, false, false, `${relativeSourcePath} is not found.`)

    // 如果是文件，则直接对其执行操作
    if (await isFile(absoluteSourcePath)) {
      await this.doRemove(absoluteSourcePath, resolvedConfig.force)
      return
    }

    // 如果是文件夹，则对该文件夹下的所有文件执行操作
    if (await isDirectory(absoluteSourcePath)) {
      const absoluteSourcePaths = await collectFiles(absoluteSourcePath, resolvedConfig.recursive)
      for (let file of absoluteSourcePaths) await this.doRemove(file, resolvedConfig.force)

      // 如果文件夹中已经不存在文件了，则删除文件夹
      let files = await collectFiles(absoluteSourcePath, resolvedConfig.recursive)
      if (files.length <= 0) {
        await fs.remove(absoluteSourcePath)
        logger.info(`removed ${relativeSourcePath}`)
      }
      return
    }
  }

  /**
   * 删除源文件
   * @param absoluteSourcePath  源文件路径
   * @param force               暴力删除，无需经过用户同意
   */
  private async doRemove(absoluteSourcePath: string, force: boolean) {
    const { projectRootDirectory, executeDirectory, cmakeLists } = this.resolvedGlobalConfig
    const relativeCMakeListsPath = relativePath(projectRootDirectory, cmakeLists.filepath)

    // 相对于执行命令所在的路径的相对路径，用于友好的提示
    const relativeSourcePath = relativePath(executeDirectory, absoluteSourcePath, projectRootDirectory)

    // 确保待删除的源文件存在
    await ensureFileExist(absoluteSourcePath, `${relativeSourcePath} is not found.`)
    if (!force) {
      let confirm: boolean = await yesOrNo(`remove ${relativeSourcePath}`)
      if (!confirm) return
    }

    // 将源文件删除
    await fs.unlink(absoluteSourcePath)
    logger.info(`removed ${relativeSourcePath}`)

    // 从 CmakeLists.txt 中删除
    await remove(cmakeLists.filepath, cmakeLists.encoding, executeDirectory, projectRootDirectory, absoluteSourcePath)
  }

  /**
   * 预处理，通过命令的参数、选项、默认配置得到最终需要的配置
   *
   * @param argument        命令的参数
   * @param option          命令的选项
   * @param defaultConfig   默认配置
   */
  private async preprocess(argument: RemoveArgument,
                           option: RemoveOption,
                           defaultConfig: DefaultRemoveConfig): Promise<RemoveConfig> {
    return {
      absoluteSourcePath: argument.absoluteSourcePath,
      recursive: coverBoolean(defaultConfig.recursive, option.recursive),
      force: coverBoolean(defaultConfig.force, option.force),
    }
  }
}
