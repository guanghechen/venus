// Match freopen statement.
const freopenRegex = /\s*freopen\s*\([\s\S]+?\)\s*;([ \t]*\n)?\n*/gu

// Remove freopen statement.
export const handleRemoveFreopen = (content: string): string =>
  content.replace(freopenRegex, '\n')
