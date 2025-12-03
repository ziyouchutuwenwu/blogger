---
title: elixir 之配置文件
date: 2025-12-03 08:08:34
tags:
  - elixir
---

## 说明

1. runtime 为运行时会调用的配置文件, 其它为编译期调用的配置
2. 固定的配置写在 dev/prod 等里面
3. 动态配置，写在 runtime 里面，如果 runtime 里面没有，则从 dev/prod 里面去取

## 例子

### 目录结构

```sh
lib
└── demo.exs
config
├── config.exs
├── dev.exs
├── test.exs
├── prod.exs
└── runtime.exs
```

### 配置

config.exs

```elixir
import Config

config :demo, mode: config_env()
import_config "#{config_env()}.exs"
```

dev.exs

```elixir
import Config

config :demo,
  aaa: "aaa in dev",
  bbb: "bbb in dev"

config :demo, MyModule,
  ccc: "ccc in dev",
  ddd: "ddd in dev"
```

test.exs

```elixir
import Config

config :demo,
  aaa: "aaa in test",
  bbb: "bbb in test"

config :demo, MyModule,
  ccc: "ccc in test",
  ddd: "ddd in test"
```

prod.exs

```elixir
import Config

config :demo,
  aaa: "aaa in prod",
  bbb: "bbb in prod"

config :demo, MyModule,
  ccc: "ccc in prod",
  ddd: "ddd in prod"
```

runtime.exs

```elixir
import Config

# 这个只能用于配置文件，代码内不能使用这个方式动态处理代码
if config_env() == :prod do
  config :demo,
    aaa: System.get_env("AAA") || "aaa in runtime"
end
```

### 测试

```sh
MIX_ENV=prod iex -S mix
```

```elixir
Application.fetch_env!(:demo, :aaa)
Application.get_env(:demo, :bbb)

[ccc: ccc_value, ddd: ddd_value] = Application.get_env(:demo, MyModule)
```

### 备注

如果需要在运行的时候获取当前模式

```elixir
if Application.get_env(:demo, :mode) === :prod do
  xxxx
end
```
