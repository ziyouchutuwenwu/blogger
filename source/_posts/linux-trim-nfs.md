---
title: linux 内核裁剪之 nfs
date: 2025-11-21 09:20:06
tags:
  - linux
  - kernel
---

## 说明

用于加载文件系统

## 步骤

### 准备工作

启动 nfs 服务，把 `rootfs` 文件夹放到 nfs 的根目录下

### 内核

#### 配置

```sh
make menuconfig
```

```sh
File systems  --->
  [*] Network File Systems  --->
    <*> NFS client support
    <*> NFS client support for NFS version 3
    [*] Root file system on NFS
```

#### 编译

编译结束后，uImage 复制到 tftp 根目录

```sh
make LOADADDR=0x60003000 uImage -j$(nproc)
```

### uboot

#### 环境变量

uboot.env

```sh
ipaddr=10.0.2.222
serverip=10.0.2.1
# 最后的 ip 不能缺
bootargs=root=/dev/nfs rw nfsroot=10.0.2.1:/mnt/nfs/rootfs,nfsvers=3 init=/linuxrc console=ttyAMA0 ip=10.0.2.222
# bootm 中间的 - 不能缺
bootcmd=tftp 0x60003000 uImage; tftp 0x60500000 vexpress-v2p-ca9.dtb; bootm 0x60003000 - 0x60500000
```

#### make

```sh
make -j$(nproc)
```

### 测试

```sh
sudo qemu-system-arm \
  -M vexpress-a9 \
  -m 512M \
  -kernel ~/downloads/u-boot-2023.04/output/u-boot \
  -nographic \
  -netdev bridge,id=net0,br=virbr0 \
  -net nic,netdev=net0
```

手动，支持变量展开，需要用双引号，单引号不支持

```sh
setenv ipaddr 10.0.2.222
setenv serverip 10.0.2.1
setenv bootargs "root=/dev/nfs rw nfsroot=${serverip}:/mnt/nfs/rootfs,nfsvers=3 init=/linuxrc console=ttyAMA0 ip=${ipaddr}"
setenv bootcmd 'tftp 0x60003000 uImage; tftp 0x60500000 vexpress-v2p-ca9.dtb; bootm 0x60003000 - 0x60500000'
saveenv

run bootcmd
```
