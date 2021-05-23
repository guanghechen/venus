import { languageConfig } from '../../env/constant'
import logger from '../../env/logger'
import type { SourceItem, SourcePiece } from './types'

/**
 * Try to match a macro definition from the given position.
 *
 * @param content
 * @param start
 */
function matchMacro(content: string, start: number): SourcePiece {
  let i = start

  // Preserve the preceding whitespaces
  for (; i > 0; --i) {
    if (!/^[\t ]$/.test(content.charAt(i - 1))) break
  }

  let end = start
  for (; end < content.length; ++end) {
    const c = content.charAt(end)
    if (c === '\n') break
    if (c !== '\\') continue

    for (end += 1; end < content.length; ++end) {
      if (/[\S]/.test(content.charAt(end))) break
    }
    end -= 1
  }
  return { start: i, content: content.slice(i, end + 1) }
}

/**
 * Try to match literal contents from the given position.
 *
 * @param content
 * @param start
 */
function matchLiteral(content: string, start: number): SourcePiece {
  let end = start + 1
  const quote = content.charAt(start)
  for (; end < content.length; ++end) {
    const c = content.charAt(end)
    if (c === quote) break

    // If encounter an backslash, eating one more character.
    if (c === '\\') end += 1
  }

  // The quote is not closed.
  if (end >= content.length) {
    logger.fatal('[Bad]: quote is not closed.', content.slice(start))
    process.exit(-1)
  }

  return { start, content: content.slice(start, end + 1) }
}

/**
 * Try to match an inline comment from the given position.
 *
 * @param content
 * @param start
 * @param marker  inline comment marker
 */
function matchInlineComment(
  content: string,
  start: number,
  marker: string,
): SourcePiece {
  let end = start + marker.length
  for (; end < content.length; ++end) {
    if (content.charAt(end) === '\n') break
  }

  // The end of content also could be the ending of the inline comment.
  return { start, content: content.slice(start, end) }
}

/**
 * Try to match a block comment from the given position.
 *
 * @param content
 * @param start
 * @param marker
 */
function matchBlockComment(
  content: string,
  start: number,
  marker: [string, string],
): SourcePiece {
  let i = start

  // Preserve the preceding whitespaces
  for (; i > 0; --i) {
    if (!/^[\t ]$/.test(content.charAt(i - 1))) break
  }

  let end = i + marker[0].length
  for (; end < content.length; ++end) {
    if (content.startsWith(marker[1], end)) break
  }

  // The block comment is not closed.
  if (end >= content.length) {
    logger.fatal('[Bad] block comment is not closed.', content.slice(start))
    process.exit(-1)
  }

  end += marker[1].length

  // Try to match the remaining whitespaces
  for (; end < content.length; ++end) {
    if (/\S/u.test(content.charAt(end))) break
  }
  return { start: i, content: content.slice(i, end) }
}

/**
 * Split source contents into various pieces.
 * @param content
 */
export function parse(content: string): SourceItem {
  const { macroMarker, quoteMarker, inlineCommentMarker, blockCommentMarker } =
    languageConfig
  const macros: SourcePiece[] = []
  const sources: SourcePiece[] = []
  const comments: SourcePiece[] = []
  const literals: SourcePiece[] = []
  const dependencies: string[] = []
  const namespaces: string[] = []
  const typedefs: Map<string, string> = new Map<string, string>()

  let lastIndex = 0
  for (let i = lastIndex; i < content.length; ++i) {
    let sourcePiece: SourcePiece | null = null

    // Try to match macro declaration
    if (sourcePiece == null && content.startsWith(macroMarker, i)) {
      sourcePiece = matchMacro(content, i)
      macros.push(sourcePiece)
    }

    // Try to match literal contents
    if (sourcePiece == null) {
      for (const quote of quoteMarker) {
        if (content.startsWith(quote, i)) {
          sourcePiece = matchLiteral(content, i)
          literals.push(sourcePiece)
        }
      }
    }

    // Try to match inline comments
    if (sourcePiece == null && content.startsWith(inlineCommentMarker, i)) {
      sourcePiece = matchInlineComment(content, i, inlineCommentMarker)
      comments.push(sourcePiece)
    }

    // Try to match block comments
    if (sourcePiece == null && content.startsWith(blockCommentMarker[0], i)) {
      sourcePiece = matchBlockComment(content, i, blockCommentMarker)
      comments.push(sourcePiece)
    }

    // Unknown contents
    if (sourcePiece == null) continue

    sources.push({
      start: lastIndex,
      content: content.slice(lastIndex, sourcePiece.start),
    })

    lastIndex = sourcePiece.start + sourcePiece.content.length
    i = lastIndex - 1
  }

  // The last piece is a literal content.
  sources.push({ start: lastIndex, content: content.slice(lastIndex) })

  // Get dependency list from macro declarations.
  for (const macro of macros) {
    macro.content = macro.content.replace(
      /#include\s*[<"]([@\w\-_.:/\\]+)[>"]\s*?\n/g,
      (_: string, dependency: string) => {
        dependencies.push(dependency)
        return ''
      },
    )
  }

  // Get namespaces.
  for (const source of sources) {
    source.content = source.content.replace(
      /using\s+namespace\s+(\w+)\s*;\s*/g,
      (_: string, ns: string) => {
        namespaces.push(ns)
        return ''
      },
    )
  }

  // Get typedef declarations
  for (const source of sources) {
    source.content = source.content.replace(
      /typedef\s+([\w* <>]+)\s+(\w+)\s*;\s*/g,
      (_: string, raw: string, alias: string) => {
        typedefs.set(alias, raw)
        return ''
      },
    )
  }

  const isNotEmptyPiece = (sourcePiece: SourcePiece): boolean =>
    sourcePiece.content.length > 0

  return {
    macros,
    sources: sources.filter(isNotEmptyPiece),
    comments: comments.filter(isNotEmptyPiece),
    literals: literals.filter(isNotEmptyPiece),
    dependencies: Array.from(new Set(dependencies)).filter(d => d.length > 0),
    namespaces: namespaces.filter(ns => ns.length > 0),
    typedefs,
  }
}

export default parse
