// Match assert declarations.
const assertRegex = /\s*assert\s*\([^]+?\)\s*;([ \t]*\n)?\n*/gu

// Remove assert declarations.
function handleRemoveAsserts(content: string): string {
  return content.replace(assertRegex, '\n')
}

export default handleRemoveAsserts
