/**
 * 匹配 include_directories 的正则表达式
 */
export const getIncludeDirectoriesRegex = (flags?: string) => new RegExp(/^\s*include_directories\((\s*\S+?\s*)\)\s*$/, flags)


/**
 * 匹配 add_executable 的正则表达式
 */
export const getAddExecutableRegex = (flags?: string) => new RegExp(/^\s*add_executable\((\S+?)\s+([\s\S]+?)\)\s*$/, flags)
