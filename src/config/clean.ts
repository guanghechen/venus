import { coverArray, coverBoolean } from '@guanghechen/option-helper'

/**
 * 配置文件的参数名
 *
 * @member force            => force
 * @member recursive        => recursive
 * @member patterns         => patterns
 */
export interface RawDefaultCleanConfig {
  readonly force: boolean
  readonly recursive: boolean
  readonly patterns: string[]
}

/**
 * 子命令 'clean' 的默认选项
 *
 */
export class DefaultCleanConfig {
  public readonly force: boolean
  public readonly recursive: boolean
  public readonly patterns: string[]

  constructor(
    rawConfig: RawDefaultCleanConfig,
    partialRawConfig?: RawDefaultCleanConfig,
  ) {
    const { force, recursive, patterns } = rawConfig
    const {
      force: pForce,
      recursive: pRecursive,
      patterns: pPatterns,
    } = partialRawConfig ?? {}
    this.force = coverBoolean(force, pForce)
    this.recursive = coverBoolean(recursive, pRecursive)
    this.patterns = coverArray(patterns, pPatterns)
  }
}
