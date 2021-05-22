import path from 'path'

export {
  name as packageName,
  version as packageVersion,
} from '../../package.json'

// Command name
export const COMMAND_NAME = 'venus-acm'

// Config files root dir
export const configRootDir = path.resolve(__dirname, '../config')

// Template files root dir
export const templateRootDir = path.join(configRootDir, 'templates')

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
