import { createProgram, mountSubCommandGenerate } from '.'

const program = createProgram()

// mount sub-command: generate
mountSubCommandGenerate(program)

program.parse(process.argv)
