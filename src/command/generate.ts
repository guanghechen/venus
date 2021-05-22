import {
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@barusu/util-cli'
import type {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
} from '@barusu/util-cli'
import {
  createGenerateContextFromOptions,
  createSubCommandGenerate,
} from '../core/generate/command'
import GenerateProcessor from '../core/generate/processor'
import type { SubCommandGenerateOptions } from '../core/generate/command'
import type { GenerateContext } from '../core/generate/context'

/**
 * Process sub-command: 'generate'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandGenerate: SubCommandProcessor<SubCommandGenerateOptions> =
  async function (options: SubCommandGenerateOptions): Promise<void> {
    const context: GenerateContext = await createGenerateContextFromOptions(
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
export const mountSubCommandGenerate: SubCommandMounter =
  createSubCommandMounter<SubCommandGenerateOptions>(
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
export const execSubCommandGenerate: SubCommandExecutor =
  createSubCommandExecutor<SubCommandGenerateOptions>(
    createSubCommandGenerate,
    processSubCommandGenerate,
  )
