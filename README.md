# 前言
这个命令行工具是为热爱 acm 的同学定制的，它只为解决一个问题：在本地直接引用自己写好的数据结构、算法，而不必丑陋的复制粘贴，在提交代码的时候，通过执行此命令行工具，将所有的依赖都写入到一个文件中。
使用本工具需要一个条件，就是需要在工程中定义一个 CMakeLists.txt，你可以在 [demo](https://raw.githubusercontent.com/lemon-clown/venus/master/demo) 中查看，强烈建议使用 CLion 构建工程，事实上，本工具就是基于本人
在 CLion 中的使用设计的：
* 在 CLion 的 `File -> Settings -> Tools -> Terminal` 的 `Shell Path` 中填上 `'<your git installer path>/bin/sh.exe' --login -i`，它可以让在 Clion 下方的 Terminal 中直接使用 shell （此命令行工具需要在 shell 环境下执行）
* 在你新建的工程中 `Edit Configurations -> Templates -> Application` 的 `Working directory` 中填入当前工程的根路径
* 在工程中新建 `CMakeLists.txt`，填入 [demo](https://raw.githubusercontent.com/lemon-clown/venus/master/demo/CMakeLists.txt) 中的内容，强烈建议你构造形如 [demo](https://raw.githubusercontent.com/lemon-clown/venus/master/demo) 中的结构
* 每次新建文件时，通过 `create/new` 子命令创建，可以将当前文件在 `CMakeLists.txt` 中注册一个 `add_executable` 字段，然后就可以直接 CLion 中调试、运行新创建的文件了
* 在需要提交的时候，通过 `generate` 子命令生成拥有所有依赖的外部文件的单一源文件（你可以通过一些压缩选项来压缩代码的大小）

# 安装
```shell
npm install -g venus-acm
```

# 使用
执行 `venus --help` 可以看到命令的用法：
```shell

  Usage: main [options] [command]


  Options:

    -V, --version                    output the version number
    --log-level <level>              index logger's level.
    --log-option <option>            index logger' option. (date,colorful)
    --cmake-lists <cmakeLists-name>  index cmakeLists name. (default is CMakeLists.txt)
    --encoding <encoding>            index encoding of all files.
    --config-path <config-path>      index config path, related with the project root directory where the CMakeLists.txt exists.
    --no-config                      don't use config.
    -h, --help                       output usage information


  Commands:

    generate [options] <source> [target]
    create|new [options] [source...]
    register [options] <source...>
    remove [options] <source...>
```

其中 `Commands` 下方的是子命令，见下文；同时，需要注意的是，你可以通过在工程根目录下指定一个 `venus.config.yml` 来定义命令选项的默认值，见 [demo](https://raw.githubusercontent.com/lemon-clown/venus/master/demo/venus.config.yml)

## 命令选项
* `--version`: 显示命令的版本
* `--log-level <level>`: 指定输出的日志级别，可选值有 [ `debug`, `verbose`, `info`, `warn`, `error` ]，默认值为 `info`
* `--log-option <option>`: 指定输出的日志选项，可选值有 [ `date`, `colorful` ]
* `--cmake-lists <cmakeLists-name>`: 指定 `CMakeLists.txt` 名称，默认值为 `CMakeLists.txt`，
* `--encoding <encoding>`: 指定工程下文件的默认编码格式
* `--config-path <config-path>`: 指定配置文件所在的路径（相对于工程的根目录），默认值为 `venus.config.yml`，
* `--no-config`: 不使用配置文件
* `--help`: 显示命令的帮助


# 子命令 generate
执行 `venus generate --help` 可以看到 `generate` 的用法：
```shell
  Usage: generate [options] <source> [target]


  Options:

    -d, --output-directory <output-directory>  specify output directory, related with the project root directory where the CMakeLists.txt exists.
    --rc, --remove-comments                    remove comments.
    --rs, --remove-spaces                      remove spaces.
    --rf, --remove-freopen                     remove freopen statements.
    -u, --uglify                               shortcut of --rc --rs.
    -c, --copy                                 copy to system clipboard, this option will invalidate the output options: '-f', -d' and '-p'.
    -f, --force                                if the target file is exists, overwrite it without confirmation.
    -h, --help                                 output usage information
```

其中 `source` 为你需要打包的文件的路径，`target` 为打包后的文件名，若不指定则为生成一个默认的名称

## 命令选项
* `--output-directory <output-directory>`: 指定输出目录，路径相对于工程的根目录
* `--remove-comments`: 删除源码中所有的注释（请放心使用，它不会删除正常的输出中的形如 `printf("/*  */")` 的代码）
* `--remove-spaces`: 删除源码中所有多余的空格（请放心使用，它不会删除正常的输出中的形如 `printf("  ")` 的代码）
* `--remove-freopen`: 删除源码中的 freopen 代码
* `--uglify`: 相当于同时指定 `--remove-comments` 和 `--remove-spaces`
* `--copy`: 不将打包后的内容输出的文件，而是输出到系统剪切板中，若指定该选项，则 `--outputDirectory` 和 `target` 都将失效
* `--force`: 当输出文件已存在时，会在命令行中发起一个确认删除的交互，若指定该选项，则将无需确认就覆盖掉文件
* `--help`: 显示命令的帮助

# 子命令 create/new
`venus new` 和 `venus create` 是完全等价的命令，执行 `venus create --help` 可以看到 `create/new` 的用法：
```shell
  Usage: create|new [options] [source...]


  Options:

    -t, --template-path [template-path]                  specify template path, related with the project root directory where the CMakeLists.txt exists.
    -T, --no-template                                    don't use template.
    -d, --data-path [template-path]                      specify data path, related with sourcePath
    -D, --no-data                                        don't use data.
    -c, --contest <contest-phase>                        specify contest which defined in config.
    -r, --round <contest-round>                          specify contest round, valid only when the option '-c' specified..
    -p, --problem-number <contest-round-problem-number>  specify contest round's problem number, valid only when the option '-c' specified..
    -h, --help                                           output usage information
```

这个命令用于创建新的程序文件，其中，`source` 是待创建的文件列表。

## 命令选项
* `--template-path [template-path]`: 指定模板的路径
* `--no-template`: 不使用模板
* `--data-path`: 数据文件的路径
* `--no-data`: 不生成 `data.in`，（之所以这么古怪，是因为本工具使用了 `commander.js`，目前版本的 `commander.js` 有一个 bug，若同时声明了 `--data` 和 `--no-data` 选项，则后声明的将覆盖掉之前声明的，目前 `commander.js` 将这 bug 的修复放入了下一个大版本更新计划中，此后本人将会做更新；由于本人擅自认为使用 `freopen` 是更常用的场景（且 generate 时会自动移除掉），因此目前只提供 `--no-data` 选项
* `--contest <contest-phase`: 解释比较复杂，试试在 [demo](https://raw.githubusercontent.com/lemon-clown/venus/master/demo) 中执行 `venus create --contest=codeforces --round=512 --problem-number=4`
* `--round <contest-round>`: 指定比赛的场次，和 `--contest` 选项配套使用，不可独立出现，且在指定了 `--contest` 选项时，必须同时也指定此选项
* `--problem-number <contest-round-problem-number>`: 指定本场比赛的题目个数，和 `--contest` 选项配套使用，不可独立出现，且在指定了 `--contest` 选项时，必须同时也指定此选项
* `--help`: 显示命令的帮助

# 子命令 register
执行 `venus register --help` 可以看到 `register` 的用法：
```shell
  Usage: register [options] <source...>


  Options:

    -r, --recursive  don't use data.
    -h, --help       output usage information
```

这个命令用于将一个程序文件 “注册” 进 `CMakeLists.txt` 中，即在 `CMakeLists.txt` 中注册一个 `add_executable` 字段，使得你可以在如 CLion 中调试运行该程序

## 命令选项
* `--recursive`: 当 source 为文件夹时，若指定该选项，则将扫描该文件夹下的整棵目录树
* `--help`: 显示命令的帮助

# 子命令 remove
执行 `venus remove --help` 可以看到 `remove` 的用法：
```shell
  Usage: remove [options] <source...>


  Options:

    -r, --recursive  don't use data.
    -h, --help       output usage information
```

这个命令用于将一个程序文件移除，同时也清理 `CMakeLists.txt` 中的相应 `add_executable` 字段

## 命令选项
* `--recursive`: 当 source 为文件夹时，若指定该选项，则将扫描该文件夹下的整棵目录树
* `--help`: 显示命令的帮助
