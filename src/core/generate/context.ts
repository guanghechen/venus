/**
 * Context of the sub-command 'generate'.
 */
export interface GenerateContext {
  /**
   * Path of currently executing command.
   */
  readonly cwd: string
  /**
   * Working directory.
   */
  readonly workspace: string
  /**
   * default encoding of files in the workspace.
   */
  readonly encoding: BufferEncoding
  /**
   * Source filepath.
   */
  readonly sourceFilepath: string
  /**
   * include_directories
   */
  readonly includes: string[]
  /**
   * Whether to remove the comments.
   */
  readonly removeComments: boolean
  /**
   * Whether to remove the white spaces.
   */
  readonly removeSpaces: boolean
  /**
   * Whether to remove the `freopen` statements.
   */
  readonly removeFreopen: boolean
  /**
   * Whether to remove the `assert` statements.
   */
  readonly removeAssert: boolean
  /**
   * Force writing the generated code into the output filepath.
   */
  readonly force: boolean
  /**
   * Whether to write the generated code to the system clipboard.
   */
  readonly copy: boolean
  /**
   * Output filepath.
   */
  readonly outputFilepath: string | null
}
