---
title: erlang 之添加依赖
date: 2025-12-06 10:06:30
tags:
  - erlang
---

## 说明

不能加载 elixir 的库

## 用法

### 远程依赖

hex.pm

```erlang
{deps,[
  {jsx, "3.1.0"}
]}.
```

分支

```erlang
{deps, [
  {ets_cache, ".*", {git, "https://github.com/roowe/ets_cache", {branch, "master"}}}
]}.
```

tag

```erlang
{deps, [
  {erlbus, {git, "https://github.com/cabol/erlbus", {tag, "v0.3.0"}}}
]}.
```

### 本地依赖

目录层级

```sh
.
├── demo
│   ├── rebar.config
│   └── src
└── demo_lib
    ├── rebar.config
    └── src
```

```erlang
{deps, [
    {demo_lib, {path, "../demo_lib"}}
]}.

{plugins, [
    rebar3_path_deps
]}.
```
