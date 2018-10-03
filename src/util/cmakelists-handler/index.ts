/**
 * 将 CMakeLists.txt 分成若干部分
 *
 * @attr header             CMakeLists.txt 的头部
 * @attr includes           CMakeLists.txt 的 include_directories 列表
 * @attr executable         CMakeLists.txt 的 add_executable 列表
 * @attr compileDefinitions CMakeLists.txt 的 add_compile_definitions 列表
 */
export interface CMakeLists {
  header: string
  includes: string[]
  executables: Map<string, string>
  compileDefinitions: Map<string, string>
}
