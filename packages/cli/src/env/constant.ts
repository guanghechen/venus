import path from 'path'

// eslint-disable-next-line import/no-extraneous-dependencies
export {
  name as packageName,
  version as packageVersion,
} from 'venus-acm/package.json'

// Command name
export const COMMAND_NAME = 'venus-acm'

// Config files root dir
export const resourceDir = path.resolve(__dirname, '../resources')

// Template files root dir
export const templateRootDir = path.join(resourceDir, 'boilerplate')

/**
 * Config of C++ language
 */
export const languageConfig = {
  /**
   * Mark of C++ macro.
   */
  get macroMarker(): string {
    return '#'
  },
  /**
   * Marker of C++ strings.
   */
  get quoteMarker(): string[] {
    return ["'", '"']
  },
  /**
   * Marker of C++ inline comments.
   */
  get inlineCommentMarker(): string {
    return '//'
  },
  /**
   * Marker of C++ block comments.
   */
  get blockCommentMarker(): [string, string] {
    return ['/*', '*/']
  },
}
