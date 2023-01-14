import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import {
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@guanghechen/helper-commander'
import type { SubCommandInitOptions } from '../core/init/command'
import {
  createInitContextFromOptions,
  createSubCommandInit,
} from '../core/init/command'
import type { IInitContext } from '../core/init/context'
import InitProcessor from '../core/init/processor'

/**
 * Process sub-command: 'init'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandInit: ISubCommandProcessor<SubCommandInitOptions> =
  async function (options: SubCommandInitOptions): Promise<void> {
    const context: IInitContext = await createInitContextFromOptions(options)
    const processor = new InitProcessor(context)
    await processor.init()
  }

/**
 * Mount Sub-command: init
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandInit: ISubCommandMounter =
  createSubCommandMounter<SubCommandInitOptions>(
    createSubCommandInit,
    processSubCommandInit,
  )

/**
 * Execute sub-command: 'init'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandInit: ISubCommandExecutor =
  createSubCommandExecutor<SubCommandInitOptions>(
    createSubCommandInit,
    processSubCommandInit,
  )
