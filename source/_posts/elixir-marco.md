---
title: elixir 之宏
date: 2025-12-08 08:37:41
tags:
  - elixir
---

## 关键字

### require

```sh
导入宏, 否则不能调用宏的方法
```

### use

给模块动态增加方法

相当于

```sh
require XXX
XXX.__using__
```

### quote

生成当前表达式的语法树，必须要在 defmacro 语句的里面才能用

### unquote

说明

```sh
把 语法树转换为实际表达式，一般和 `quote` 一起组合成为新的 ast，必须在宏里面才能用
```

使用场景

```sh
defmacro 关键字修饰的函数参数，如果要使用它作为变量，则需要 `unquote`
```

## 宏调试

### 例子

```elixir
defmodule SimpleMacro do
  defmacro plus(ast_x, ast_y) do
    quote do
      unquote(ast_x) + unquote(ast_y)
    end
  end
end

ast =
  quote do
    SimpleMacro.plus(x, 23)
  end
ast |> Macro.expand(__ENV__) |> Macro.to_string
```

## 基础用法

### 普通例子

```elixir
defmodule DemoMacro do
  defmacro plus(ast_x, ast_y) do
    quote do
      unquote(ast_x) + unquote(ast_y)
    end
  end
end
```

测试

```elixir
require DemoMacro
DemoMacro.plus(11,22)
```

### bind_quoted

bind_quoted 绑定的值会保持不变

代码如下

```elixir
defmodule DemoMacro do
  require Logger

  defmacro double_puts(expr) do
    quote do
      Logger.debug(unquote(expr))
      Logger.debug(unquote(expr))
    end
  end
end
```

```elixir
defmodule DemoMacro do
  require Logger

  defmacro double_puts(expr) do
    quote bind_quoted: [aaa: expr] do
      Logger.debug(aaa)
    end
  end
end
```

测试

```elixir
require DemoMacro
DemoMacro.double_puts(:os.system_time)
```

## 使用场景

[参考链接](https://blog.appsignal.com/2021/10/26/how-to-use-macros-in-elixir.html)

### 动态添加方法和属性

use 模块除了在模块调用 `__using__` 宏外, 不做其他任何事情

注意 `require` 的位置

```elixir
defmodule DemoMacro do
  defmacro demo(name) do
    quote do
      unquote(name) <> ", " <> "in DemoMacro"
    end
  end
end

defmodule DemoUsing do
  defmacro __using__(opts) do
    params = Keyword.get(opts, :aaa, "default params")

    quote do
      require DemoMacro
      def demo(name) do
        value = "value from " <> unquote(params) <> ", " <> name
        DemoMacro.demo(value)
      end
    end
  end
end

defmodule Demo do
  use DemoUsing, aaa: "123"
end
```

测试

```elixir
Demo.demo("me")
```

### 方法重写

```elixir
defmodule DemoUsing do
  defmacro __using__(_opts) do

    quote do
      def test1(x, y) do
        x + y
      end

      def test2(x, y) do
        x - y
      end
      defoverridable test1: 2, test2: 2
    end
  end
end

defmodule Demo do
  use DemoUsing

  def test1(x, y) do
    # 调用默认实现
    super(x, y)
  end

  def test2(x, y) do
    x * y * y
  end
end
```

测试

```elixir
Demo.test1(11, 22)
Demo.test2(11, 22)
```

### behaviour 重写

```elixir
defmodule DemoBehaviour do
  @callback demo(number(), number()) :: number()
end

# defoverridable 使用 Behaviour 当参数的时候，所有 callback 都可以被 override
defmodule DemoUsing do
  require Logger

  defmacro __using__(_opts) do

    quote do
      @behaviour DemoBehaviour
      def demo(x, y) do
        Logger.debug("default in DemoBehaviour")
        x + y
      end

      defoverridable DemoBehaviour
    end
  end
end

defmodule Demo do
  require Logger
  use DemoUsing

  def demo(x, y) do
    # super(x, y)
    Logger.debug("override in DemoBehaviour")
    x * y
  end
end
```

测试

```elixir
Demo.demo(11, 22)
```

### 动态生成常量

模块编译完成以后，会打印 ["henry", "john"]

```elixir
defmodule DemoMacro do
  defmacro add(name) do
    quote do
      @names unquote(name)
      :ok
    end
  end
end

defmodule Demo do
  require DemoMacro
  import DemoMacro

  Module.register_attribute(__MODULE__, :names, accumulate: true)

  add "john"
  add "henry"

  IO.inspect(@names)
end
```

### 修改属性

```elixir
defmodule DemoUsing do
  defmacro __using__(_) do
    quote do
      Module.register_attribute(__MODULE__, :xxx, accumulate: true)
    end
  end

  defmacro show(name) do
    quote do
      IO.inspect("#{unquote(name)} #{@xxx}")
    end
  end
end

defmodule Demo do
  use DemoUsing

  @xxx "测试"

  def aaa() do
    DemoUsing.show("123")
  end
end
```

### 编译期 hook

```elixir
defmodule DemoUsing do
  defmacro __using__(_) do
    quote do
      @before_compile unquote(__MODULE__)
    end
  end

  defmacro __before_compile__(env) do
    IO.inspect(env)
    nil
  end
end

defmodule Demo do
  use DemoUsing
end
```

### 模拟 test

```elixir
defmodule Calculator do
  def add(a, b), do: a + b
  def subtract(a, b), do: a - b
end

defmodule TestCase do
  defmacro __using__(_) do
    quote do
      require Logger
      import TestCase
      Module.register_attribute(__MODULE__, :tests, accumulate: true)
      @before_compile unquote(__MODULE__)
    end
  end

  defmacro __before_compile__(_env) do
    # Inject a run function into the test case after all tests have been accumulated
    quote do
      def run do
        Enum.each @tests, fn test_name ->
          result = apply(__MODULE__, test_name, [])
          state = if result, do: "pass", else: "fail"
          Logger.debug("#{test_name} => #{state}")
        end
      end
    end
  end

  defmacro test(description, do: body) do
    test_name = String.to_atom(description)
    quote do
      @tests unquote(test_name)
      def unquote(test_name)(), do: unquote(body)
    end
  end
end

defmodule CalculatorTest do
  use TestCase
  import Calculator

  test "add 1, 2 should return 3" do
    add(1, 2) == 3
  end

  test "subtract 5, 2 should not return 4" do
    subtract(5, 2) == 4
  end
end

CalculatorTest.run
```
