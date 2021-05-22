import loadCommand from '@/command'
import { registerCommanderOptions } from '@barusu/chalk-logger'
import program from 'commander'
import manifest from '../package.json'

program.version(manifest.version)

registerCommanderOptions(program)

loadCommand(program)

program.parse(process.argv)
