---
title: erlang 的进程监控 link
date: 2025-10-18 08:26:50
tags:
  - erlang
---

## 说明

link 是双向的, 任何一个进程挂掉, 另外一个都会受影响

```sh
A 挂掉, B 会检查自己有没有设置 process_flag(trap_exit, true)
如果没有设置, 则也挂掉。
如果设置了, 则在消息循环里面检测 {'EXIT', _From, Msg} 消息, 就算 A 是被 kill 的, 在 B 这里也是收到消息, 不会直接挂掉
```

## 演示代码

dist_proc.erl

```erlang
-module(dist_proc).

-export([start/0]).
-export([init/0]).
-export([loop/0]).

start() ->
  Pid = spawn_link(?MODULE,init,[]),
  register(?MODULE, Pid),
  {ok, Pid}.

init() ->
  io:format("on ~p init ~n", [?MODULE]),
  process_flag(trap_exit, true),
  loop().

loop() ->
  receive
    {'EXIT', From, Reason} ->
      io:format("~p got exit msg ~p ~p~n", [?MODULE, From, Reason]),
      loop();
    Msg ->
      io:format("~p got other msg ~p~n", [?MODULE, Msg]),
      loop()
  end.
```

mon_proc.erl

```erlang
-module(mon_proc).

-export([start/0]).
-export([init/0]).
-export([loop/0]).

start() ->
  Pid = spawn(?MODULE,init,[]),
  register(?MODULE, Pid),
  {ok, Pid}.

init() ->
  io:format("on ~p init ~n", [?MODULE]),
  process_flag(trap_exit, true),
  dist_proc:start(),
  loop().

loop() ->
  receive
    {'EXIT', From, Reason} ->
      io:format("~p got exit msg ~p ~p~n", [?MODULE, From, Reason]),
      loop();
    Msg ->
      io:format("~p got other msg ~p~n", [?MODULE, Msg]),
      loop()
  end.
```

测试

```erlang
mon_proc:start().

exit(whereis(mon_proc), normal).
exit(whereis(mon_proc), shutdown).
exit(whereis(mon_proc), xxx).
exit(whereis(mon_proc), kill).

whereis(mon_proc).
whereis(dist_proc).
```
