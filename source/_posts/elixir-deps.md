---
title: elixir 之添加依赖
date: 2025-12-06 10:06:26
tags:
  - elixir
---

## 说明

可以加载 erlang 的库

## 搜索

```sh
mix hex.search --package nebulex
```

## 用法

加载本地库

```elixir
{:xxx, path: "../xxx"}
```

指定分支

```elixir
{:bumblebee, github: "elixir-nx/bumblebee", branch: "main"}
```

强制使用某个版本

```elixir
{:bumblebee, github: "elixir-nx/bumblebee", branch: "main", override: true}
```

指定环境下加载

```elixir
{:exla, "~> 0.7", only: [:dev, :test]}
```

运行时并不加载

```elixir
{:ex_doc, "~> 0.29", only: :dev, runtime: false}
```
