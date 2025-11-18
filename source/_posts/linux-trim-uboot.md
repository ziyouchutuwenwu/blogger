---
title: linux 内核裁剪之 uboot
date: 2025-11-18 18:36:03
tags:
  - linux
  - kernel
  - uboot
---

## 步骤

### 准备工作

下载地址

```sh
https://ftp.denx.de/pub/u-boot/u-boot-2023.04.tar.bz2
```

### 编译

```sh
make vexpress_ca9x4_defconfig
make -j$(nproc)
```

### 测试

qemu 加载 uboot 需要用 elf 的格式

bin 格式的没有入口点，适合烧录到板子上

```sh
qemu-system-arm \
  -M vexpress-a9 \
  -m 512M \
  -kernel ~/downloads/u-boot-2023.04/output/u-boot \
  -nographic
```

### 调试

查看变量

```sh
printenv xxx
```

手动执行，比如你定义了 bootcmd

```sh
run bootcmd
```

重启

```sh
reset
```
