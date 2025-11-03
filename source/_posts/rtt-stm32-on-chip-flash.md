---
title: rtt-stm32-on-chip-flash
date: 2025-11-03 14:48:02
tags:
  - stm32
  - rt-thread
---

片上 flash 读写，这里介绍 FAL 的用法

## 准备工作

### FAL 准备

board/Kconfig 添加

```sh
config BSP_USING_ON_CHIP_FLASH
    bool "Enable on-chip FLASH"
    default n
```

启用 fal

```sh
RT-Thread online packages --->
  system packages --->
    [*]fal: Flash Abstraction Layer implement. Manage flash device and partition.  --->
    启用fal，如果只考虑片上flash的话，SFUD不要勾选
```

on_chip_flash 目录复制到你的 applications 目录

SConscript 添加如下

```python
CPPPATH += [cwd + '/on_chip_flash']

on_chip_flash/romfs_init.c
on_chip_flash/fal_demo.c
on_chip_flash/lfs_demo.c
on_chip_flash/elm_demo.c
```

测试命令

```sh
fal probe xxx
fal read 0 10
fal write xxx
```

### lfs 准备

`scons --menuconfig` 选中

```sh
RT-Thread Components --->
  Device virtual file system
  [*] Using device virtual file system
  注意，以下参数，尽量设置大一些：
    the maximal number of mounted file system
    the maximal number of file system type
    the maximal number of opened files
```

```sh
RT-Thread Components --->
  Device Drivers --->
    [*] Using MTD Nor Flash device drivers
```

```sh
RT-Thread Components --->
  POSIX layer and C standard library --->
    [*] Enable libc APIs from toolchain
```

```sh
RT-Thread online packages --->
  system packages --->
    [*] Littlefs: A high-integrity embedded file system  ---->
  注意:
    disk block size 是扇区大小
    lfs enable wear leveling. 0 is disable，这个设置为 100，为 0 有时候会崩
```

需要注意的地方

```sh
需要根据你需要的大小修改rtt自带驱动里面的`const struct fal_flash_dev stm32_onchip_flash_xxk`
驱动的相对路径为 `libraries/HAL_Drivers/drv_flash/drv_flash_f4.c`
这个结构体里面的blk_size为扇区大小，建议改成 `2048` 或者 `4096`
```

### romfs 准备

使用场景：如果需要挂载多个 fs，可以使用 romfs 先创建几个文件夹，然后启动以后把几个 fs 分别挂载到不同的目录

```sh
RT-Thread Components --->
  Device virtual file system
  [*] Using device virtual file system
    [*] Enable ReadOnly file system on flash
```

注意，需要使用下面的命令重新生成 romfs 的源码

```sh
python2 ./rt-thread/tools/mkromfs.py 你的文件目录 ./rt-thread/components/dfs/filesystems/romfs/romfs.c
```

## 代码

elm_demo.c

```c
#include <dfs_fs.h>
#include <fal.h>
#include <rtdbg.h>

/*
[I/FAL] ==================== FAL partition table ====================
[I/FAL] | name       | flash_dev        |   offset   |    length  |
[I/FAL] -------------------------------------------------------------
[I/FAL] | elmfs      | onchip_flash_64k | 0x00000000 | 0x00010000 |
[I/FAL] | lfs        | onchip_flash_64k | 0x00010000 | 0x00010000 |
[I/FAL] | fal_onchip | onchip_flash_64k | 0x00020000 | 0x00010000 |
[I/FAL] | filesystem | W25Q128          | 0x00900000 | 0x01000000 |
[I/FAL] =============================================================
*/

#define ELM_FS_MOUNT_POINT      "/"
#define ELM_FS_PARTITION_NAME   "elmfs"

// fal_blk_device_create 会创建一个和分区名一样的device
#define FS_DEVICE_NAME          ELM_FS_PARTITION_NAME

int elm_demo(void)
{
    fal_init();

    rt_device_t mtd_dev = RT_NULL;
    if ( rt_device_find(ELM_FS_PARTITION_NAME) == RT_NULL){
        mtd_dev = fal_blk_device_create(ELM_FS_PARTITION_NAME);
        if (!mtd_dev){
            LOG_E("Can't create a block device on '%s' partition.", ELM_FS_PARTITION_NAME);
        }
    }

    dfs_unmount("/");

    if (dfs_mount(FS_DEVICE_NAME, ELM_FS_MOUNT_POINT, "elm", 0, 0) == 0){
        LOG_W("Filesystem initialized!");
    }
    else{
        LOG_W("%s not formatted, now formatting", ELM_FS_PARTITION_NAME);
        dfs_mkfs("elm", FS_DEVICE_NAME);

        if ( dfs_mount(FS_DEVICE_NAME, ELM_FS_MOUNT_POINT, "elm", 0, 0) == 0 ){
            LOG_W("Filesystem initialized!");
        }
        else{
            LOG_E("Failed to initialize filesystem!");
        }
    }

    return RT_EOK;
}
/*
mkfs -t elm elmfs
最后一个参数为通过 fal_blk_device_create 创建出来的 block device
*/
MSH_CMD_EXPORT(elm_demo, elm_demo);
```

fal_cfg.h

```h
#ifndef _FAL_CFG_H_
#define _FAL_CFG_H_

#include <rtthread.h>
#include <board.h>

// 片上flash的编译需要
// 定义分区大小，暂时只看64k
#define PARTITION_SIZE 64

//起始地址
#define STM32_FLASH_START_ADRESS_64K (STM32_FLASH_END_ADDRESS - PARTITION_SIZE*3*1024)

//分区长度
#define FLASH_SIZE_GRANULARITY_64K 64*3*1024

// 这些必须要定义，否则编译错误
#define STM32_FLASH_START_ADRESS_16K STM32_FLASH_START_ADRESS
#define STM32_FLASH_START_ADRESS_128K STM32_FLASH_START_ADRESS

#define FLASH_SIZE_GRANULARITY_16K 16*1024
#define FLASH_SIZE_GRANULARITY_128K 128*1024
// ---------------------

// F4系列得用这个64k的
#if defined(BSP_USING_ON_CHIP_FLASH)
extern const struct fal_flash_dev stm32_onchip_flash_64k;
#endif /* BSP_USING_ON_CHIP_FLASH */

#if defined(BSP_USING_QSPI_FLASH)
extern struct fal_flash_dev nor_flash0;
#endif /* BSP_USING_QSPI_FLASH */

/* ========================= Device Configuration ========================== */
#ifdef BSP_USING_ON_CHIP_FLASH
#define ONCHIP_FLASH_DEV     &stm32_onchip_flash_64k,
#else
#define ONCHIP_FLASH_DEV
#endif /* BSP_USING_ON_CHIP_FLASH */

#ifdef BSP_USING_QSPI_FLASH
#define SPI_FLASH_DEV        &nor_flash0,
#else
#define SPI_FLASH_DEV
#endif /* BSP_USING_QSPI_FLASH */

/* flash device table */
#define FAL_FLASH_DEV_TABLE                                          \
{                                                                    \
    ONCHIP_FLASH_DEV                                                 \
    SPI_FLASH_DEV                                                    \
}

/* ====================== Partition Configuration ========================== */
#ifdef FAL_PART_HAS_TABLE_CFG

// 片上flash的设备名onchip_flash_64k是驱动里面定义好的，不能随便改
#ifdef BSP_USING_ON_CHIP_FLASH
    #define ONCHIP_FLASH_PATITION      {FAL_PART_MAGIC_WROD, "elmfs",      "onchip_flash_64k", 0,         64 * 1024, 0},      \
                                       {FAL_PART_MAGIC_WROD, "lfs",        "onchip_flash_64k", 64* 1024,  64 * 1024, 0},      \
                                       {FAL_PART_MAGIC_WROD, "fal_onchip", "onchip_flash_64k", 128* 1024, 64 * 1024, 0},
#else
#define ONCHIP_FLASH_PATITION
#endif

#ifdef BSP_USING_QSPI_FLASH
#define SPI_FLASH_PARTITION            {FAL_PART_MAGIC_WROD, "filesystem", "W25Q128", 9 * 1024 * 1024, 16 * 1024 * 1024, 0},
#else
#define SPI_FLASH_PARTITION
#endif

/* partition table */
#define FAL_PART_TABLE                                               \
{                                                                    \
    ONCHIP_FLASH_PATITION                                            \
    SPI_FLASH_PARTITION                                              \
}
#endif /* FAL_PART_HAS_TABLE_CFG */

#endif /* _FAL_CFG_H_ */
```

fal_demo.c

```c
#include <fal.h>
#include <rtdbg.h>

/*
[I/FAL] ==================== FAL partition table ====================
[I/FAL] | name       | flash_dev        |   offset   |    length  |
[I/FAL] -------------------------------------------------------------
[I/FAL] | elmfs      | onchip_flash_64k | 0x00000000 | 0x00010000 |
[I/FAL] | lfs        | onchip_flash_64k | 0x00010000 | 0x00010000 |
[I/FAL] | fal_onchip | onchip_flash_64k | 0x00020000 | 0x00010000 |
[I/FAL] | filesystem | W25Q128          | 0x00900000 | 0x01000000 |
[I/FAL] =============================================================
*/

#define DEMO_FLASH_PARTITION_NAME "fal_onchip"

int fal_demo(void)
{
    fal_init();

    const struct fal_partition* partition = fal_partition_find(DEMO_FLASH_PARTITION_NAME);

    fal_partition_erase(partition, 0x4, 2);

    char data_to_save[] = {0xa, 0xb};
    fal_partition_write(partition, 0x4, data_to_save, sizeof(data_to_save));

    // char data_to_read[2] = {0};
    // fal_partition_read(partition, 0x4, data_to_read, sizeof(data_to_read));

    // char hex_str_data_array[2] = {0};
    // hex_to_str(data_to_read, sizeof(data_to_read), hex_str_data_array);
    // rt_kprintf("data :%s\n", hex_str_data_array);

    rt_kprintf("please run cmd to check result\r\n");
    rt_kprintf("fal probe %s\r\n", DEMO_FLASH_PARTITION_NAME);
    rt_kprintf("fal read 4 2\r\n");

    return RT_EOK;
}

MSH_CMD_EXPORT(fal_demo, fal_demo);
```

lfs_demo.c

```c
#include <dfs_fs.h>
#include <fal.h>
#include <rtdbg.h>

/*
[I/FAL] ==================== FAL partition table ====================
[I/FAL] | name       | flash_dev        |   offset   |    length  |
[I/FAL] -------------------------------------------------------------
[I/FAL] | elmfs      | onchip_flash_64k | 0x00000000 | 0x00010000 |
[I/FAL] | lfs        | onchip_flash_64k | 0x00010000 | 0x00010000 |
[I/FAL] | fal_onchip | onchip_flash_64k | 0x00020000 | 0x00010000 |
[I/FAL] | filesystem | W25Q128          | 0x00900000 | 0x01000000 |
[I/FAL] =============================================================
*/

#define LFS_MOUNT_POINT     "/"
#define LFS_PARTITION_NAME  "lfs"
#define FS_DEVICE_NAME      LFS_PARTITION_NAME

int lfs_demo(void)
{
    fal_init();

    // 创建mtd设备，list_device能看到
    rt_device_t mtd_dev = RT_NULL;

    if ( rt_device_find(LFS_PARTITION_NAME) == RT_NULL){
        mtd_dev = fal_mtd_nor_device_create(LFS_PARTITION_NAME);
        if (!mtd_dev){
            LOG_E("Can't create a mtd device on '%s' partition.", LFS_PARTITION_NAME);
        }
    }

    dfs_unmount("/");

    if (dfs_mount(FS_DEVICE_NAME, LFS_MOUNT_POINT, "lfs", 0, 0) == 0){
        LOG_W("Filesystem initialized!");
    }
    else{
        LOG_W("%s not formatted, now formatting", LFS_PARTITION_NAME);
        dfs_mkfs("lfs", FS_DEVICE_NAME);

        if ( dfs_mount(FS_DEVICE_NAME, LFS_MOUNT_POINT, "lfs", 0, 0) == 0 ){
            LOG_W("Filesystem initialized!");
        }
        else{
            LOG_E("Failed to initialize filesystem!");
        }
    }

    return RT_EOK;
}

/*
mkfs -t lfs lfs
最后一个参数为通过 fal_blk_device_create 创建出来的 block device
*/
MSH_CMD_EXPORT(lfs_demo, lfs_demo);
```

romfs_init.c

```c
#include <dfs_fs.h>
#include <rtdbg.h>

extern const struct romfs_dirent romfs_root;
#define DFS_ROMFS_ROOT          (&romfs_root)

int romfs_init(void)
{
    /* mount ROMFS as root directory */
    if (dfs_mount( RT_NULL, "/", "rom", 0, (const void *)DFS_ROMFS_ROOT) == 0)
    {
        rt_kprintf("ROMFS File System initialized!\n");
    }
    else
    {
        rt_kprintf("ROMFS File System initialized Failed!\n");
    }

    return RT_EOK;
}

INIT_ENV_EXPORT(romfs_init);
```

## 注意

已知的问题：**在某些板子上，fal 和 lfs 不兼容，同时启用以后，会导致 fal 的 erase 挂掉，当然 lfs 的格式化也会挂掉**

elm 貌似格式化会报错，不管了
