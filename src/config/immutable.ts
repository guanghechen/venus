import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'

const absoluteImmutableConfigPath = path.resolve(
  __dirname,
  'config.immutable.yml',
)
const immutableConfigContent = fs.readFileSync(
  absoluteImmutableConfigPath,
  'utf-8',
)
const immutableRawConfig: any = yaml.load(immutableConfigContent)

/**
 * C++ 语言相关的配置
 *
 * @attr macroMark          宏的符号
 * @attr quoteMark          引号
 * @attr inlineCommentMark  行内注释符
 * @attr blockCommentMark   块注释符
 */
export const languageConfig = {
  get macroMark(): string {
    return immutableRawConfig.language['macro-mark']
  },
  get quoteMark(): string[] {
    return immutableRawConfig.language['quote-mark']
  },
  get inlineCommentMark(): string {
    return immutableRawConfig.language['inline-comment-mark']
  },
  get blockCommentMark(): [string, string] {
    return immutableRawConfig.language['block-comment-mark']
  },
}

/**
 * C++ 工程相关的配置
 *
 * @attr definitionPhase    区分是否使用 CMakeLists.txt 的宏变量
 * @attr encoding           源文件的默认编码格式
 * @attr cmakeLists         CMakeLists.txt 相关的配置
 *  - filename: 文件名
 *  - encoding: 文件的编码格式
 */
export const projectConfig = {
  get definitionPhase(): any {
    return immutableRawConfig.project['definition-phase']
  },
  get encoding(): string {
    return immutableRawConfig.project.encoding
  },
  get cmakeLists(): { filename: string; encoding: string } {
    const cmakeLists = immutableRawConfig.project.cmakelists
    return {
      filename: cmakeLists.filename as string,
      encoding: cmakeLists.encoding as string,
    }
  },
}
