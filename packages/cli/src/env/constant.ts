import { locateLatestPackageJson } from '@guanghechen/locate-helper'
import fs from 'fs-extra'
import path from 'path'

// Command name
export const COMMAND_NAME = 'venus-acm'

// Config files root dir
export const configRootDir = path.resolve(__dirname, '../config')

// Template files root dir
export const templateRootDir = path.join(configRootDir, 'templates')

const packageJson = locateLatestPackageJson(__dirname)
const { name: packageName, version: packageVersion } =
  packageJson != null
    ? fs.readJSONSync(packageJson)
    : { name: COMMAND_NAME, version: '0.0.0' }
export { packageName, packageVersion }

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
