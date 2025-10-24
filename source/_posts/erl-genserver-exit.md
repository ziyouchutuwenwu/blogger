---
title: erlang 下 genserver 的 exit
date: 2025-10-21 09:12:29
tags:
  - erlang
---

本质和普通进程一样

## 总结

- 内部 crash
- 设置 `trap_exit`, 并且 `gen_server` 内部处理 `{'EXIT', From , Reason}` 消息

| gen_server 退出原因 | trap_exit  | terminate                                           | 备注                           |
| ------------------- | ---------- | --------------------------------------------------- | ------------------------------ |
| 内部 crash          | true/false | 执行                                                | 普通业务情况下，保证都能被捕获 |
| exit(Pid,kill)      | true/false | 不执行                                              | kill 杀进程是 vm 的保留手段    |
| exit(Pid,Reason)    | true       | 如果内部处理了`{'EXIT', From , Reason}`消息，则执行 | 转换为 handle_info 消息        |
| exit(Pid,Reason)    | false      | 不执行                                              | 同普通 process 一样            |

## 演示代码

```erlang
stop(Reason) ->
  io:format("call bbb stop func ~p ~n", [Reason]),
  gen_server:call(bbb, {stop, Reason}).

handle_call({stop, Reason}, _From, State) ->
  io:format("on handle_call stop by ~p ~n", [Reason]),
  {stop, Reason, ok, State};

handle_info({'EXIT', From , Reason}, State) ->
  io:format("on handle_info 'EXIT' ~p ~p~n", [From, Reason]),
  {stop, Reason, State};
```
