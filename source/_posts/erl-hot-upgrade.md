---
title: erlang 热更新
date: 2025-10-13 14:28:19
tags:
  - erlang
---

## 说明

依赖于 rebar3 的 appup 插件

## 步骤

### 代码

创建项目

```sh
rebar3 new release demo
```

rebar.config

```erlang
% 编译时配置
{erl_opts, [debug_info]}.
{deps, []}.

% 热更新的插件
{plugins, [rebar3_appup_plugin]}.

{provider_hooks, [
  {pre, [{tar, {appup, tar}}]},
  {post, [
    {compile, {appup, compile}},
    {clean, {appup, clean}}]}
]}.

% 发布时配置
% 默认模式的配置
{relx, [
    {release, {demo, "1.0.0"}, [
        demo,
        sasl
    ]},

    {mode, dev},
    {sys_config, "./config/sys.config"},
    {vm_args, "./config/vm.args"}
]}.

% prod 模式下的特殊配置，其它的配置，从上面的默认模式里面拿
{profiles, [
    {prod, [
        {relx, [
            {mode, prod}
        ]}
    ]}
]}.
```

初始版本

```sh
rebar3 as prod release
rebar3 as prod tar
```

修改版本号

```sh
rebar.config 里面的 release 版本号
多个 .app.src 里面的 vsn 版本号
```

构建新版本

原来 build 过的老的 release 不能删除，这个升级插件至少需要两个版本的 release

```sh
rebar3 as prod release

# 生成 appup 文件
rebar3 as prod appup generate
rebar3 as prod relup -n demo -v 2.0.0
rebar3 as prod tar
```

### 测试

1.0.0 的压缩包先解压，然后运行

```sh
bin/demo console
```

一定要注意，新版本的存放目录

```sh
cp ../demo-2.0.0.tar.gz ./releases/
bin/demo upgrade 2.0.0
bin/demo versions
bin/demo attach
application:which_applications().
```

降级

```sh
bin/demo downgrade 1.0.0
bin/demo uninstall 2.0.0
```
