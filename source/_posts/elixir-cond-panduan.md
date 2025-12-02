---
title: elixir 之 cond 判断
date: 2025-12-02 15:23:10
tags:
  - elixir
---

## 说明

都不支持多 else

匹配条件可以用函数

## 用法

### cond

```elixir
info1 = ""
info2 = ""

cond do
  String.length(info1) !== 0 ->
    "info1 not 0"

  String.length(info2) !== 0 ->
    "info2 not 0"

  String.length(info1) === 0 && String.length(info2) === 0 ->
    "len are 0"

  true ->
    "default"
end
```

### if

```elixir
if String.valid?("aaa") && String.valid?("bbb") do
  "Valid string!"
else
  "Invalid string."
end
```
