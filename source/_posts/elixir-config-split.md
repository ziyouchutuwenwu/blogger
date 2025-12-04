---
title: elixir 之配置文件拆分
date: 2025-12-04 08:21:21
tags:
  - elixir
---

## 说明

配置太多，需要拆分

## 目录结构

```sh
├── config.exs
├── dev
│   ├── api.exs
│   └── bot.exs
├── prod
│   └── api.exs
├── runtime
│   └── api.exs
└── test
    └── api.exs
```

config.exs

```elixir
# import_config "#{config_env()}.exs"

# umbrella 项目的话，在顶层 config 目录内拆分
for config <- "#{config_env()}/*.exs" |> Path.expand(__DIR__) |> Path.wildcard() do
  if File.exists?(config) do
    import_config config
  end
end
```
