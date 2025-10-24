---
title: freebsd 下 jail 用法
date: 2025-10-22 11:17:51
tags:
  - freebsd
---

目前使用 qjail

## 安装

```sh
sudo pkg install -y qjail
axel -o /tmp/ http://mirrors.ustc.edu.cn/freebsd/releases/amd64/13.0-RELEASE/base.txz
sudo qjail install -f /tmp/base.txz
```

## 常规用法

创建

```sh
sudo qjail create -4 192.168.88.123 xxx
```

```sh
sudo qjail list
sudo qjail start xxx
sudo qjail console xxx
sudo qjail stop xxx
```

修改 ip

```sh
sudo qjail config -4 192.168.88.222 xxx
```

允许使用主机网络

```sh
sudo qjail config -k xxx
```

改名字

```sh
sudo qjail config -n demo xxx
```

备份恢复

```sh
sudo qjail archive xxx
sudo qjail delete xxx
sudo qjail restore xxx
```

## 文件复制

具体虚拟机路径

```sh
/usr/jails/xxx
```

模板路径

```sh
/usr/jails/template
```

## 任务管理

```sh
jls 查看任务列表
sudo jexec 1 csh
```
