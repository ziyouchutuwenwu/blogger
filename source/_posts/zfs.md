---
title: zfs 用法
date: 2025-10-23 09:52:31
tags:
---

每 1tb 的储存空间对应 1gb 的 ram

## 概念

```sh
pool
  虚拟设备
    磁盘设备
```

## 添加硬盘

查看磁盘

```sh
sudo bsdconfig
```

## pool

如果创建带虚拟设备的 pool,每个虚拟设备的子设备数量需要一致

### 说明

创建成功，会自动 mount，如果修改了 mountpoint,开机以后也会自动 mount

| 类型   | 说明                                      |
| ------ | ----------------------------------------- |
| stripe | 1 块即可, 类似 raid0                      |
| mirror | 至少 2 块, 允许坏掉一个硬盘，类似 raid1   |
| raid10 | 至少 4 块                                 |
| raidz1 | 至少 2+1 块，允许坏掉一个硬盘，类似 raid5 |
| raidz2 | 至少 2+2 块，允许坏掉两个硬盘，类似 raid6 |
| raidz3 | 至少 2+3 块，允许坏掉三个硬盘，类似 raid7 |

### 查看 pool

```sh
zpool list
zpool status -v demo
```

### 创建 pool

创建没有 mirror 的 pool

```sh
zpool create -m /mount_demo demo nvd0 nvd1 nvd2
```

带两组 mirror 的 pool， mirror 即为虚拟设备

```sh
zpool create demo mirror nvd0 nvd1 mirror nvd2 nvd3
```

创建 raidz 的 pool

```sh
zpool create demo raidz1 nvd0 nvd1 nvd2
```

### 删除 pool

```sh
zpool destroy demo
```

## 虚拟设备

### 增加虚拟设备

```sh
zpool add demo raidz nvd3 nvd4 nvd5
```

### 删除虚拟设备

```sh
只有log device, cache device 和 mirror device 支持删除， raidz不支持删除
```

## 添加/删除磁盘

### 添加磁盘

支持 mirror 虚拟设备和非虚拟设备的 pool

```sh
zpool create demo nvd0
zpool attach demo nvd0 nvd1
```

### 删除磁盘

```sh
zpool detach demo nvd1
```

## 在线替换

在线替换，支持 raidz, 新盘内不需要放东西

```sh
zpool replace demo nvd3 nvd4
```

## 添加修改 mount 盘

```sh
sudo zpool add demo ada2
sudo zpool remove demo ada1
sudo zpool replace demo nvd3 nvd4
```

## 修改挂载点

```sh
zfs mount
zfs umount -f /mount_demo
mkdir -p /mount_demo1
zfs set mountpoint=/mount_demo1 demo
zfs mount
```

## 快照

```sh
zfs snapshot -r demo@2019-1-6
zfs list -t snapshot
zfs rollback -r demo@2019-1-6
zfs destroy demo@2019-1-6
```

## 备份恢复

### 到文件

```sh
zfs send demo@aaa > xxxx
```

### 本机

```sh
zfs send demo1@aaa | zfs recv demo2@bbb
```

### 远程

```sh
nc -w 120 -l 8023 | zfs receive -F demo2
zfs send demo1@aaa | nc -w 120 127.0.0.1 8023
```
