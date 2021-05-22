/**
 * Match a definition declaration, such as:
 *
 * ```cpp
 * #ifdef xxx
 * #else
 * #endif
 * ```
 */
const definitionRegex =
  /#ifdef\s*?\w*\s*?\n\s*(?:#else)?\s*?\n#endif(?:[^\n]*?)\n+/gu

const venusDefinitionRegex =
  /#ifndef\s*?(VENUS\w*)\s*?\n\s*#define\s*?\1\n([^]*?)#endif(?:[^\n]*?)\n+/gu

// Remove definition declarations.
function handleRemoveDefinition(content: string): string {
  return content
    .replace(definitionRegex, '')
    .replace(venusDefinitionRegex, '$2')
}

export default handleRemoveDefinition
