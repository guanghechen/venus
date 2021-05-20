import { getDefaultCleanConfig } from '@/config'
import { collectOptionArgs } from '@/util/cli-util'
import type { GlobalConfig } from '@/command'
import type { DefaultCleanConfig, RawDefaultCleanConfig } from '@/config/clean'
import { CleanHandler } from './handler'
import type commander from 'commander'

export default (
  program: commander.Command,
  getRawPartialConfig: (
    specifiedProjectLocatedPath?: string,
  ) => Promise<RawDefaultCleanConfig | undefined>,
  getGlobalConfig: (
    specifiedProjectLocatedPath?: string,
  ) => Promise<GlobalConfig>,
): any => {
  program
    .command(`clean [directory]`)
    .alias('c')
    .option(`-r, --recursive`, `remove all files in the directory recursively.`)
    .option(`-f, --force`, `clean file without confirmation.`)
    .option(
      `-p, --pattern <pattern>`,
      `clean file which should matched the pattern.`,
      collectOptionArgs,
      [],
    )
    .action(async (directory: string | undefined, option) => {
      const projectReferencePath = directory || '.'
      const globalConfig: GlobalConfig = await getGlobalConfig(
        projectReferencePath,
      )
      const rawDefaultConfig: RawDefaultCleanConfig | undefined =
        await getRawPartialConfig(projectReferencePath)
      const defaultConfig: DefaultCleanConfig =
        getDefaultCleanConfig(rawDefaultConfig)

      const handler = new CleanHandler(
        { directory },
        option,
        globalConfig,
        defaultConfig,
      )
      await handler.handle()
    })
}
