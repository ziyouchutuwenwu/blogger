---
title: erlang 的 trap_exit
date: 2025-10-20 11:19:50
tags:
  - erlang
---

## 说明

exit(Pid, Msg)

未设置 trap_exit

```sh
不给进程发 Exit 消息, 只执行默认的行为
normal 返回 true
shutdown 模式下，进程退出，返回 true
kill 模式下，进程退出，返回 true
其它模式下，进程退出，返回 true
```

设置 process_flag(trap_exit, true)

```erlang
执行默认的行为的同时，给进程发 Exit 消息
normal 返回 true，发 {'EXIT', _From, normal} 消息, 进程是否退出，看消息处理部分
shutdown 返回 true，发 {'EXIT', _From, shutdown} 消息, 进程是否退出，看消息处理部分
其它模式下，返回 true, 发 {'EXIT', _From, _Msg} 消息, 进程是否退出，看消息处理部分
kill 模式下，返回 true, 不会收到消息，进程直接被系统杀死
```

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
      io:format("~p got exit msg ~p ~p~n", [?MODULE, From, Reason]),
      loop();
    Msg ->
      io:format("~p got other msg ~p~n", [?MODULE, Msg]),
      loop()
  end.
```

测试

```erlang
dist_proc:start().

exit(whereis(dist_proc), normal).
exit(whereis(dist_proc), shutdown).
exit(whereis(dist_proc), xxx).
exit(whereis(dist_proc), kill).

whereis(dist_proc) ! {'EXIT', self(), normal}.
whereis(dist_proc) ! {'EXIT', self(), xxx}.
whereis(dist_proc) ! {'EXIT', self(), kill}.

whereis(dist_proc).
```
