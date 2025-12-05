---
title: elixir 项目类型
date: 2025-12-05 07:57:13
tags:
  - elixir
---

## app

带 Application

### 例子

```sh
mix new demo --sup
```

验证

```elixir
Application.started_applications
```

## escript

可执行脚本，需要本机安装 elixir

### 例子

```sh
mix new demo
```

mix.exs

```elixir
def project do
  [
    ...
    escript: escript()
  ]
end

defp escript do
  [
    main_module: DemoApp,
    path: "_build/escripts/aaa",
  ]
end
```

```elixir
defmodule DemoApp do
  require Logger
  def main(args) do
    Logger.debug("args #{inspect(args)}")
  end
end
```

发布

```sh
mix escript.build
```

## lib

默认的项目类型就是 lib

### 例子

```sh
mix new demo
```

## umbrella

项目大了以后，db 和 web 等希望独立出来

### 用法

#### 创建

```sh
mix new umbrella_demo --umbrella
cd umbrella_demo/apps

# 普通子项目
mix new demo1

# phoenix 子项目
mix phx.new.web demo_web
# ecto 子项目
mix phx.new.ecto demo_ecto
```

#### 依赖

共享依赖，放在顶层的 mix.exs

子项目依赖，放在子项目里面的 mix.exs

#### 配置

默认只读取最外层配置，建议拆分

在顶层 config 目录里面拆，具体见配置分离文档

#### app 自启动

需要自动启动的 application, 在子项目的 mix.exs 里面修改
