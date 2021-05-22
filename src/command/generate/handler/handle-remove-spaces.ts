import { merge } from '@/util/source-handler/merge'
import { parse } from '@/util/source-handler/parse'

// Pattern of the preceding spaces.
const precedingSpaces = /\s+(?![\w_#])/g

// Pattern of the following spaces.
const followingSpaces = /(?<![\w_])\s+/g

// Remove excess spaces.
function handleRemoveSpaces(content: string): string {
  const sourceItem = parse(content)
  sourceItem.sources = sourceItem.sources
    .map(({ start, content }) => ({
      start,
      content: content.replace(precedingSpaces, ''),
    }))
    .map(({ start, content }) => ({
      start,
      content: content.replace(followingSpaces, ''),
    }))
    .map(({ start, content }) => ({ start, content: content.trim() }))

  // Remove space ident of block comments.
  const removeCommonSpacesPrefix = (content: string): string => {
    const maxCommonSpacesPrefix = content
      .split(/\n+/g)
      .filter(line => !/^\s*$/.test(line))
      .map(line => /^(\s*)/.exec(line)![0])
      .reduce((prefix: string | null, linePrefix: string): string => {
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
      .map(i => i.slice(maxCommonSpacesPrefix.length))
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

export default handleRemoveSpaces
