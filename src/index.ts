import loadCommand from '@/command'
import { doneWithClose } from '@/util/cli'
import { registerCommanderOptions } from '@barusu/chalk-logger'
import program from 'commander'
import manifest from '../package.json'

// 改造 Commander 的 action 方法，使其在执行成功后退出程序（为了退出控制台输入）
{
  const fn = program.Command.prototype as any
  const action = fn.action
  fn.action = function (f: (...args: any[]) => Promise<void>) {
    return action.call(this, doneWithClose(f))
  }
}

program.version(manifest.version)

registerCommanderOptions(program)

loadCommand(program)

program.parse(process.argv)
