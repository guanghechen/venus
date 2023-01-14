import { fileSnapshot } from '@guanghechen/helper-jest'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import globby from 'globby'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { COMMAND_NAME, createProgram, execSubCommandInit } from '../src'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('init', function () {
  // clear output directory before run test
  const outputWorkspace = absoluteOfWorkspace(__dirname, '__tmp__/simple')
  if (fs.existsSync(outputWorkspace))
    fs.rmSync(outputWorkspace, { recursive: true })

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
        await globby.globby(['*', '**/*'], {
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
