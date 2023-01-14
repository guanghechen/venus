import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import {
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@guanghechen/helper-commander'
import {
  createGenerateContextFromOptions,
  createSubCommandGenerate,
} from '../core/generate/command'
import type { ISubCommandGenerateOptions } from '../core/generate/command'
import type { IGenerateContext } from '../core/generate/context'
import GenerateProcessor from '../core/generate/processor'

/**
 * Process sub-command: 'generate'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandGenerate: ISubCommandProcessor<ISubCommandGenerateOptions> =
  async function (options: ISubCommandGenerateOptions): Promise<void> {
    const context: IGenerateContext = await createGenerateContextFromOptions(
      options,
    )
    const processor = new GenerateProcessor(context)
    await processor.generate()
  }

/**
 * Mount Sub-command: generate
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandGenerate: ISubCommandMounter =
  createSubCommandMounter<ISubCommandGenerateOptions>(
    createSubCommandGenerate,
    processSubCommandGenerate,
  )

/**
 * Execute sub-command: 'generate'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandGenerate: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandGenerateOptions>(
    createSubCommandGenerate,
    processSubCommandGenerate,
  )
