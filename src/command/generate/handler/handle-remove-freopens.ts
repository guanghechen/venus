// Match freopen statement.
const freopenRegex = /\s*freopen\s*\([\s\S]+?\)\s*;([ \t]*\n)?\n*/gu

// Remove freopen statement.
function handleRemoveFreopen(content: string): string {
  return content.replace(freopenRegex, '\n')
}

export default handleRemoveFreopen
