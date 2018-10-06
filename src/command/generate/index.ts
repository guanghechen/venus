import path from 'path'
import commander from 'commander'
import { GlobalConfig } from '@/command'
import { getDefaultGenerateConfig } from '@/config'
import { DefaultGenerateConfig, RawDefaultGenerateConfig } from '@/config/generate'
import { GenerateHandler } from './handler'


export default (program: commander.Command,
                getRawPartialConfig: (specifiedProjectLocatedPath?: string) => Promise<RawDefaultGenerateConfig | undefined>,
                getGlobalConfig: (specifiedProjectLocatedPath?: string) => Promise<GlobalConfig>) => {
  program
    .command(`generate <source> [target]`)
    .alias('g')
    .option(`-d, --output-directory <output-directory>`, `specify output directory, related with the project root directory where the CMakeLists.txt exists.`)
    .option(`--rc, --remove-comments`, `remove comments.`)
    .option(`--rs, --remove-spaces`, `remove spaces.`)
    .option(`--rf, --remove-freopen`, `remove freopen statements.`)
    .option(`--ra, --remove-assert`, `remove assert statements.`)
    .option(`-u, --uglify`, `shortcut of --rc --rs.`)
    .option(`-c, --copy`, `copy to system clipboard, this option will invalidate the output options: '-f', -d' and '-p'.`)
    .option(`-f, --force`, `if the target file is exists, overwrite it without confirmation.`)
    .action(async (sourcePath: string, targetPath: string | undefined, option) => {
      const projectReferencePath = path.dirname(sourcePath)
      const globalConfig: GlobalConfig = await getGlobalConfig(projectReferencePath)
      const rawDefaultConfig: RawDefaultGenerateConfig | undefined = await getRawPartialConfig(projectReferencePath)
      const defaultConfig: DefaultGenerateConfig = getDefaultGenerateConfig(rawDefaultConfig)

      // 如果没有指定后缀名，则添加默认后缀名 .cpp
      if (!path.extname(sourcePath)) sourcePath = `${sourcePath}.cpp`

      const handler = new GenerateHandler({ sourcePath, targetPath }, option, globalConfig, defaultConfig)
      await handler.handle()
    })
}