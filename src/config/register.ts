import { coverBoolean } from '@guanghechen/option-helper'

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

  constructor(
    rawConfig: Readonly<RawDefaultRegisterConfig>,
    partialRawConfig?: RawDefaultRegisterConfig,
  ) {
    const { recursive } = rawConfig
    const { recursive: pRecursive } = partialRawConfig ?? {}
    this.recursive = coverBoolean(recursive, pRecursive)
  }
}
