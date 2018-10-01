import { SourceItem } from './index'


/**
 * 排序的单元
 *
 * @member type     单元的类型 (macro\source\comment\literal)
 * @member rank     单元的优先级
 * @member content  单元的具体内容
 */
interface SortItem {
  type: string
  rank: number
  content: string
}


/**
 * 合并源码、注释、明文字符串
 * @param sourceItem
 * @return 合并后的代码
 */
export const merge = (sourceItem: SourceItem) => {
  const contentPieces: string[] = [
    ...sourceItem.macros.map(({ start, content }) => ({ type: 'macro', rank: start, content })),
    ...sourceItem.sources.map(({ start, content }) => ({ type: 'source', rank: start, content })),
    ...sourceItem.comments.map(({ start, content }) => ({ type: 'comment', rank: start, content })),
    ...sourceItem.literals.map(({ start, content }) => ({ type: 'literal', rank: start, content })),
  ]
    .sort((alpha: SortItem, beta: SortItem): number => alpha.rank - beta.rank)
    .map((item: SortItem, index: number, sortItem: SortItem[]): string => {
      if (index === 0 || item.type !== 'macro') return item.content
      item.content = item.content
        .replace(/^\n*/, /\n+$/.test(sortItem[index-1].content)? '': '\n')
        .replace('/\s*$/', '\n')
      return item.content
    })

  const dependencies: string = [ ...new Set(sourceItem.dependencies) ]
    .sort((x: string, y: string) => {
      if (x == y) return 0
      if (x.length !== y.length) return x.length - y.length
      return x < y? -1: 1
    })
    .map(dependency => `#include<${dependency}>\n`)
    .join('')

  const namespaceSet: Set<string> = new Set<string>()
  const namespaces: string = sourceItem.namespaces
    .filter(ns => {
      if (namespaceSet.has(ns)) return false
      namespaceSet.add(ns)
      return true
    })
    .map(ns => `using namespace ${ns};\n`)
    .join('')

  const content = contentPieces
    .join('')
    .trim()
    .replace(/(\n\s*?){2,}/g, '\n\n')
    .concat('\n')

  return dependencies
    .concat(namespaces)
    .concat('\n\n')
    .concat(content.trimLeft())
}
