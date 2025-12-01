---
title: elixir 之节点可视化
date: 2025-12-01 08:18:10
tags:
  - elixir
---

Phoenix LiveDashboard，从 phoenix 独立出来了

## 步骤

### 安装

```sh
mix escript.install hex plds
```

### 使用

```sh
iex --sname aaa@localhost --cookie 123456
plds server --connect aaa@localhost --cookie 123456 --port 9000 --open
```

注意右上角的节点，别选错了
