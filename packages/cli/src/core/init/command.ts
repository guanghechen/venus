import type {
  ICommandConfigurationFlatOpts,
  ISubCommandCreator,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { isNotEmptyArray } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { PACKAGE_NAME } from '../../env/constant'
import { logger } from '../../env/logger'
import {
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'
import type { IGlobalCommandOptions } from '../option'
import type { IInitContext } from './context'

interface SubCommandOptions extends IGlobalCommandOptions {
  /**
   * Pass to plop
   */
  readonly plopBypass: string[]
}

const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  plopBypass: [],
}

export type SubCommandInitOptions = SubCommandOptions &
  ICommandConfigurationFlatOpts

/**
 * create Sub-command: init
 */
export const createSubCommandInit: ISubCommandCreator<SubCommandInitOptions> =
  function (
    handle?: ISubCommandProcessor<SubCommandInitOptions>,
    commandName = 'init',
    aliases: string[] = ['i'],
  ): Command {
    const command = new Command()

    command
      .name(commandName)
      .aliases(aliases)
      .arguments('<workspace>')
      .option(
        '--plop-bypass <plopBypass>',
        'bypass array to plop',
        (val, acc: string[]) => acc.concat(val),
        [],
      )
      .action(async function ([_workspaceDir], options: SubCommandOptions) {
        logger.setName(commandName)

        const defaultOptions: SubCommandInitOptions =
          resolveGlobalCommandOptions(
            PACKAGE_NAME,
            commandName,
            __defaultCommandOptions,
            _workspaceDir,
            options,
          )

        // resolve plopBypass
        const plopBypass: string[] = cover<string[]>(
          defaultOptions.plopBypass,
          options.plopBypass,
          isNotEmptyArray,
        )
        logger.debug('plopBypass:', plopBypass)

        const resolvedOptions: SubCommandInitOptions = {
          ...defaultOptions,
          plopBypass,
        }

        if (handle != null) {
          await handle(resolvedOptions)
        }
      })

    return command
  }

/**
 * Create InitContext
 * @param options
 */
export async function createInitContextFromOptions(
  options: SubCommandInitOptions,
): Promise<IInitContext> {
  const context: IInitContext = {
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    plopBypass: options.plopBypass,
  }
  return context
}
