---
title: rt-smart
date: 2025-11-17 16:11:48
tags:
  - stm32
  - rt-thread
---

## 说明

整理流程很像 linux, 先 load 内核，再加载 rootfs

## 配置

以 qemu-virt64-aarch64 为例

### 用户态

工具链需要通过编译用户态程序才能导出，有点奇怪

```sh
git clone --depth 1 https://github.com/RT-Thread/userapps.git
cd userapps; source env.sh
cd apps
```

下载工具链

```sh
xmake config --arch=aarch64 -y
```

导出 toolchain 需要先编译

每次修改完应用程序，都需要 xmake 一下

```sh
xmake
```

toolchain 在 `apps/build/packages` 下

sdk 在`apps/build/sdk` 下

```sh
xmake smart-rootfs --export=all
```

生成 rootfs，执行以后，在 `apps/build/` 下

如果需要把 zig 编译的程序放进去，可以放在这个里面, 实际测试，运行会崩溃

```sh
xmake smart-rootfs
```

生成磁盘镜像

```sh
xmake smart-image -f ext4
```

### 内核

toolchain 在 `userapps/apps/build/packages` 里面，复制出来

```sh
export RTT_CC="gcc"
export RTT_EXEC_PATH="./toolchain/bin/"
export RTT_CC_PREFIX="aarch64-linux-musleabi-"
export PATH="$RTT_EXEC_PATH:$PATH"
```

编译内核

```sh
git clone --depth 1 https://github.com/RT-Thread/rt-thread
cd rt-thread/bsp/qemu-virt64-aarch64/
scons --menuconfig
```

```sh
RT-Thread Kernel --->
  [*] Enable RT-Thread Smart (microkernel on kernel/userland)

RT-Thread online packages  --->
  system packages  --->
    [*] lwext4: an excellent choice of ext2/3/4 filesystem for microcontrol
```

```sh
source ~/.env/env.sh
pkgs --update

scons -c; scons
# scons --dist
```

### 运行

```sh
cp ext4.img ../../../rt-thread/bsp/qemu-virt64-aarch64/
```

修改 qemu.sh 里面的 sd.bin 为 ext4.img

参考[这里](https://github.com/RT-Thread/userapps)最后生成 prebuilt 的部分里面的 run.sh
