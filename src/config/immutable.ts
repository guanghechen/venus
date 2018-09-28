import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'


const absoluteImmutableConfigPath = path.resolve(__dirname, 'config.immutable.yml')
const immutableConfigContent = fs.readFileSync(absoluteImmutableConfigPath, 'UTF-8')
const immutableRawConfig = yaml.safeLoad(immutableConfigContent)


/**
 * C++ 语言相关的配置
 *
 * @attr macroMark          宏的符号
 * @attr quoteMark          引号
 * @attr inlineCommentMark  行内注释符
 * @attr blockCommentMark   块注释符
 */
export const languageConfig = {
  get macroMark() { return immutableRawConfig.language['macro-mark'] as string },
  get quoteMark() { return immutableRawConfig.language['quote-mark'] as string[] },
  get inlineCommentMark() { return immutableRawConfig.language['inline-comment-mark'] as string },
  get blockCommentMark() { return immutableRawConfig.language['block-comment-mark'] as [string, string] },
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
  get definitionPhase() { return immutableRawConfig.project['definition-phase']},
  get encoding() { return immutableRawConfig.project.encoding as string },
  get cmakeLists() {
    const cmakeLists = immutableRawConfig.project.cmakelists
    return {
      filename: cmakeLists.filename as string,
      encoding: cmakeLists.encoding as string,
    }
  },
}
