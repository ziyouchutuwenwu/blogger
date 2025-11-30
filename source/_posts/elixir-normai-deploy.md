---
title: elixir 普通应用原生发布
date: 2025-11-30 12:40:05
tags:
  - elixir
---

## 步骤

### 初始化

会创建 rel 文件夹，带 vm 的配置和环境变量

```sh
mix release.init
```

### 指定 release

如果要生成指定的 release 的名字，则修改 mix.exs

一般不需要

```elixir
def project do
  [
    .........
    releases: releases()
  ]
end

defp releases do
  [
    aaa: [
      include_executables_for: [:unix],
      applications: [
        demo1: :permanent,
        demo2: :permanent
      ]
    ]
  ]
end
```

运行

```sh
MIX_ENV=prod mix release
MIX_ENV=prod mix release --overwrite
MIX_ENV=prod mix release aaa
```

### 指定 vm 参数

```sh
export RELEASE_DISTRIBUTION=name
export RELEASE_NODE=aaa@127.0.0.1
export RELEASE_COOKIE=123456
bin/abc start_iex
```

### 发布

最终需要的目录

```sh
_build/prod/rel/$RELEASE_NAME/
```
