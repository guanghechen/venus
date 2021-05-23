import type { SourceItem } from './types'

/**
 * Token of cpp source codes
 * @member type
 * @member rank
 * @member content
 */
interface Token {
  type: 'macro' | 'source' | 'comment' | 'literal'
  rank: number
  content: string
}

/**
 * 合并源码、注释、明文字符串
 * Merge source codes, comments and literal strings
 *
 * @param sourceItem
 */
export function merge(sourceItem: SourceItem): string {
  const contentPieces: string[] = [
    ...sourceItem.macros.map(
      ({ start, content }): Token => ({
        type: 'macro',
        rank: start,
        content,
      }),
    ),
    ...sourceItem.sources.map(
      ({ start, content }): Token => ({
        type: 'source',
        rank: start,
        content,
      }),
    ),
    ...sourceItem.comments.map(
      ({ start, content }): Token => ({
        type: 'comment',
        rank: start,
        content,
      }),
    ),
    ...sourceItem.literals.map(
      ({ start, content }): Token => ({
        type: 'literal',
        rank: start,
        content,
      }),
    ),
  ]
    .sort((x: Token, y: Token): number => x.rank - y.rank)
    .map((token: Token): string => {
      if (token.type !== 'macro') return token.content
      return token.content.replace(/^[\n]*/, '').trimRight()
    })

  const dependencies: string = Array.from(new Set(sourceItem.dependencies))
    .sort((x: string, y: string) => {
      if (x === y) return 0
      return x < y ? -1 : 1
    })
    .map(dependency => `#include <${dependency.trim()}>`)
    .join('\n')

  const namespaceSet: Set<string> = new Set<string>()
  const namespaces: string = sourceItem.namespaces
    .map(ns => ns.trim())
    .filter(ns => {
      if (namespaceSet.has(ns)) return false
      namespaceSet.add(ns)
      return true
    })
    .map(ns => `using namespace ${ns};`)
    .join('\n')

  const typedefs: string = Array.from(sourceItem.typedefs.entries())
    .map(([alias, raw]) => `typedef ${raw} ${alias};`)
    .join('\n')

  const content = contentPieces
    .join('')
    .trim()
    .replace(/(\n\s*?){2,}/g, '\n\n')
    .concat('\n')

  const result = dependencies
    .concat(
      namespaces != null && namespaces.length > 0 ? '\n' + namespaces : '',
    )
    .concat('\n\n\n')
    .concat(typedefs != null && typedefs.length > 0 ? typedefs + '\n\n' : '')
    .concat(content.trim())
    .concat('\n')
  return result
}

export default merge
