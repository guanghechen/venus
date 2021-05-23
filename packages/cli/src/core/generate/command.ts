import { Command } from '@barusu/util-cli'
import type {
  CommandConfigurationFlatOpts,
  SubCommandCreator,
  SubCommandProcessor,
} from '@barusu/util-cli'
import {
  locateLatestPackageJson,
  locateNearestFilepath,
} from '@guanghechen/locate-helper'
import {
  cover,
  coverBoolean,
  isNonBlankString,
  isNotEmptyArray,
} from '@guanghechen/option-helper'
import fs from 'fs-extra'
import path from 'path'
import { packageName } from '../../env/constant'
import logger from '../../env/logger'
import { ensureFileExists } from '../../util/fs'
import {
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'
import type { GlobalCommandOptions } from '../option'
import type { GenerateContext } from './context'

interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * Source filepath
   */
  readonly sourceFilepath: string
  /**
   * include_directories
   * @default []
   */
  readonly includes: string[]
  /**
   * Force writing the generated code into the output filepath.
   * @default false
   */
  readonly force: boolean
  /**
   * Whether to write the generated code to the system clipboard.
   * @default false
   */
  readonly copy: boolean
  /**
   * Set the defaultValue of removeComments, removeSpaces to `true`
   * @default false
   */
  readonly uglify: boolean
  /**
   * Whether to remove the comments.
   * @default true
   */
  readonly removeComments: boolean
  /**
   * Whether to remove the white spaces.
   * @default false
   */
  readonly removeSpaces: boolean
  /**
   * Whether to remove the `freopen` statements.
   * @default true
   */
  readonly removeFreopen: boolean
  /**
   * Whether to remove the `assert` statements.
   * @default true
   */
  readonly removeAssert: boolean
  /**
   * Output filepath.
   */
  readonly output: string | null
}

const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  sourceFilepath: '',
  get includes() {
    return []
  },
  force: false,
  copy: false,
  uglify: false,
  removeComments: true,
  removeSpaces: false,
  removeFreopen: true,
  removeAssert: true,
  output: null,
}

export type SubCommandGenerateOptions = SubCommandOptions &
  CommandConfigurationFlatOpts

/**
 * create Sub-command: generate (g)
 */
export const createSubCommandGenerate: SubCommandCreator<SubCommandGenerateOptions> =
  function (
    handle?: SubCommandProcessor<SubCommandGenerateOptions>,
    commandName = 'generate',
    aliases: string[] = ['g'],
  ): Command {
    const command = new Command()

    command
      .name(commandName)
      .aliases(aliases)
      .arguments('<source filepath> [output filepath]')

      .option('--remove-comments', 'remove comments')
      .option('--no-remove-comments')

      .option('--remove-spaces', 'remove spaces')
      .option('--no-remove-spaces')

      .option('--remove-freopen', 'remove freopen statements')
      .option('--no-remove-freopen')

      .option('--remove-assert', 'remove assert statements')
      .option('--no-remove-assert')

      .option('-u, --uglify', 'shortcut of --rc --rs.')
      .option('--no-uglify')

      .option('-c, --copy', 'write generated code into system clipboard')
      .option('--no-copy')

      .option(
        '-f, --force',
        'force write the generated code into output filepath',
      )
      .option('--no-force')

      .option('-I, --include <include_directory...>', 'include directories')
      .option('-o, --output <output filepath>', 'specify the output filepath')
      .action(async function (
        [_sourceFilepath],
        options: SubCommandGenerateOptions,
      ) {
        logger.setName(commandName)

        const sourceFilepath = path.resolve(process.cwd(), _sourceFilepath)
        const configFilepath = locateLatestPackageJson(sourceFilepath)

        logger.debug('sourceFilepath:', sourceFilepath)
        ensureFileExists(configFilepath, 'Cannot find the package.json')

        const _workspaceDir = path.dirname(configFilepath!)
        const defaultOptions: SubCommandGenerateOptions =
          resolveGlobalCommandOptions(
            packageName,
            commandName,
            __defaultCommandOptions,
            _workspaceDir,
            options,
          )

        const { workspace } = defaultOptions

        // resolve includes
        const includes = cover<string[]>(
          defaultOptions.includes,
          options.includes,
          isNotEmptyArray,
        )
        {
          const cmakeListsFilepath = locateNearestFilepath(
            workspace,
            'CMakeLists.txt',
          )

          if (cmakeListsFilepath != null) {
            const content = await fs.readFile(
              cmakeListsFilepath,
              defaultOptions.encoding,
            )
            const regex = /\s*include_directories\(\s*(\S+?)\s*\)\s*/gu
            const includeDirectories: string[] = []
            // eslint-disable-next-line no-cond-assign
            for (let m; (m = regex.exec(content)) != null; ) {
              const includeDirectory = m[1].trim()
              includeDirectories.push(includeDirectory)
            }
            includes.push(...includeDirectories)
          }
        }
        logger.debug('includes:', includes)

        // resolve force
        const force = coverBoolean(defaultOptions.force, options.force)
        logger.debug('force:', force)

        // resolve copy
        const copy = coverBoolean(defaultOptions.copy, options.copy)
        logger.debug('copy:', copy)

        // resolve uglify
        const uglify = coverBoolean(defaultOptions.uglify, options.uglify)
        logger.debug('uglify:', uglify)

        // resolve removeComments
        const removeComments = coverBoolean(
          uglify || defaultOptions.removeComments,
          options.removeComments,
        )
        logger.debug('removeComments:', removeComments)

        // resolve removeSpaces
        const removeSpaces = coverBoolean(
          uglify || defaultOptions.removeSpaces,
          options.removeSpaces,
        )
        logger.debug('removeSpaces:', removeSpaces)

        // resolve removeFreopen
        const removeFreopen = coverBoolean(
          defaultOptions.removeFreopen,
          options.removeFreopen,
        )
        logger.debug('removeFreopen:', removeFreopen)

        // resolve removeAssert
        const removeAssert = coverBoolean(
          defaultOptions.removeAssert,
          options.removeAssert,
        )
        logger.debug('removeAssert:', removeAssert)

        // resolve output filepath
        const output: string | null = cover<string | null>(
          copy ? null : path.join(workspace, 'venus.cpp'),
          options.output,
          isNonBlankString,
        )
        logger.debug('output:', output)

        const resolvedOptions: SubCommandGenerateOptions = {
          ...defaultOptions,
          sourceFilepath,
          includes,
          removeComments,
          removeSpaces,
          removeFreopen,
          removeAssert,
          uglify,
          force,
          copy,
          output,
        }

        if (handle != null) {
          await handle(resolvedOptions)
        }
      })

    return command
  }

/**
 * Create GenerateContext
 * @param options
 */
export async function createGenerateContextFromOptions(
  options: SubCommandGenerateOptions,
): Promise<GenerateContext> {
  const context: GenerateContext = {
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    sourceFilepath: options.sourceFilepath,
    includes: options.includes,
    outputFilepath: options.output,
    removeComments: options.removeComments,
    removeSpaces: options.removeSpaces,
    removeFreopen: options.removeFreopen,
    removeAssert: options.removeAssert,
    force: options.force,
    copy: options.copy,
  }
  return context
}
