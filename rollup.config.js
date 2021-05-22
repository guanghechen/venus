import createRollupConfig from '@guanghechen/rollup-config-cli'
import manifest from './package.json'

async function rollupConfig() {
  const config = createRollupConfig({
    manifest,
    pluginOptions: {
      typescriptOptions: { tsconfig: 'tsconfig.src.json' },
    },
    resources: {
      copyOnce: true,
      verbose: true,
      targets: [
        {
          src: 'src/resources',
          dest: 'lib/resources',
        },
      ],
    },
    targets: [{ src: 'src/cli.ts', target: 'lib/cjs/cli.js' }],
  })
  return config
}

export default rollupConfig()
