import createRollupConfig from '@guanghechen/rollup-config-cli'
import replace from '@rollup/plugin-replace'
import path from 'node:path'

export default async function () {
  const { default: manifest } = await import(path.resolve('package.json'), {
    assert: { type: 'json' },
  })
  const config = await createRollupConfig({
    manifest,
    pluginOptions: {
      typescriptOptions: { tsconfig: 'tsconfig.src.json' },
    },
    additionalPlugins: [
      replace({
        include: ['src/cli.ts'],
        delimiters: ['', ''],
        preventAssignment: true,
        values: {
          [`} from '.';`]: `} from './index.mjs';`,
        },
      }),
      replace({
        include: ['src/**/*'],
        delimiters: ['', ''],
        preventAssignment: true,
        values: {
          [` from '${manifest.name}/package.json'`]: ` from '../../package.json'`,
        },
      }),
    ],
    targets: [
      {
        format: 'module',
        src: 'src/cli.ts',
        target: 'lib/esm/cli.mjs',
      },
    ],
    resources: {
      copyOnce: true,
      verbose: true,
      targets: [
        {
          src: 'src/config/*',
          dest: 'lib/config',
        },
        {
          src: 'src/resources/',
          dest: 'lib/',
        },
      ],
    },
  })
  return config
}
