import {
  coverBoolean,
  coverInteger,
  coverObject,
  coverString,
} from '@guanghechen/option-helper'

/**
 * 配置文件的参数名
 *
 * @member template         => template
 *  - active => active
 *  - encoding => encoding
 *  - filename => filename
 *
 * @member data             => data
 *  - active => active
 *  - encoding => encoding
 *  - filename => filename
 *
 * @member categories       => categories
 *  - [phrase]
 *    - dirname => dirname
 *    - 'problem-number' => problemNumber
 */
export interface RawDefaultCreateConfig {
  readonly template: {
    readonly active: boolean
    readonly encoding: string
    readonly filename: string
  }
  readonly data: {
    readonly active: boolean
    readonly encoding: string
    readonly filename: string
  }
  readonly categories: Array<
    Readonly<
      Record<
        string,
        {
          readonly dirname: string
          readonly 'problem-number': number
        }
      >
    >
  >
}

/**
 * 子命令 'create/new' 的默认选项
 *
 * @member template       新建文件时模板的相关选项
 *  - active    是否启用模板
 *  - filename  模板文件的路径（相对于 C++ 工程的根目录）
 *  - encoding  模板文件的编码格式
 *
 * @member data           新建文件时外部输入文件的相关选项
 *  - active    是否启用外部输入文件
 *  - filename  模板文件的路径（相对于源文件所在的文件夹）
 *  - encoding  数据文件的编码格式
 *
 * @member categories     比赛的类型/特征描述：如 codeforces、bestcoder 等
 *  - [phrase] 比赛的类型/特征描述的短语（在命令行中通过 '--contest' 选项指定的值将用于与该短语匹配）
 *    - dirname           此类型/特征比赛的最长公共前缀目录
 *    - 'problem-number'  此类型/特征比赛的题目个数
 */
export class DefaultCreateConfig {
  public readonly template: {
    readonly active: boolean
    readonly encoding: string
    readonly filename: string
  }
  public readonly data: {
    readonly active: boolean
    readonly encoding: string
    readonly filename: string
  }
  public readonly categories: Readonly<
    Record<
      string,
      {
        dirname: string
        problemNumber: number
      }
    >
  >

  constructor(
    rawConfig: RawDefaultCreateConfig,
    partialRawConfig?: RawDefaultCreateConfig,
  ) {
    const { template, data, categories } = rawConfig
    const {
      template: pTemplate = {} as any,
      data: pData = {} as any,
      categories: pCategories,
    } = partialRawConfig ?? {}

    this.template = {
      active: coverBoolean(template.active, pTemplate.active),
      encoding: coverString(template.encoding, pTemplate.encoding),
      filename: coverString(template.filename, pTemplate.filename),
    }

    this.data = {
      active: coverBoolean(data.active, pData.active),
      encoding: coverString(data.encoding, pData.encoding),
      filename: coverString(data.filename, pData.filename),
    }

    const resolvedCategories = coverObject(categories, pCategories)
    this.categories = Object.getOwnPropertyNames(resolvedCategories).reduce(
      (result, c) => ({
        ...result,
        [c]: {
          dirname: resolvedCategories[c].dirname,
          problemNumber: coverInteger(
            0,
            resolvedCategories[c]['problem-number'],
          ),
        },
      }),
      {},
    )
  }
}
