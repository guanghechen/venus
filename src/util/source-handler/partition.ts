import { logger } from '@/util/logger'
import { languageConfig } from '@/config/immutable'
import { SourceItem, SourcePiece } from './index'


/**
 * 获取依赖列表
 */
const getImportRegex = (flags?: string) => new RegExp(/#include\s*[<"]([\w\-_.:\/\\]+)[>"]\s*?\n/, flags)


/**
 * 获取命令空间列表
 */
const getNamespaceRegex = (flags?: string) => new RegExp(/using\s+namespace\s+(\w+);\s*/, flags)


/**
 * 从指定位置开始匹配一个宏
 *
 * @param content   源码
 * @param start     起始的位置
 */
const matchMacro = (content: string, start: number): SourcePiece => {
  // 保留左侧的空格
  while (start > 0 && /^[\t ]$/.test(content.charAt(start-1))) --start
  let end = start + 1
  for (; end < content.length; ++end) {
    const letter = content.charAt(end)
    if (letter != '\\' && letter !== '\n') continue
    if (letter == '\n') break
    for (++end; end < content.length && /^\s$/.test(content.charAt(end));) ++end
    --end
  }
  return { start, content: content.slice(start, end + 1) }
}

/**
 * 从指定位置开始匹配一段明文字符串
 *
 * @param content   源码
 * @param start     起始的位置
 */
const matchLiteral = (content: string, start: number): SourcePiece => {
  let end = start + 1
  let quote = content.charAt(start)
  for (; end < content.length; ++end) {
    const letter = content.charAt(end)
    if (letter !== '\\' && letter !== quote) continue
    if (letter === quote) break
    ++end   // 如果碰到反斜杠，则再吃一个字符
  }

  // 引号没有结束
  if (end >= content.length) {
    logger.fatal('bad source file. the quotation mark is not closed.')
    process.exit(-1)
  }

  return { start, content: content.slice(start, end + 1) }
}


/**
 * 从指定位置开始匹配一段行内注释
 *
 * @param content   源码
 * @param start     起始位置
 * @param lcSymbol  行内注释符
 */
const matchLineComment = (content: string, start: number, lcSymbol: string): SourcePiece => {
  let end = start + lcSymbol.length
  while (end < content.length && content.charAt(end) !== '\n') ++end
  // 即使没有换行符，到了行末了也相当于注释结尾
  return { start, content: content.slice(start, end) }
}


/**
 * 从指定位置开始匹配一段块注释
 *
 * @param content   源码
 * @param start     起始位置
 * @param bcSymbol  块注释符
 */
const matchBlockComment = (content: string, start: number, bcSymbol: [string, string]): SourcePiece => {
  // 保留左侧的空格
  while (start > 0 && /^[\t ]$/.test(content.charAt(start-1))) --start
  let end = start + bcSymbol[0].length
  while (end < content.length && !content.startsWith(bcSymbol[1], end)) ++end

  // 块注释没有结束
  if (end >= content.length) {
    logger.fatal('bad source file. the block comment is not closed.')
    process.exit(-1)
  }

  return { start, content: content.slice(start, end + bcSymbol[1].length) }
}


/**
 * 通过注释切割、划分源码
 * @param content         源码内容
 * @return {@link SourceItems}
 */
export const partition = (content: string): SourceItem => {
  const { macroMark, quoteMark, inlineCommentMark, blockCommentMark } = languageConfig
  const macros: SourcePiece[] = []
  const sources: SourcePiece[] = []
  const comments: SourcePiece[] = []
  const literals: SourcePiece[] = []
  const dependencies: string[] = []
  const namespaces: string[] = []

  let lastIndex = 0
  for (let i=lastIndex; i < content.length; ++i) {
    let sourcePiece: SourcePiece | null = null

    // 匹配宏
    if (sourcePiece == null && content.startsWith(macroMark, i)) {
      sourcePiece = matchMacro(content, i)
      macros.push(sourcePiece)
    }

    // 匹配明文字符串
    if (sourcePiece == null) {
      for(let quote of quoteMark) {
        if( content.startsWith(quote, i) ) {
          sourcePiece = matchLiteral(content, i)
          literals.push(sourcePiece)
        }
      }
    }

    // 匹配单行注释
    if (sourcePiece == null && content.startsWith(inlineCommentMark, i)) {
      sourcePiece = matchLineComment(content, i, inlineCommentMark)
      comments.push(sourcePiece)
    }

    // 匹配多行注释
    if (sourcePiece == null && content.startsWith(blockCommentMark[0], i)) {
      sourcePiece = matchBlockComment(content, i, blockCommentMark)
      comments.push(sourcePiece)
    }

    if (sourcePiece == null) continue
    sources.push({ start: lastIndex, content: content.slice(lastIndex, sourcePiece.start)})
    lastIndex = sourcePiece.start + sourcePiece.content.length
    i = lastIndex - 1
  }

  // 最后一片是源码
  sources.push({ start: lastIndex, content: content.slice(lastIndex)})

  // 获取依赖
  macros.forEach(macro => {
    macro.content = macro.content.replace(getImportRegex('g'), (match: string, dependency: string) => {
      dependencies.push(dependency)
      return ''
    })
  })

  // 获取命令空间
  sources.forEach(source => {
    source.content = source.content.replace(getNamespaceRegex('g'), (match: string, ns: string) => {
      namespaces.push(ns)
      return ''
    })
  })

  const filterNotEmptyPiece = (sourcePiece: SourcePiece) => sourcePiece.content.length > 0

  return {
    macros,
    sources: sources.filter(filterNotEmptyPiece),
    comments: comments.filter(filterNotEmptyPiece),
    literals: literals.filter(filterNotEmptyPiece),
    dependencies: [ ...new Set(dependencies)].filter(d => d.length > 0),
    namespaces: namespaces.filter(ns => ns.length > 0),
  }
}
