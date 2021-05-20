/**
 * 获取使用 definition 的代码段，匹配
 *
 * #ifdef xxx
 * #else
 * #endif
 */
const getDefinitionRegex = (flags?: string): RegExp =>
  new RegExp(
    /#ifdef\s*?\w*\s*?\n\s*(?:#else)?\s*?\n#endif(?:[^\n]*?)\n+/,
    flags,
  )
const getVenusDefinitionRegex = (flags?: string): RegExp =>
  new RegExp(
    /#ifndef\s*?(VENUS\w*)\s*?\n\s*#define\s*?\1\n([^]*?)#endif(?:[^\n]*?)\n+/,
    flags,
  )

// 移除 freopen
export const handleRemoveDefinition = (content: string): string => {
  const definitionRegex = getDefinitionRegex('g')
  const venuesDefinitionRegex = getVenusDefinitionRegex('g')
  return content
    .replace(definitionRegex, '')
    .replace(venuesDefinitionRegex, '$2')
}
