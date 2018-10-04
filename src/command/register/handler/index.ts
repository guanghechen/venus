import path from 'path'
import { collectFiles, ensureExist, isDirectory, isFile } from '@/util/fs-util'
import { coverBoolean } from '@/util/option-util'
import { register } from '@/util/cmakelists-handler/register'
import { DefaultRegisterConfig } from '@/config/register'
import { GlobalConfig } from '@/command'


interface RegisterArgument {
  readonly absoluteSourcePath: string
}


interface RegisterOption {
  readonly recursive?: boolean
}


export interface RegisterConfig {
  readonly absoluteSourcePath: string
  readonly recursive: boolean
}


export class RegisterHandler {
  private readonly config: Promise<RegisterConfig>
  private readonly resolvedGlobalConfig: GlobalConfig

  constructor(argument: RegisterArgument,
              option: RegisterOption,
              resolvedGlobalConfig: GlobalConfig,
              defaultConfig: DefaultRegisterConfig) {
    this.resolvedGlobalConfig = resolvedGlobalConfig
    this.config = this.preprocess(argument, option, defaultConfig)
  }

  public async handle() {
    const { executeDirectory, projectRootDirectory, cmakeLists, encoding } = this.resolvedGlobalConfig
    const resolvedConfig = await this.config

    const absoluteSourcePath = resolvedConfig.absoluteSourcePath
    const relativeSourcePath = executeDirectory.startsWith(projectRootDirectory)
      ? path.relative(executeDirectory, absoluteSourcePath)
      : absoluteSourcePath

    // 确保路径存在
    await ensureExist(absoluteSourcePath, false, false, `${relativeSourcePath} is not found.`)

    // 如果是文件，则直接对其执行操作
    if (await isFile(absoluteSourcePath)) {
      // 注册进 CmakeLists.txt 中
      await this.doRegister(absoluteSourcePath)
      return
    }

    // 如果是文件夹，则对该文件夹下的所有文件执行操作
    if (await isDirectory(absoluteSourcePath)) {
      const absoluteSourcePaths = await collectFiles(absoluteSourcePath, resolvedConfig.recursive)
      for (let file of absoluteSourcePaths) await this.doRegister(file)
      return
    }
  }

  /**
   * 注册源文件
   * @param absoluteSourcePath  源文件路径
   */
  private async doRegister(absoluteSourcePath: string) {
    // 如果后缀名不会 '.cpp' 或 '.c' 则直接无视
    if (path.extname(absoluteSourcePath) !== '.cpp' || path.extname(absoluteSourcePath) !== '.c') return
    const { projectRootDirectory, executeDirectory, cmakeLists } = this.resolvedGlobalConfig
    await register(cmakeLists.filepath, cmakeLists.encoding, executeDirectory, projectRootDirectory, absoluteSourcePath)
  }

  /**
   * 预处理，通过命令的参数、选项、默认配置得到最终需要的配置
   *
   * @param argument        命令的参数
   * @param option          命令的选项
   * @param defaultConfig   默认配置
   */
  private async preprocess(argument: RegisterArgument,
                           option: RegisterOption,
                           defaultConfig: DefaultRegisterConfig): Promise<RegisterConfig> {
    return {
      absoluteSourcePath: argument.absoluteSourcePath,
      recursive: coverBoolean(defaultConfig.recursive, option.recursive),
    }
  }
}
