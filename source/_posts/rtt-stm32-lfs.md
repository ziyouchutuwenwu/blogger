---
title: rt-thread 下，配置 stm32 的 lfs
date: 2025-11-09 12:33:24
tags:
  - stm32
  - rt-thread
---

外挂 flash 上使用 lfs

参考的 [这里](https://www.rt-thread.org/document/site/application-note/components/dfs/an0027-littlefs/)

## 配置

### 准备

先按照外挂 flash 的配置配置好

### menuconfig

```sh
RT-Thread Components ---> Device virtual file system
  [*] Using device virtual file system

RT-Thread online packages > system packages > Littlefs: A high-integrity embedded file system
  [*] Littlefs: A high-integrity embedded file system
    (256) disk read size
    (256) disk write size
    (4096) disk block size
    (256) lfs r/w cache size
    (100) lfs enables wear leveling. 0 is disable.
    (512) lfs lookahead size
```

## 代码

w25q128_lfs_demo.c

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
#define FS_DEVICE_NAME    FS_PARTITION_NAME

int w25q128_lfs_demo(void)
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

        if (dfs_mount(FS_DEVICE_NAME, "/", "lfs", 0, 0) == 0){
            LOG_I("Filesystem initialized!");
        }
        else{
            // mkfs -t lfs filesystem
            dfs_mkfs("lfs", FS_DEVICE_NAME);

            if (dfs_mount(FS_DEVICE_NAME, "/", "lfs", 0, 0) == 0){
                LOG_I("Filesystem initialized!");
            }
            else{
                LOG_E("Failed to initialize filesystem!");
            }
        }
    }

    return RT_EOK;
}

MSH_CMD_EXPORT(w25q128_lfs_demo, w25q128_lfs_demo);
```

## 注意

demo 代码里面的`dfs_mount`和`dfs_mkfs`的参数，DEVICE_NAME, lfs 和 elm 是不一样的
