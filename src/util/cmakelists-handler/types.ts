/**
 * typeof content of CMakeLists.txt
 */
export interface CMakeLists {
  /**
   * Header content of CMakeLists.txt
   */
  header: string
  /**
   * include_directories declarations
   */
  includes: string[]
  /**
   * add_executable declarations
   */
  executables: Map<string, string>
  /**
   * add_compile_definitions declarations
   */
  compileDefinitions: Map<string, string>
}
