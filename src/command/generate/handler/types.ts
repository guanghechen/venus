export interface GenerateArgument {
  readonly sourcePath: string
  readonly targetPath?: string
}

export interface GenerateOption {
  readonly copy?: boolean
  readonly force?: boolean
  readonly outputDirectory?: string
  readonly removeComments?: boolean
  readonly removeSpaces?: boolean
  readonly removeFreopen?: boolean
  readonly removeAssert?: boolean
  readonly uglify?: boolean
}

export interface GenerateConfig {
  readonly absoluteSourcePath: string
  readonly absoluteOutputPath: string | null
  readonly force: boolean
  readonly copy: boolean
  readonly removeComments: boolean
  readonly removeSpaces: boolean
  readonly removeFreopen: boolean
  readonly removeAssert: boolean
}
