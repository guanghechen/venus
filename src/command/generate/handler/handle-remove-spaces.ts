import { merge } from '@/util/source-handler/merge'
import { partition } from '@/util/source-handler/partition'


// 匹配左侧包含无用的空格的正则表达式
const getLeftSpacesRegex = (flags?: string) => new RegExp(/\s+(?![\w_#])/, flags)


// 匹配右侧包含无用的空格的正则表达式
const getRightSpacesRegex = (flags?: string) => new RegExp(/(?<![\w_])\s+/, flags)


// 移除多余的空格
export const handleRemoveSpaces = (content: string): string => {
  // 否则，清除源文件中的空白字符
  const sourceItem = partition(content)
  sourceItem.sources = sourceItem.sources
    .map(({ start, content }) => ({ start, content: content.replace(getLeftSpacesRegex('g'), '') }))
    .map(({ start, content }) => ({ start, content: content.replace(getRightSpacesRegex('g'), '') }))
    .map(({ start, content }) => ({ start, content: content.trim() }))

  // 块注释去掉公共空白前缀
  const removeCommonSpacesPrefix = (content: string): string => {
    let maxCommonSpacesPrefix = content
      .split(/\n+/g)
      .filter(line => !/^\s*$/.test(line))
      .map(line => /^(\s*)/.exec(line)![0])
      .reduce((prefix: string | null, linePrefix: string) => {
        if (prefix == null) return linePrefix
        let i = 0, j = Math.min(prefix.length, linePrefix.length)
        while (i < j && prefix.charAt(i) === linePrefix.charAt(i)) ++i
        return prefix.slice(0, i)
      }, null)
    if (maxCommonSpacesPrefix == null) return content
    return content
      .split(/\n/g)
      .map(i => i.slice(maxCommonSpacesPrefix!.length))
      .join('\n')
  }

  sourceItem.comments = sourceItem.comments
    .map(({ start, content }) => ({ start, content: `\n${content}\n` }))
    .map(({ start, content }) => ({ start, content: removeCommonSpacesPrefix(content) }))

  return merge(sourceItem)
}
