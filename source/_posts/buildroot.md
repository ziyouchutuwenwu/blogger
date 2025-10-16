---
title: buildroot 基础用法
date: 2025-10-16 16:00:27
tags:
---

## 准备

```sh
https://buildroot.org/downloads/buildroot-2025.02.3.tar.gz
```

## 配置

### defconfig

```sh
make O=output qemu_arm_vexpress_defconfig
```

### menuconfig

```sh
make O=output menuconfig
```

```sh
Bootloaders  --->
  [*] U-Boot
  (vexpress_ca9x4) Board defconfig
  U-Boot binary format  --->
    [*] u-boot

Target packages  --->
  # 这个要选中，不然 vim 和 bash 都看不到
  [*]   Show packages that are also provided by busybox
    Development tools  --->
    # gnu sed，自带的不标准，elixir 会报错
    [*] sed

    # sh 对标准的支持太差
    Shell and utilities  --->
      [*] bash
    Text editors and viewers  --->
      [*] vim
```

### 编译

```sh
make O=output -j$(nproc)
```

编译结果在 `output/images` 下
