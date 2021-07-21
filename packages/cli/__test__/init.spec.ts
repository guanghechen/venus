import { absoluteOfWorkspace } from '@guanghechen/file-helper'
import { fileSnapshot } from '@guanghechen/jest-helper'
import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import { COMMAND_NAME, createProgram, execSubCommandInit } from '../src'

describe('init', function () {
  // clear output directory before run test
  const outputWorkspace = absoluteOfWorkspace(__dirname, '__tmp__/simple')
  fs.removeSync(outputWorkspace)

  test(
    'simple',
    async function () {
      const program = createProgram()
      await execSubCommandInit(program, [
        '',
        COMMAND_NAME,
        'init',
        outputWorkspace,
        '--plop-bypass=simple', // select template
        '--plop-bypass=' + path.basename(outputWorkspace), // package name
        '--plop-bypass=utf-8', // encoding
        '--plop-bypass=verbose', // log level
        '--plop-bypass=skip', // skip 'yarn install'
        '--plop-bypass=no', // skip 'git commit'
        '--log-level=warn',
      ])

      // write the outputs to snapshots
      const files = (
        await globby(['*', '**/*'], {
          cwd: outputWorkspace,
          onlyFiles: true,
          expandDirectories: false,
        })
      ).sort()

      fileSnapshot(outputWorkspace, files)
    },
    1000 * 30,
  )
})
