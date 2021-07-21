import {
  createInitialCommit,
  installDependencies,
} from '@guanghechen/commander-helper'
import { isNonExistentOrEmpty } from '@guanghechen/file-helper'
import type execa from 'execa'
import path from 'path'
import logger from '../../env/logger'
import type { InitContext } from './context'
import { renderTemplates } from './util'

class InitProcessor {
  protected readonly context: InitContext

  constructor(context: InitContext) {
    this.context = context
  }

  /**
   * Initialize a template project of cpp managed with venus
   */
  public async init(): Promise<void> {
    const { context } = this

    // ensure target path is empty
    if (!isNonExistentOrEmpty(context.workspace)) {
      const relativeProjectPath = path.relative(context.cwd, context.workspace)
      logger.error(`${relativeProjectPath} is not a non-empty directory path`)
      return
    }

    const plopBypass = [...context.plopBypass]

    await renderTemplates(context, plopBypass)

    const execaOptions: execa.Options = {
      stdio: 'inherit',
      cwd: context.workspace,
    }

    // install dependencies
    await installDependencies(execaOptions, plopBypass, logger)

    // create init commit
    await createInitialCommit(execaOptions, plopBypass, logger)
  }
}

export default InitProcessor
