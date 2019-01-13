import program from 'commander'
import { logger } from '@/util/logger'
import { doneWithClose } from '@/util/cli-util'
import loadCommand from '@/command'
import manifest from '../package.json'


// 改造 Commander 的 action 方法，使其在执行成功后退出程序（为了退出控制台输入）
(() => {
  const fn = program.Command.prototype as any
  const action = fn.action
  fn.action = function(f: (...args: any[]) => Promise<void>) {
    return action.call(this, doneWithClose(f))
  }
})()


program
  .version(manifest.version)

logger.registerToCommander(program)

loadCommand(program)

program
  .parse(process.argv)
