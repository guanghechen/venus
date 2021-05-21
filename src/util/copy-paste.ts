import clipboardy from 'clipboardy'

export const copy = async (content: string): Promise<void> =>
  clipboardy.write(content)
export const paste = async (): Promise<string> => clipboardy.read()
