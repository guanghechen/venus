import type { CMakeLists } from './types'

/**
 * 匹配 include_directories 的正则表达式
 */
const getIncludeDirectoriesRegex = (flags?: string): RegExp =>
  new RegExp(/^\s*include_directories\(\s*(\S+?)\s*\)\s*$/, flags)

/**
 * 匹配 add_executable 的正则表达式
 */
const getAddExecutableRegex = (flags?: string): RegExp =>
  new RegExp(/^\s*add_executable\(\s*(\S+?)\s+([\s\S]+?)\)\s*$/, flags)

/**
 * 匹配 add_compile_definitions 的正则表达式
 */
const getAddCompileDefinitionsRegex = (flags?: string): RegExp =>
  new RegExp(
    /^\s*add_compile_definitions\(((?:\s*[\w]+(?:=(?:[\w${}]|\\ )+)?\s*)+)\)\s*$/,
    flags,
  )

class Collector {
  private items: string[]
  private includes: string[]
  private executables: Map<string, string>
  private compileDefinitions: Map<string, string>

  constructor(items: string[]) {
    this.items = items
    this.includes = []
    this.executables = new Map()
    this.compileDefinitions = new Map()
  }

  public collect(): CMakeLists {
    this.collectIncludes().collectExecutables().collectDefinitions()
    const header = this.items.join('\n')
    const { includes, executables, compileDefinitions } = this
    return { header, includes, executables, compileDefinitions }
  }

  /**
   * 收集 include_directories
   */
  private collectIncludes(): Collector {
    const { items } = this
    const regex: RegExp = getIncludeDirectoriesRegex()
    const { trues, falses } = Collector.partitionArray(items, text =>
      regex.test(text),
    )
    this.includes = trues.map(item => regex.exec(item)![1])
    this.items = falses
    return this
  }

  /**
   * 收集 add_executables
   */
  private collectExecutables(): Collector {
    const { items } = this
    const regex: RegExp = getAddExecutableRegex()
    const { trues, falses } = Collector.partitionArray(items, text =>
      regex.test(text),
    )
    this.executables = trues
      .map(item => regex.exec(item)!)
      .reduce(
        (mp, [, target, source]) => mp.set(target, source),
        new Map<string, string>(),
      )
    this.items = falses
    return this
  }

  /**
   * 收集 add_compile_definitions
   */
  private collectDefinitions(): Collector {
    const { items } = this
    const regex: RegExp = getAddCompileDefinitionsRegex()
    const splitRegex = /\s*([\w]+(?:=(?:[\w${}]|\\ )+)?)*\s*/
    const subRegex = /^([\w]+)(?:=((?:[\w${}]|\\ )+))?$/
    const { trues, falses } = Collector.partitionArray(items, text =>
      regex.test(text),
    )
    this.compileDefinitions = trues
      .map(item => regex.exec(item)![1])
      .map(item => item.trim().split(new RegExp(splitRegex, 'g')))
      .reduce((lft: string[], rht: string[]) => lft.concat(rht), [])
      .filter(item => subRegex.test(item)!)
      .map(item => subRegex.exec(item)!)
      .reduce(
        (mp, [, target, source]) => mp.set(target, source),
        new Map<string, string>(),
      )
    this.items = falses
    return this
  }

  /**
   * 将数组分成两份，一份满足过滤条件，一份不满足
   *
   * @param items   原数组
   * @param test    过滤函数
   */
  private static partitionArray = <T>(
    items: T[],
    test: (text: T) => boolean,
  ): { trues: T[]; falses: T[] } => {
    const trues: T[] = []
    const falses: T[] = []
    for (const item of items) {
      if (test(item)) trues.push(item)
      else falses.push(item)
    }
    return { trues, falses }
  }
}

/**
 * 解析 CMakeLists.txt，获取需要的数据
 *
 * @param content       CMakeLists.txt 的内容
 */
export const partition = (content: string): CMakeLists => {
  const items = content.split(/\n+/g)
  const collector = new Collector(items)
  return collector.collect()
}
