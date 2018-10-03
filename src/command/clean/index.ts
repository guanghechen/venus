import path from 'path'
import commander from 'commander'
import { GlobalConfig } from '@/command'
import { getDefaultCleanConfig } from '@/config'
import { DefaultCleanConfig, RawDefaultCleanConfig } from '@/config/clean'
import { CleanHandler } from './handler'
import { collectOptionArgs } from '@/util/cli-util'


export default (program: commander.Command,
                getRawPartialConfig: (specifiedProjectLocatedPath?: string) => Promise<RawDefaultCleanConfig | undefined>,
                getGlobalConfig: (specifiedProjectLocatedPath?: string) => Promise<GlobalConfig>) => {
  program
    .command(`clean [directory]`)
    .option(`-r, --recursive`, `remove all files in the directory recursively.`)
    .option(`-f, --force`, `clean file without confirmation.`)
    .option(`-p, --pattern <pattern>`, `clean file which should matched the pattern.`, collectOptionArgs, [])
    .action(async (directory: string | undefined, option) => {
      const projectReferencePath = path.dirname(directory || '.')
      const globalConfig: GlobalConfig = await getGlobalConfig(projectReferencePath)
      const rawDefaultConfig: RawDefaultCleanConfig | undefined = await getRawPartialConfig(projectReferencePath)
      const defaultConfig: DefaultCleanConfig = getDefaultCleanConfig(rawDefaultConfig)

      const handler = new CleanHandler({ directory }, option, globalConfig, defaultConfig)
      await handler.handle()
    })
}
