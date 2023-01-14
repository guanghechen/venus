import type { Command } from '@guanghechen/helper-commander'
import { createTopCommand } from '@guanghechen/helper-commander'
import { COMMAND_NAME, COMMAND_VERSION } from '../env/constant'

/**
 * Create a top commander instance with default global options
 */
export function createProgram(): Command {
  const program = createTopCommand(COMMAND_NAME, COMMAND_VERSION)

  // global options
  program.option(
    '--encoding <encoding>',
    'default encoding of files in the workspace',
  )

  return program
}
