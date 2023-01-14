import { resolveCommandConfigurationOptions } from '@guanghechen/helper-commander'
import type {
  ICommandConfigurationFlatOpts,
  ICommandConfigurationOptions,
  IMergeStrategy,
} from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { logger } from '../env/logger'

/**
 * Global command options
 */
export interface IGlobalCommandOptions extends ICommandConfigurationOptions {
  /**
   * default encoding of files in the workspace
   * @default utf-8
   */
  encoding: BufferEncoding
}

/**
 * Default value of global options
 */
export const __defaultGlobalCommandOptions: IGlobalCommandOptions = {
  encoding: 'utf-8',
}

/**
 * Resolve global options.
 *
 * @param commandName
 * @param subCommandName
 * @param defaultOptions
 * @param workspaceDir
 * @param options
 * @returns
 */
export function resolveGlobalCommandOptions<C extends object>(
  commandName: string,
  subCommandName: string | false,
  defaultOptions: C,
  workspaceDir: string,
  options: C & IGlobalCommandOptions,
): C & IGlobalCommandOptions & ICommandConfigurationFlatOpts {
  type R = C & IGlobalCommandOptions & ICommandConfigurationFlatOpts
  const resolvedDefaultOptions: R = resolveCommandConfigurationOptions<
    C & IGlobalCommandOptions
  >(
    logger,
    commandName,
    subCommandName,
    workspaceDir,
    { ...__defaultGlobalCommandOptions, ...defaultOptions },
    options,
  )

  // Resolve encoding.
  const encoding: string = cover<string>(
    resolvedDefaultOptions.encoding,
    options.encoding,
    isNonBlankString,
  )
  logger.debug('encoding:', encoding)

  return {
    ...resolvedDefaultOptions,
    encoding,
  }
}
