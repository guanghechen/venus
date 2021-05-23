import { fileSnapshot } from '@guanghechen/jest-helper'
import fs from 'fs-extra'
import path from 'path'
import { COMMAND_NAME, createProgram, execSubCommandGenerate } from '../src'

const removeFiles = (dirpath: string, filenames: string[]): void => {
  for (const filename of filenames) {
    const filepath = path.join(dirpath, filename)
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }
  }
}

describe('simple', function () {
  const caseRoot = path.join(__dirname, 'fixtures/simple')
  const sourceFilepath = path.resolve(caseRoot, 'oj/fake/01.cpp')
  const outputFilenames: string[] = ['venus.cpp']

  afterEach(() => {
    removeFiles(caseRoot, outputFilenames)
  })

  test('basic', async function () {
    const program = createProgram()
    const args = ['', COMMAND_NAME, 'generate', sourceFilepath]
    await execSubCommandGenerate(program, args)
    fileSnapshot(caseRoot, outputFilenames)
  })

  test('uglify', async function () {
    const program = createProgram()
    const args = ['', COMMAND_NAME, 'generate', sourceFilepath, '--uglify']
    await execSubCommandGenerate(program, args)
    fileSnapshot(caseRoot, outputFilenames)
  })
})
