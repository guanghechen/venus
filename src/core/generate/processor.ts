import { isNonBlankString } from '@guanghechen/option-helper'
import path from 'path'
import {
  resolveDependencies,
  resolveLocalDependencyPath,
} from '../../util/source-handler/dependency'
import handleCopy from './handler/handle-copy'
import handleRemoveAsserts from './handler/handle-remove-asserts'
import handleRemoveComments from './handler/handle-remove-comments'
import handleRemoveDefinition from './handler/handle-remove-definitions'
import handleRemoveFreopen from './handler/handle-remove-freopens'
import handleRemoveSpaces from './handler/handle-remove-spaces'
import handleSave from './handler/handle-save'
import type { GenerateContext } from './context'

export class GenerateProcessor {
  protected readonly context: GenerateContext

  constructor(context: GenerateContext) {
    this.context = context
  }

  public async generate(): Promise<void> {
    const { context } = this

    const sourceFilepath = isNonBlankString(
      path.extname(context.sourceFilepath),
    )
      ? context.sourceFilepath
      : context.sourceFilepath + '.cpp'

    // Resolve dependencies.
    let content: string = await resolveDependencies(
      (dependencies: string[], absoluteSourcePath: string) => {
        return resolveLocalDependencyPath(
          dependencies,
          absoluteSourcePath,
          context.workspace,
          context.includes,
        )
      },
      sourceFilepath,
      context.encoding,
    )

    // Remove freopen statements.
    if (context.removeFreopen) {
      content = handleRemoveFreopen(content)
      content = handleRemoveDefinition(content)
    }

    // Remove assert statements.
    if (context.removeAssert) {
      content = handleRemoveAsserts(content)
    }

    // Uglify / Compress.
    if (context.removeComments) content = handleRemoveComments(content)
    if (context.removeSpaces) content = handleRemoveSpaces(content)
    else content = content.trim().concat('\n')

    // Copy into system clipboard.
    if (context.copy) {
      await handleCopy(content)
    }

    // Save to external file.
    if (context.outputFilepath != null) {
      await handleSave(context, content)
    }
  }
}

export default GenerateProcessor
