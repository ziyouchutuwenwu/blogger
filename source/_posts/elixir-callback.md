---
title: elixir 通过函数回调
date: 2025-11-26 14:14:27
tags:
  - elixir
---

## 用法

### 匿名函数

```elixir
require Logger
sum = &(&1 + &2 + &3 + &4)
result = sum.(1, 2, 3, 4)
Logger.debug(result)
```

等同于

```elixir
Logger.debug

def sum(a, b, c , d) do
  a + b + c + d
end

result = sum(1, 2, 3, 4)
Logger.debug(result)
```

### 直接调用

`&模块名字.方法名/参数个数`

```elixir
&__MODULE__.demo_func_name/1
```

例如

```elixir
demo_func = &demo_module_name.demo_func_name/1
demo_func.(123)
```

官方例子

```elixir
defmodule Demo do
  require Logger

  def check_length(text)do
    Logger.debug(text)
    String.length(text) === 3
  end
end
Enum.any?(["foo", "bar", "hello"], &Demo.check_length/1)
```

### apply 法

```elixir
apply(__MODULE__, :demo_func_name, [123])
```

如果模块名为 string

```elixir
module_atom = String.to_existing_atom("Elixir.Demo")
apply(module_atom, :on_data, [data])
```
