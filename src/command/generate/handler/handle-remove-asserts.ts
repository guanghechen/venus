// 获取使用 freopen 的代码段
const getAssertRegex = (flags?: string): RegExp =>
  new RegExp(/\s*assert\s*\([^]+?\)\s*;([ \t]*\n)?\n*/, flags)

// 移除 freopen
export const handleRemoveAsserts = (content: string): string => {
  const assertRegex = getAssertRegex('g')
  return content.replace(assertRegex, '\n')
}
