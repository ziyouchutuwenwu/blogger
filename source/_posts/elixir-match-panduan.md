---
title: elixir 之 match 判断
date: 2025-12-02 15:23:05
tags:
  - elixir
---

## 说明

都不支持多 else

## 用法

### case

- 待匹配变量必须先定义
- 匹配条件不可以用函数

```elixir
require Logger

case xxx("aaa") do
  "aaa" ->
    Logger.debug("aaa")

  "bbb" ->
    Logger.debug("bbb")
  _ ->
    Logger.debug("default")
end
```

### with

- 链式匹配，所以待匹配变量无需定义
- 如果某个 step 失败，之前的还是会成功执行

```elixir
defmodule WithDemo do
  require Logger

  def demo do
    with {:ok, result1} <- step1(),
         {:ok, result2} <- step2(result1),
         {:ok, result3} <- step3(result2) do
      Logger.debug("final result #{result1 + result2 + result3}")
    else
      {:error, _} ->
        Logger.debug("某些需要匹配的错误")

      _ ->
        Logger.debug("都不匹配，到这里")
    end
  end

  def step1() do
    Logger.debug("in step1")
    {:ok, 111}
  end

  def step2(arg) do
    Logger.debug("in step2 #{inspect(arg)}")
    {:ok, 222}
  end

  def step3(arg) do
    Logger.debug("in step2 #{inspect(arg)}")
    {:ok, 333}
  end
end
```
