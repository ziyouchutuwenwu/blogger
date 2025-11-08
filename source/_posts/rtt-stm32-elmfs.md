---
title: rtt-stm32-elmfs
date: 2025-11-08 08:52:39
tags:
  - stm32
  - rt-thread
---

elm 文件系统

## 说明

外挂 flash 上的 elm 文件系统

参考的 [这里](https://www.rt-thread.org/document/site/application-note/components/dfs/an0012-dfs/)

## 配置

### 准备

先按照外挂 flash 的配置配置好

### menuconfig

```sh
RT-Thread Components > Device virtual file system  --->
  -*- Using device virtual file system
  [*] Using working directory
  (2) The maximal number of mounted file system
  (2) The maximal number of file system type
  (16) The maximal number of opened files
  [*] Enable elm-chan fatfs
    elm-chan's FatFs, Generic FAT Filesystem Module  --->
      Support long file name (3: LFN with dynamic LFN working buffer on the heap)  --->
        (X) 3: LFN with dynamic LFN working buffer on the heap
      (4096) Maximum sector size to be handled.
      [*] Enable sector erase feature

RT-Thread Components > POSIX layer and C standard library
  [*] Enable libc APIs from toolchain
```

## 代码

w25q128_elmfs_demo.c

```c
#include <fal.h>
#include <dfs_fs.h>
#include <rtdbg.h>

/*
[I/FAL] ==================== FAL partition table ====================
[I/FAL] | name       | flash_dev |   offset   |    length  |
[I/FAL] -------------------------------------------------------------
[I/FAL] | filesystem | W25Q128   | 0x00000000 | 0x01000000 |
*/

#define FS_PARTITION_NAME "filesystem"
#define FS_DEVICE_NAME    "W25Q128"

int w25q128_elmfs_demo(void)
{
    fal_init();

    struct rt_device* mtd_dev = RT_NULL;
    mtd_dev = fal_mtd_nor_device_create(FS_PARTITION_NAME);
    if ( !mtd_dev ){
        LOG_E("Can't create a mtd device on '%s' partition.", FS_PARTITION_NAME);
    }
    else{
        // 以防万一，先unmount
        dfs_unmount("/");

        if (dfs_mount(FS_DEVICE_NAME, "/", "elm", 0, 0) == 0){
            LOG_I("Filesystem initialized!");
        }
        else{
            // mkfs -t elm W25Q128
            dfs_mkfs("elm", FS_DEVICE_NAME);

            if (dfs_mount(FS_DEVICE_NAME, "/", "elm", 0, 0) == 0){
                LOG_I("Filesystem initialized!");
            }
            else{
                LOG_E("Failed to initialize filesystem!");
            }
        }
    }

    return RT_EOK;
}

MSH_CMD_EXPORT(w25q128_elmfs_demo, w25q128_elmfs_demo);
```

## 注意

demo 代码里面的 `dfs_mount` 和 `dfs_mkfs` 的参数，DEVICE_NAME, lfs 和 elm 是不一样的

## 建议

4096 扇区，挂载成 FAT，要格式化成功，至少要 800KB 以上。且还要修改格式化参数。

所以建议 4MB 以下的 FLASH 不要用 FAT，用 littlefs
