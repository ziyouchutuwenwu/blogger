---
title: elixir 发布之参数配置
date: 2025-11-28 11:50:47
tags:
  - elixir
---

## 位置

```sh
$ tree rel
rel
├── env.bat.eex
├── env.sh.eex
├── remote.vm.args.eex
└── vm.args.eex
```

## 说明

### env.sh.eex

release 脚本启动之前，可以执行任何操作

运行期加载环境变量

```elixir
export AAA=<%= System.get_env("ABC") %>
export BBB=12345
```

测试

```sh
mix release
export ABC="asdasd"
_build/dev/rel/demo/bin/demo start_iex
System.get_env("AAA")
System.get_env("ABC")
System.get_env("BBB")
```

### sys.config

改到 config 目录里面去了

### vm.args.eex

配置虚拟机参数，只支持编译期加载环境变量

#### 编译期

默认只能编译期加载

```elixir
-kernel inet_dist_listen_min <%= System.get_env("DIST_PORT") %>
-kernel inet_dist_listen_max <%= System.get_env("DIST_PORT") %>
```

测试

```sh
DIST_PORT=5555 mix release
```

#### 运行期

运行期加载环境变量为 hack 的方式

env.sh.eex

```sh
VERSION_DIR="$(ls "$RELEASE_ROOT/releases/" | head -n1)"
export DIST_PORT="${DIST_PORT:-7878}"
sed -i "s/\${DIST_PORT}/${DIST_PORT}/g" \
  "$RELEASE_ROOT/releases/$VERSION_DIR/vm.args"
```

vm.args.eex

```elixir
-kernel inet_dist_listen_min ${DIST_PORT}
-kernel inet_dist_listen_max ${DIST_PORT}
```

测试

```sh
MIX_ENV=prod mix release
DIST_PORT=5555 _build/prod/rel/demo/bin/demo start_iex
```
