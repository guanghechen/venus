/**
 * 获取使用 definition 的代码段，匹配
 *
 * #ifdef xxx
 * #else
 * #endif
 */
const getDefinitionRegex = (flags?: string) => new RegExp(/#ifdef\s*?\w*\s*?\n\s*(?:#else)?\s*?\n#endif(\s*?)\n/, flags)


// 移除 freopen
export const handleRemoveDefinition = (content: string): string => {
  const definitionRegex = getDefinitionRegex('g')
  return content.replace(definitionRegex, '\n')
}
