import fs from 'fs-extra'
import path from 'path'
import commander from 'commander'
import { GlobalConfig } from '@/command'
import { getDefaultRemoveConfig } from '@/config'
import { DefaultRemoveConfig, RawDefaultRemoveConfig } from '@/config/remove'
import { RemoveHandler } from './handler'


export default (program: commander.Command,
                getRawPartialConfig: (specifiedProjectLocatedPath?: string) => Promise<RawDefaultRemoveConfig | undefined>,
                getGlobalConfig: (specifiedProjectLocatedPath?: string) => Promise<GlobalConfig>) => {
  program
    .command(`remove <source...>`)
    .option(`-r, --recursive`, `remove all files in the directory recursively.`)
    .option(`-f, --force`, `remove file without confirmation.`)
    .action(async (sourcePaths: string[], option) => {
      const sourcePathSet: Set<string> = new Set<string>()
      for (let sourcePath of sourcePaths) {
        const projectReferencePath = path.dirname(sourcePath)
        const globalConfig: GlobalConfig = await getGlobalConfig(projectReferencePath)
        const rawDefaultConfig: RawDefaultRemoveConfig | undefined = await getRawPartialConfig(projectReferencePath)
        const defaultConfig: DefaultRemoveConfig = getDefaultRemoveConfig(rawDefaultConfig)

        let absoluteSourcePath = path.resolve(globalConfig.executeDirectory, sourcePath)

        // 如果路径不存在，则尝试添加后缀名
        if (!fs.existsSync(absoluteSourcePath)) {
          if (!path.extname(absoluteSourcePath)) absoluteSourcePath = `${absoluteSourcePath}.cpp`
        }

        // 避免重复的文件创建请求
        if (sourcePathSet.has(absoluteSourcePath)) continue
        sourcePathSet.add(absoluteSourcePath)

        const handler = new RemoveHandler({ absoluteSourcePath }, option, globalConfig, defaultConfig)
        await handler.handle()
      }
    })
}
