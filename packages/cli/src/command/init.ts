import type {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
} from '@guanghechen/commander-helper'
import {
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@guanghechen/commander-helper'
import type { SubCommandInitOptions } from '../core/init/command'
import {
  createInitContextFromOptions,
  createSubCommandInit,
} from '../core/init/command'
import type { InitContext } from '../core/init/context'
import InitProcessor from '../core/init/processor'

/**
 * Process sub-command: 'init'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandInit: SubCommandProcessor<SubCommandInitOptions> =
  async function (options: SubCommandInitOptions): Promise<void> {
    const context: InitContext = await createInitContextFromOptions(options)
    const processor = new InitProcessor(context)
    await processor.init()
  }

/**
 * Mount Sub-command: init
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandInit: SubCommandMounter =
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
export const execSubCommandInit: SubCommandExecutor =
  createSubCommandExecutor<SubCommandInitOptions>(
    createSubCommandInit,
    processSubCommandInit,
  )
