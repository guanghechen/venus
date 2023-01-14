/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path'
import url from 'node:url'
import { name, version } from 'venus-acm/package.json' assert { type: 'json' }

// Command name
export const COMMAND_NAME = 'venus-acm'
export const COMMAND_VERSION: string = version
export const PACKAGE_NAME: string = name

// Config files root dir
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
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
