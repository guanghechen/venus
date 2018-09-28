import { coverBoolean } from '@/util/option-util'


/**
 * 配置文件的参数名
 *
 * @member remove-comments  => removeComments
 * @member remove-spaces    => removeSpaces
 * @member remove-freopen   => removeFreopen
 * @member force            => force
 * @member copy             => copy
 */
export interface RawDefaultGenerateConfig {
  readonly 'remove-comments': boolean,
  readonly 'remove-spaces': boolean,
  readonly 'remove-freopen': boolean,
  readonly force: boolean,
  readonly copy: boolean,
}


/**
 * 子命令 'generate' 的默认选项
 *
 * @member removeComments 是否移除所有的注释
 * @member removeSpaces   是否移除所有的空格
 * @member removeFreopen  是否移除 freopen 语句
 * @member force          如果为 true，当目标文件已经存在时，无需用户确认就进行覆盖
 * @member copy           如果为 true，则不输出到文件，而是输出到控制台
 */
export class DefaultGenerateConfig {
  public readonly removeComments: boolean
  public readonly removeSpaces: boolean
  public readonly removeFreopen: boolean
  public readonly force: boolean
  public readonly copy: boolean

  public constructor(rawConfig: RawDefaultGenerateConfig, partialRawConfig?: RawDefaultGenerateConfig) {
    const {
      'remove-spaces': removeSpaces,
      'remove-comments': removeComments,
      'remove-freopen': removeFreopen,
      'force': force,
      'copy': copy,
    } = rawConfig

    const {
      'remove-comments': pRemoveComments,
      'remove-spaces': pRemoveSpaces,
      'remove-freopen': pRemoveFreopen,
      'force': pForce,
      'copy': pCopy,
    } = partialRawConfig || {} as RawDefaultGenerateConfig

    this.removeComments = coverBoolean(removeComments, pRemoveComments)
    this.removeSpaces = coverBoolean(removeSpaces, pRemoveSpaces)
    this.removeFreopen = coverBoolean(removeFreopen, pRemoveFreopen)
    this.force = coverBoolean(force, pForce)
    this.copy = coverBoolean(copy, pCopy)
  }
}
