import fs from 'fs-extra'
import path from 'path'
import commander from 'commander'
import { GlobalConfig } from '@/command'
import { getDefaultRegisterConfig } from '@/config'
import { DefaultRegisterConfig, RawDefaultRegisterConfig } from '@/config/register'
import { RegisterHandler } from './handler'


export default (program: commander.Command,
                getRawPartialConfig: (specifiedProjectLocatedPath?: string) => Promise<RawDefaultRegisterConfig | undefined>,
                getGlobalConfig: (specifiedProjectLocatedPath?: string) => Promise<GlobalConfig>) => {
  program
    .command(`register <source...>`)
    .option(`-r, --recursive`, `don't use data.`)
    .action(async (sourcePaths: string[], option) => {
      const sourcePathSet: Set<string> = new Set<string>()
      for (let sourcePath of sourcePaths) {
        const projectReferencePath = path.dirname(sourcePath)
        const globalConfig: GlobalConfig = await getGlobalConfig(projectReferencePath)
        const rawDefaultConfig: RawDefaultRegisterConfig | undefined = await getRawPartialConfig(projectReferencePath)
        const defaultConfig: DefaultRegisterConfig = getDefaultRegisterConfig(rawDefaultConfig)

        let absoluteSourcePath = path.resolve(globalConfig.executeDirectory, sourcePath)

        // 如果路径不存在，则尝试添加后缀名
        if (!fs.existsSync(absoluteSourcePath)) {
          if (!path.extname(absoluteSourcePath)) absoluteSourcePath = `${absoluteSourcePath}.cpp`
        }

        // 避免重复的文件创建请求
        if (sourcePathSet.has(absoluteSourcePath)) continue
        sourcePathSet.add(absoluteSourcePath)

        const handler = new RegisterHandler({ absoluteSourcePath }, option, globalConfig, defaultConfig)
        await handler.handle()
      }
    })
}
