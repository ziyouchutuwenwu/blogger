---
title: elixir 之 protocol
date: 2025-11-27 11:06:50
tags:
  - elixir
---

## 说明

为不同的数据类型定义通用的行为

## 场景

给一些类型增加功能，而不修改原有模块

## 用法

```elixir
defmodule DemoStruct1 do
  defstruct [:aaa, :bbb]

  def new(aaa, bbb) do
    %DemoStruct1{aaa: aaa, bbb: bbb}
  end
end

defmodule DemoStruct2 do
  defstruct [:ccc, :ddd]

  def new(ccc, ddd) do
    %DemoStruct2{ccc: ccc, ddd: ddd}
  end
end
```

```elixir
defprotocol DemoProtocol do
  @fallback_to_any true
  def xxx(struct_obj, source, dest)
end

defimpl DemoProtocol, for: DemoStruct1 do
  require Logger

  def xxx(%DemoStruct1{aaa: aaa, bbb: bbb}, source, dest) do
    info = "第一个 #{inspect(aaa)} #{inspect(bbb)} #{inspect(source)} #{inspect(dest)}"
    Logger.debug(info)
  end
end

defimpl DemoProtocol, for: DemoStruct2 do
  require Logger

  def xxx(%DemoStruct2{ccc: ccc, ddd: ddd}, source, dest) do
    info = "另外一个 #{inspect(ccc)} #{inspect(ddd)} #{inspect(source)} #{inspect(dest)}"
    Logger.debug(info)
  end
end

defimpl DemoProtocol, for: Any do
  require Logger

  def xxx(object, source, dest) do
    info = "any 类型 #{inspect(object)} #{inspect(source)} #{inspect(dest)}"
    Logger.debug(info)
  end
end
```

```elixir
defmodule Demo do
  def demo do
    obj1 = DemoStruct1.new(111, 222)
    DemoProtocol.xxx(obj1, "aaaaaa", "bbbbbbbb")

    obj2 = DemoStruct2.new(333, 444)
    DemoProtocol.xxx(obj2, "yyyyyyyyy", "zzzzzzzzzzzz")

    DemoProtocol.xxx(111, "11111", "22222")
  end
end
```
