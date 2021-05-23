import clipboardy from 'clipboardy'

/**
 * Write contents to the system clipboard.
 * @param content
 * @returns
 */
export const copy = async (content: string): Promise<void> =>
  clipboardy.write(content)

/**
 * Read contents from the system clipboard.
 * @returns
 */
export const paste = async (): Promise<string> => clipboardy.read()
