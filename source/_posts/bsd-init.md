---
title: bsd 开机启动
date: 2025-10-17 14:52:09
tags:
---

## 说明

启动顺序

```sh
# 自己的启动脚本，需要 chmod a+x
/usr/local/etc/rc.d/

# 最后加载
/etc/rc.local
```

## 分类

### rc 格式

需要符合 rc 格式

```sh
chmod a+x /usr/local/etc/rc.d/*
```

格式如下

```sh
#!/bin/sh
#
# PROVIDE: myapp
# REQUIRE: DAEMON
# KEYWORD: shutdown
#

# 加载预定义变量和函数
. /etc/rc.subr

name="myapp"
rcvar="myapp_enable"
command="/usr/local/bin/myapp"

# 用于重启
procname="/usr/local/bin/myapp"
desc="my custom service"

load_rc_config $name
# 如果变量未定义，则为 NO
: ${myapp_enable:="NO"}

# $1 为启动参数
run_rc_command "$1"
```

### 自定义脚本

```sh
chmod a+x /etc/rc.local
```

标准 shell 格式

```sh
#!/bin/sh -e

. /etc/profile

# nohup xxx > /dev/null 2>&1 &
# screen -dm xxx

/opt/demo/_build/prod/rel/demo/bin/demo daemon

exit 0
```
