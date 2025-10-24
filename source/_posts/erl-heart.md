---
title: erlang 的 heart 用法
date: 2025-10-15 10:47:30
tags:
  - erlang
---

## 说明

beam 被杀死以后，会重新启动，用于对于稳定性要求很高的场合。

或者先 kill 掉 heart 进程，在 kill 掉 beam 进程

## 激活

### rebar3 项目

vm.args

```sh
# 这个必须设置
-heart

# 不设置 HEART_COMMAND，使用默认重启命令
# 一定要用绝对路径，不然找不到
-env HEART_COMMAND "/xxx/rel/demo_release/bin/demo_release daemon"
-env HEART_BEAT_TIMEOUT 10
```

或者设置环境变量

```sh
export HEART_COMMAND="/xxx/rel/demo_release/bin/demo_release daemon"
export HEART_BEAT_TIMEOUT=10
```

### 原始命令行

#### 方法 1

节点 1

```sh
erl -heart -sname aaa@manjaro -setcookie 123456 \
  -env HEART_COMMAND "erl -heart -sname aaa@manjaro -setcookie 123456" \
  -env HEART_BEAT_TIMEOUT 10
```

节点 2

```erlang
erl -sname bbb@manjaro -setcookie 123456
net_kernel:connect_node('aaa@manjaro').
```

#### 方法 2

节点 1

```sh
export HEART_COMMAND="erl -heart -sname aaa@manjaro -setcookie 123456"
export HEART_BEAT_TIMEOUT=10
erl -heart -sname aaa@manjaro -setcookie 123456
```

节点 2

```erlang
erl -sname bbb@manjaro -setcookie 123456
net_kernel:connect_node('aaa@manjaro').
```

切换到远程节点

```erlang
Ctrl + G
User switch command
 --> r 'aaa@manjaro'
 --> c
```

### 动态修改

```erlang
os:getenv("HEART_COMMAND").
os:getenv("HEART_BEAT_TIMEOUT").

% 获取 HEART_COMMAND 命令
heart:get_cmd().
{ok,"erl -heart"}

% 设置临时 HEART_COMMAND 命令
heart:set_cmd("heart -shutdown").
ok

% 获取 HEART_COMMAND 命令，当临时 HEART_COMMAND 命令设置时取了 临时命令的值
heart:get_cmd().
{ok,"heart -shutdown"}

% 清除临时 HEART_COMMAND 命令
heart:clear_cmd().
ok

% 获取 HEART_COMMAND 命令
heart:get_cmd().
{ok,"erl -heart"}
```

## 关闭

### 正常关闭

如果要关闭，则 remsh 到目标节点，执行

```elixir
:init.stop()
```

### 杀掉

不可以用 pkill, 因为 heart 也是 erl 体系内的

```sh
ps aux | grep erl
kill -9 xxx
```
