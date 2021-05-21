import createRollupConfig from '@guanghechen/rollup-config'
import manifest from './package.json'

process.env.ROLLUP_SHOULD_SOURCEMAP = false

async function rollupConfig() {
  const config = [
    createRollupConfig({
      manifest,
      pluginOptions: {
        commonjsOptions: {
          sourceMap: false,
        },
        typescriptOptions: {
          tsconfig: 'tsconfig.src.json',
          tsconfigOverride: {
            compilerOptions: {
              removeComments: false,
              emitDeclarationOnly: true,
            },
          },
        },
      },
    }),
    createRollupConfig({
      manifest,
      pluginOptions: {
        commonjsOptions: {
          sourceMap: false,
        },
        typescriptOptions: {
          tsconfig: 'tsconfig.src.json',
          tsconfigOverride: {
            compilerOptions: {
              declaration: false,
              declarationMap: false,
              declarationDir: null,
              removeComments: true,
            },
          },
        },
      },
    }),
  ]
  return config
}

export default rollupConfig()
