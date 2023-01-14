// eslint-disable-next-line import/no-extraneous-dependencies
import manifest from 'venus-acm/package.json'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default function(plop) {
  plop.setGenerator('mock-server', {
    description: 'create mock server',
    prompts: [
      {
        type: 'input',
        name: 'packageName',
        default: path.basename(path.resolve()),
        message: 'package name',
        transform: text => text.trim(),
      },
      {
        type: 'input',
        name: 'encoding',
        default: 'utf-8',
        message: 'encoding',
        transform: text => text.trim(),
      },
      {
        type: 'list',
        name: 'logLevel',
        default: 'verbose',
        message: 'log level',
        choices: ['debug', 'verbose', 'info', 'warn', 'error'],
        filter: text => text.toLowerCase().trim(),
        transformer: text => text.toLowerCase().trim(),
      },
    ],
    actions: function (answers) {
      // eslint-disable-next-line no-param-reassign
      answers.templateVersion = manifest.version

      const workspace = answers.workspace || path.resolve()
      const resolveSourcePath = p => path.normalize(path.resolve(__dirname, p))
      const resolveTargetPath = p => path.normalize(path.resolve(workspace, p))

      return [
        {
          type: 'add',
          path: resolveTargetPath('.vscode/settings.json'),
          templateFile: resolveSourcePath('.vscode/settings.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('oj/fake/01.cpp'),
          templateFile: resolveSourcePath('oj/fake/01.cpp.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('script/run.js'),
          templateFile: resolveSourcePath('script/run.js.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/@guanghechen/algorithm/match-first.hpp'),
          templateFile: resolveSourcePath('src/@guanghechen/algorithm/match-first.hpp.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.clang-format'),
          templateFile: resolveSourcePath('.clang-format.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.editorconfig'),
          templateFile: resolveSourcePath('.editorconfig.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.eslintignore'),
          templateFile: resolveSourcePath('.eslintignore.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.eslintrc'),
          templateFile: resolveSourcePath('.eslintrc.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.gitignore'),
          templateFile: resolveSourcePath('.gitignore.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.prettierignore'),
          templateFile: resolveSourcePath('.prettierignore.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.prettierrc'),
          templateFile: resolveSourcePath('.prettierrc.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('CMakeLists.txt'),
          templateFile: resolveSourcePath('CMakeLists.txt.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('package.json'),
          templateFile: resolveSourcePath('package.json.hbs'),
        },
      ]
    },
  })
}
