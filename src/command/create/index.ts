import _ from 'lodash'
import fs from 'fs-extra'
import path from 'path'
import commander from 'commander'
import { GlobalConfig } from '@/command'
import { getDefaultCreateConfig } from '@/config'
import { DefaultCreateConfig, RawDefaultCreateConfig } from '@/config/create'
import { CreateHandler } from './handler'
import { logger } from '@/util/logger'
import { ensureDirectoryExist } from '@/util/fs-util'
import { relativePath } from '@/util/path-util'
import { coverInteger } from '@/util/option-util'


export default (program: commander.Command,
                getRawPartialConfig: (specifiedProjectLocatedPath?: string) => Promise<RawDefaultCreateConfig | undefined>,
                getGlobalConfig: (specifiedProjectLocatedPath?: string) => Promise<GlobalConfig>) => {
  program
    .command(`create [source...]`)
    .alias('new')
    .option(`-t, --template-path [template-path]`, `specify template path, related with the project root directory where the CMakeLists.txt exists.`)
    .option(`-T, --no-template`, `don't use template.`)
    .option(`-d, --data-path [template-path]`, `specify data path, related with sourcePath`)
    .option(`-D, --no-data`, `don't use data.`)
    .option(`-c, --contest <contest-phase>`, `specify contest which defined in config.`)
    .option(`-r, --round <contest-round>`, `specify contest round, valid only when the option '-c' specified..`)
    .option(`-p, --problem-number <contest-round-problem-number>`, `specify contest round's problem number, valid only when the option '-c' specified..`)
    .action(async (sourcePaths: string[], option) => {
      // 先检查命令行参数是否错误
      // 指定 --contest 时，必须要指定 --round，且 source 必须为空数组；
      // 否则必须不能指定 --round 和 --problem-number，且 source 必须不为空数组

      if (_.isString(option.contest)) {
        if (!_.isString(option.round) || option.round.length <=0 ) {
          logger.error('you have specified contest, but not specified a valid round.')
          process.exit(-1)
        }

        if (_.isArray(sourcePaths) && sourcePaths.length > 0) {
          logger.warn(`you have specified the --contest option, the source-paths(${sourcePaths}) will be ignored.`)
        }

        // 将 contest 转换为 sourceLists
        const { executeDirectory, projectRootDirectory } = await getGlobalConfig()
        const rawDefaultConfig: RawDefaultCreateConfig | undefined = await getRawPartialConfig()
        const defaultConfig: DefaultCreateConfig = getDefaultCreateConfig(rawDefaultConfig)
        if (defaultConfig.categories[option.contest] == null) {
          logger.error(`can't find ${option.contest} in config\'s 'create.categories'.`)
          process.exit(-1)
        }

        let category = defaultConfig.categories[option.contest]
        let contestDirectory = path.resolve(projectRootDirectory, category.dirname)
        await ensureDirectoryExist(contestDirectory, relativePath(executeDirectory, contestDirectory, projectRootDirectory))

        const targetDirectory = path.resolve(contestDirectory, option.round)
        const relativeTargetDirectory = relativePath(executeDirectory, targetDirectory, projectRootDirectory)
        if (fs.existsSync(targetDirectory)) {
          logger.error(`${relativeTargetDirectory} has been existed.`)
          process.exit(-1)
        } else {
          await fs.mkdirp(targetDirectory)
          logger.info(`created directory: ${relativeTargetDirectory}`)
        }

        const problemNumber = coverInteger(category.problemNumber, option.problemNumber)

        sourcePaths = new Array(problemNumber).fill(0).map((x, i) => {
          let name: string = String.fromCodePoint(i % 26 + 65)
          for (i = Math.floor(i / 26); i > 0; i = Math.floor(i / 26))
            name = String.fromCodePoint(i % 26 + 65) + name
          return path.resolve(targetDirectory, name + '.cpp')
        })
      } else {
        if (!_.isArray(sourcePaths) || sourcePaths.length <= 0) {
          logger.error('the command arguments missed, while you haven\'t specified the --contest.')
          process.exit(-1)
        }
        if (_.isString(option.round)) {
          logger.warn('the --round option is invalid, as you haven\'t specified the --contest option')
        }
        if (_.isString(option.problemNumber)) {
          logger.warn('the --problem-number option is invalid, as you haven\'t specified the --contest option')
        }
      }

      const sourcePathSet: Set<string> = new Set<string>()
      for (let sourcePath of sourcePaths) {
        const projectReferencePath = path.dirname(sourcePath)
        const globalConfig: GlobalConfig = await getGlobalConfig(projectReferencePath)
        const rawDefaultConfig: RawDefaultCreateConfig | undefined = await getRawPartialConfig(projectReferencePath)
        const defaultConfig: DefaultCreateConfig = getDefaultCreateConfig(rawDefaultConfig)

        let absoluteSourcePath = path.resolve(globalConfig.executeDirectory, sourcePath)
        // 如果没有指定后缀名，则添加默认后缀名 .cpp
        if (!path.extname(absoluteSourcePath)) absoluteSourcePath = `${absoluteSourcePath}.cpp`

        // 避免重复的文件创建请求
        if (sourcePathSet.has(absoluteSourcePath)) continue
        sourcePathSet.add(absoluteSourcePath)

        const handler = new CreateHandler({ absoluteSourcePath }, option, globalConfig, defaultConfig)
        await handler.handle()
      }
    })
}
