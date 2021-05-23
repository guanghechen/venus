import { createProgram, mountSubCommandGenerate, mountSubCommandInit } from '.'

const program = createProgram()

// mount sub-command: generate
mountSubCommandGenerate(program)

// mount sub-command: init
mountSubCommandInit(program)

program.parse(process.argv)
