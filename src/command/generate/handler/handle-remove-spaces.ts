import { merge } from '@/util/source-handler/merge'
import { parse } from '@/util/source-handler/parse'

// 匹配左侧包含无用的空格的正则表达式
const getLeftSpacesRegex = (flags?: string): RegExp =>
  new RegExp(/\s+(?![\w_#])/, flags)

// 匹配右侧包含无用的空格的正则表达式
const getRightSpacesRegex = (flags?: string): RegExp =>
  new RegExp(/(?<![\w_])\s+/, flags)

// 移除多余的空格
export const handleRemoveSpaces = (content: string): string => {
  // 否则，清除源文件中的空白字符
  const sourceItem = parse(content)
  sourceItem.sources = sourceItem.sources
    .map(({ start, content }) => ({
      start,
      content: content.replace(getLeftSpacesRegex('g'), ''),
    }))
    .map(({ start, content }) => ({
      start,
      content: content.replace(getRightSpacesRegex('g'), ''),
    }))
    .map(({ start, content }) => ({ start, content: content.trim() }))

  // 块注释去掉公共空白前缀
  const removeCommonSpacesPrefix = (content: string): string => {
    const maxCommonSpacesPrefix = content
      .split(/\n+/g)
      .filter(line => !/^\s*$/.test(line))
      .map(line => /^(\s*)/.exec(line)![0])
      .reduce((prefix: string | null, linePrefix: string) => {
        if (prefix == null) return linePrefix
        let i = 0
        for (const j = Math.min(prefix.length, linePrefix.length); i < j; ++i) {
          if (prefix.charAt(i) !== linePrefix.charAt(i)) break
        }
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
    .map(({ start, content }) => ({
      start,
      content: removeCommonSpacesPrefix(content),
    }))

  const header = merge({
    sources: [],
    literals: [],
    comments: [],
    macros: [],
    dependencies: sourceItem.dependencies,
    namespaces: sourceItem.namespaces,
    typedefs: new Map<string, string>(),
  })
    .trim()
    .replace(/#include\s*/, '#include')

  const body = merge({
    ...sourceItem,
    dependencies: [],
    namespaces: [],
    typedefs: new Map<string, string>(),
  }).trim()

  const typedefs: string = [...sourceItem.typedefs.entries()]
    .map(([alias, raw]) => `typedef ${raw} ${alias};`)
    .join('')

  return header.concat('\n').concat(typedefs).concat(body)
}
