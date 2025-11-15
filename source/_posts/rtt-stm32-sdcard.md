---
title: rt-thread 下，配置 stm32 的 sd 卡
date: 2025-11-15 11:37:24
tags:
  - stm32
  - rt-thread
---

## 配置

### cubemx

配置 sdio 接口

```sh
选择 SD 4 bit wide bus，生成代码，复制到项目

cubeMX 里面配置的时候，rcc 需要启用 hse，外部晶震，usb 的时钟需要设置为 48MHZ

复制 main.c 里面的时钟配置到 board.c
```

### Kconfig

```sh
config BSP_USING_SDIO
    bool "Enable sd card"
    select RT_USING_SDIO
    default n
```

### 文件系统

```sh
RT-Thread Components --->
  Device virtual file system --->
    [*]Using device virtual file system
```

配置参数

```sh
[*] Enable elm-chan fatfs
      elm-chan's FatFs, Generic FAT Filesystem Module  --->
        (4096) Maximum sector size to be handled.
```

### libc

```sh
RT-Thread Components --->
  POSIX layer and C standard library --->
    [*] Enable libc APIs from toolchain
```
