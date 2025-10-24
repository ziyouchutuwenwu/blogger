---
title: erlang 之进程监控 monitor
date: 2025-10-19 09:57:52
tags:
  - erlang
---

和 link 的区别，是单向的

## 演示代码

dist_proc.erl

```erlang
-module(dist_proc).

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
  loop().

loop() ->
  receive
    {'EXIT', From, Reason} ->
      io:format("~p got exit msg ~p ~p~n", [?MODULE, From, Reason]);
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
  _Ref = erlang:monitor(process, dist_proc),
  loop().

loop() ->
  receive
    {'DOWN', Ref, process, {Pid, Node}, Reason} ->
      erlang:demonitor(Ref),
      io:format("~p got pid down msg ~p ~p ~p ~n", [?MODULE, Pid, Node, Reason]),
      loop();
    {'EXIT', From, Reason} ->
      io:format("~p got exit msg ~p ~p~n", [?MODULE, From, Reason]);
    Msg ->
      io:format("~p got other msg ~p~n", [?MODULE, Msg]),
      loop()
  end.
```

测试

```erlang
spawn(fun() -> mon_proc:start() end).

exit(whereis(dist_proc), normal).
exit(whereis(dist_proc), shutdown).
exit(whereis(dist_proc), xxx).
exit(whereis(dist_proc), kill).

exit(whereis(mon_proc), shutdown).

whereis(dist_proc) ! {'EXIT', self(), normal}.
whereis(dist_proc) ! {'EXIT', self(), xxx}.
whereis(dist_proc) ! {'EXIT', self(), kill}.

whereis(dist_proc).
whereis(mon_proc).
```
