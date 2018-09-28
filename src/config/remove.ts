import { coverBoolean } from '@/util/option-util'


/**
 * 配置文件的参数名
 *
 * @member recursive        => recursive
 * @member force            => force
 */
export interface RawDefaultRemoveConfig {
  readonly recursive: boolean
  readonly force: boolean
}


/**
 * 子命令 'remove' 的默认选项
 *
 */
export class DefaultRemoveConfig {
  public readonly recursive: boolean
  public readonly force: boolean

  public constructor(rawConfig: RawDefaultRemoveConfig, partialRawConfig?: RawDefaultRemoveConfig) {
    const { recursive, force } = rawConfig
    const { recursive: pRecursive, force: pForce } = partialRawConfig || {} as RawDefaultRemoveConfig
    this.recursive = coverBoolean(recursive, pRecursive)
    this.force = coverBoolean(force, pForce)
  }
}
