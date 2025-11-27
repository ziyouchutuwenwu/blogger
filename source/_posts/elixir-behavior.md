---
title: elixir 之 behavior
date: 2025-11-27 11:06:44
tags:
  - elixir
---

## 说明

类似面向对象的接口

## 例子

```elixir
defmodule Demo do
  defmodule IDemoBehaviour do
    @callback say_hello(name :: String.Chars.t()) :: atom()
    @callback say_bye(name :: String.Chars.t()) :: atom()
  end
end

defmodule Demo1 do
  @behaviour Demo.IDemoBehaviour
  require Logger

  def say_hello(name) do
    Logger.debug("say_hello in demo1 " <> name)
  end

  def say_bye(name) do
    Logger.debug("say_bye in demo1 " <> name)
  end
end

defmodule Demo2 do
  @behaviour Demo.IDemoBehaviour
  require Logger

  # @impl true 主要用于静态分析器
  # 其修饰的方法必须在 behaviour 里面存在，否则会警告
  @impl true
  def say_hello(name) do
    Logger.debug"say_hello in demo2 " <> name)
  end

  # 一个方法用 @impl 修饰了，其它的也必须用 @impl 修饰，否则会警告
  @impl Demo.IDemoBehaviour
  def say_bye(name) do
    Logger.debug("say_bye in demo2 " <> name)
  end
end
```

测试

```elixir
Demo1.say_hello("root")
Demo1.say_bye("root")

Demo2.say_hello("root")
Demo2.say_bye("root")
```
