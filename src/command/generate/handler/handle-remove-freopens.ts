// 获取使用 freopen 的代码段
const getFreopenRegex = (flags?: string) => new RegExp(/\s*freopen\s*\([\s\S]+?\)\s*;([ \t]*\n)?\n*/, flags)


// 移除 freopen
export const handleRemoveFreopen = (content: string): string => {
  const freopenRegex = getFreopenRegex('g')
  return content.replace(freopenRegex, '\n')
}
