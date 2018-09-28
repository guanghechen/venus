import { coverBoolean } from '@/util/option-util'


/**
 * 配置文件的参数名
 *
 * @member recursive        => recursive
 */
export interface RawDefaultRegisterConfig {
  readonly recursive: boolean
}


/**
 * 子命令 'register' 的默认选项
 *
 */
export class DefaultRegisterConfig {
  public readonly recursive: boolean

  public constructor(rawConfig: RawDefaultRegisterConfig, partialRawConfig?: RawDefaultRegisterConfig) {
    const { recursive } = rawConfig
    const { recursive: pRecursive } = partialRawConfig || {} as RawDefaultRegisterConfig
    this.recursive = coverBoolean(recursive, pRecursive)
  }
}
