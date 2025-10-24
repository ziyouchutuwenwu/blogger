---
title: freebsd 开机启动配置文件
date: 2025-10-24 10:48:53
tags:
  - freebsd
---

## 说明

里面有一些 xxx_enable 字段

都可以用类似如下的方式修改

```sh
sysrc -f /etc/rc.conf kld_list="i915kms"
```

加载顺序如下

```sh
/etc/rc.conf

# 自己的全局配置，覆盖默认
/etc/rc.conf.local
# 拆分出来的配置
/usr/local/etc/rc.conf.d/
```

这些字段在如下两个目录内的脚本内搜索

```sh
/etc/rc.d/
/usr/local/etc/rc.d/
```
