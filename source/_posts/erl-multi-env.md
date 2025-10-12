---
title: erlang 多环境发布
date: 2025-10-12 14:51:01
tags:
---

[参考链接](https://rebar3.org/docs/deployment/releases/)

## 步骤

### 创建项目

```sh
rebar3 new release demo
cd demo/apps/
rebar3 new app demo1
rebar3 new app demo2
```

### rebar 配置

demo1, demo2 等为自动启动的 application

```erlang
% 编译时配置
{erl_opts, [debug_info]}.
{deps, []}.

% 发布时配置
% 默认配置
% release 需要在这里统一配置
{relx, [
    {release, {demo, "0.1.0"}, [
        sasl,
        demo1,
        demo2
    ]},

    {mode, dev}
]}.

% 特定模式的配置，缺乏的从默认发布时配置里面拿
{profiles, [
  {dev,
    [
      {erl_opts, [native, {hipe, [verbose]}, debug_info]},
      {relx, [
        {mode, dev},
        {vm_args_src,    "config/dev/vm.args.src"},
        {sys_config_src, "config/dev/sys.config.src"}]
      }
    ]
  },
  {prod,
    [
      % 编译时就需要 key 文件
      % {erl_opts, [encrypt_debug_info]},
      % 反编译时才需要 key 文件
      % {erl_opts, [debug_info,{debug_info_key,{des3_cbc,"12345"}}]},
      {erl_opts, [no_debug_info]},
      {relx, [
        % 这个参数自动设置 include_erts
        {mode, prod},
        {vm_args_src,    "config/prod/vm.args.src"},
        {sys_config_src, "config/prod/sys.config.src"}]
      }
    ]
  },
  {test,
    [
      {erl_opts, [{native, o3}]},
      {relx, [
        {dev_mode,      false},
        {include_erts,  false},
        {include_src,   false},
        {vm_args_src,    "config/test/vm.args.src"},
        {sys_config_src, "config/test/sys.config.src"}]
      }
    ]
  }
]}.
```

### 发布

生成 release 目录

```sh
REBAR_PROFILE=prod rebar3 release -o ~/downloads
rebar3 as prod release -o ~/downloads
```

### 打包

```sh
REBAR_PROFILE=prod rebar3 tar -o ~/downloads
rebar3 as prod tar -o ~/downloads
```
