---
title: linux 内核裁剪之 kernel
date: 2025-11-20 07:56:15
tags:
  - linux
  - kernel
---

## 说明

需要编译

```sh
内核
设备树
其它驱动程序
```

## 准备

```sh
https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.10.191.tar.xz
```

## 用法

### 默认配置

```sh
make vexpress_defconfig
```

### menuconfig

```sh
make menuconfig
```

```sh
# 不想要在 rootfs 里面手动 mknod，需要开这个
Device Drivers  --->
  Generic Driver Options  --->
    [*] Maintain a devtmpfs filesystem to mount at /dev
    [*]   Automount devtmpfs at /dev, after the kernel mounted the rootfs
```

### 编译

```sh
make -j$(nproc)
```

## 测试

查看 tty

```sh
cat .config | grep -i tty
```

```sh
CONFIG_CMDLINE="console=ttyAMA0"
```

## 运行

```sh
qemu-system-arm \
  -M vexpress-a9 \
  -m 512M \
  -kernel ~/downloads/linux-5.10.191/output/arch/arm/boot/zImage \
  -dtb ~/downloads/linux-5.10.191/output/arch/arm/boot/dts/vexpress-v2p-ca9.dtb \
  -nographic \
  -append "console=ttyAMA0"
```
