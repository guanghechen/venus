/**
 * Context variables for RestfulApiInitContext
 */
export interface IInitContext {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
  /**
   * The encoding format of files in the working directory
   */
  readonly encoding: string
  /**
   * Pass to plop
   */
  readonly plopBypass: string[]
}
