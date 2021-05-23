<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/venus/tree/main/packages/cli#readme">venus-acm</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/venus-acm">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/venus-acm.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/venus-acm">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/venus-acm.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/venus-acm">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/venus-acm.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/venus-acm"
      />
    </a>
    <a href="https://github.com/rollup/rollup">
      <img
        alt="Rollup Version"
        src="https://img.shields.io/npm/dependency-version/venus-acm/peer/rollup"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


## Why

In ACM competitions or when writing algorithmic questions, usually only a single
file can be submitted to the online judgment system. But there are many mature 
algorithms or data structures that can be used as black-box code (such as 
Binary Search Tree), so you can maintain your own code base and import local 
algorithm codes through the `-I` option of the g++ compiler.

The goal of this project is to parse the cpp source code and replace the source 
code of the local cpp source files with the corresponding `#include` macro 
declarations.


## Install

* npm

  ```bash
  npm install -g venus-acm
  ```

* yarn 

  ```bash
  yarn global add venus-acm
  ```


## Usage

```bash
$ venus --help

Usage: venus-acm [options] [command]

Options:
  -V, --version                                     output the version number
  --log-level <level>                               specify logger's level.
  --log-name <name>                                 specify logger's name.
  --log-mode <'normal' | 'loose'>                   specify logger's name.
  --log-flag <option>                               specify logger' option.
                                                    [[no-]<date|title|colorful|inline>] (default: [])
  --log-filepath <filepath>                         specify logger' output path.
  --log-encoding <encoding>                         specify output file encoding.
  -c, --config-path <configFilepath>                config filepaths (default: [])
  --parastic-config-path <parasticConfigFilepath>   parastic config filepath
  --parastic-config-entry <parasticConfigFilepath>  parastic config filepath
  --encoding <encoding>                             default encoding of files in the workspace
  -h, --help                                        display help for command

Commands:
  generate|g [options] <sourc> [outpu]
  help [command]                                    display help for command
```

### Sub-command `generate`

```bash
$ venus generate --help
Usage: venus-acm generate|g [options] <source filepath> [output filepath]

Options:
  --rc, --remove-comments               remove comments
  --rs, --remove-spaces                 remove spaces
  --rf, --remove-freopen                remove freopen statements
  --ra, --remove-assert                 remove assert statements
  -I, --include <include_directory...>  include directories
  -u, --uglify                          shortcut of --rc --rs.
  -c, --copy                            write generated code into system clipboard
  -f, --force                           force write the generated code into output filepath
  -o, --output <output filepath>        specify the output filepath
  -h, --help                            display help for command
```

* Arguments

  - `<source filepath>`: The entry filepath of cpp source codes.
  - `[output filepath]`: The output filepath that the generated codes writes to.

* Options

## Example

### generate

* Generate codes into a single cpp source file.

  ```bash
  venus generate oj/fake/01.cpp --output venus.cpp
  ```