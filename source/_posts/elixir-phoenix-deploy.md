---
title: elixir phoenix 应用原生发布
date: 2025-12-01 08:16:10
tags:
  - elixir
---

[参考地址](https://hexdocs.pm/phoenix/deployment.html)

## 例子

```sh
mix deps.get --only prod
MIX_ENV=prod mix compile

MIX_ENV=prod mix assets.deploy
# MIX_ENV=prod mix ecto.migrate
MIX_ENV=prod mix release
export SECRET_KEY_BASE=`mix phx.gen.secret` PHX_SERVER=true PHX_HOST="aaa.com" PORT=9876;
_build/prod/rel/web_demo/bin/web_demo start
```
