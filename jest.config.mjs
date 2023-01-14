import { tsMonorepoConfig } from '@guanghechen/jest-config'
import { resolve } from 'import-meta-resolve'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const locatePackageLocation = async (packageName) =>
  url.fileURLToPath(await resolve(packageName, import.meta.url))

export default async function () {
  const baseConfig = await tsMonorepoConfig(__dirname, { useESM: true })
  const chalkLocation = await locatePackageLocation('chalk')

  const config = {
    ...baseConfig,
    extensionsToTreatAsEsm: ['.ts', '.mts'],
    preset: 'ts-jest/presets/default-esm',
    moduleNameMapper: {
      ...baseConfig.moduleNameMapper,
      chalk: chalkLocation,
      '#ansi-styles': path.join(
        chalkLocation.split('chalk')[0],
        'chalk/source/vendor/ansi-styles/index.js',
      ),
      '#supports-color': path.join(
        chalkLocation.split('chalk')[0],
        'chalk/source/vendor/supports-color/index.js',
      ),
    },
    coverageProvider: 'babel',
    coverageThreshold: {
      global: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  }
  return config
}
